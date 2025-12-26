import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { database as db } from '../services/database';
import { AppStep, LayoutSlot } from '../types';
import { Icons } from '../constants';

const ResultView: React.FC = () => {
  const { state, dispatch } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  
  // Explicitly track resolution for UI display
  const [resolution, setResolution] = useState({ w: 0, h: 0 });

  // Helper: Draw Image with Object-Fit: Cover logic
  const drawImageCover = (
      ctx: CanvasRenderingContext2D, 
      img: HTMLImageElement, 
      x: number, y: number, w: number, h: number,
      mirror: boolean = true
  ) => {
      // Safety check
      if (!img || img.width === 0 || img.height === 0) return;

      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

      if (imgRatio > targetRatio) {
          // Image is wider than target
          sHeight = img.height;
          sWidth = sHeight * targetRatio;
          sx = (img.width - sWidth) / 2;
      } else {
          // Image is taller than target
          sWidth = img.width;
          sHeight = sWidth / targetRatio;
          sy = (img.height - sHeight) / 2;
      }

      ctx.save();
      // Enable high quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Move to render position (which is usually relative to current context origin)
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.translate(cx, cy);
      
      // Mirror if requested (standard for selfie booth results)
      if (mirror) ctx.scale(-1, 1);
      
      // Draw centered at (0,0) in the transformed context
      ctx.drawImage(img, sx, sy, sWidth, sHeight, -w / 2, -h / 2, w, h);
      
      ctx.restore();
  };

  // Generate Composite
  useEffect(() => {
    const generateComposite = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !state.selectedTemplate) return;

      if (state.capturedPhotos.length === 0) {
        setError("No photos found. Please restart session.");
        setIsProcessing(false);
        return;
      }

      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // STRICTLY use the layout dimensions defined in the template data
        const layout = state.selectedTemplate.layout;
        // Use Ceiling to ensure we cover any sub-pixel gaps on edges, but floats are fine internally
        const effectiveWidth = Math.ceil(layout.width);
        const effectiveHeight = Math.ceil(layout.height);

        // Apply Logic
        canvas.width = effectiveWidth;
        canvas.height = effectiveHeight;
        setResolution({ w: effectiveWidth, h: effectiveHeight });
        
        // 1. LAYER 0: Background Color
        ctx.clearRect(0, 0, effectiveWidth, effectiveHeight);
        ctx.fillStyle = state.selectedTemplate.backgroundColor || '#050505';
        ctx.fillRect(0, 0, effectiveWidth, effectiveHeight);

        // 2. Pre-Load All User Photos
        const userImages = await Promise.all(
            state.capturedPhotos.map((src, idx) => {
                return new Promise<HTMLImageElement>((resolve) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => resolve(img);
                    img.onerror = () => {
                        console.warn(`Failed to load photo ${idx}`);
                        resolve(new Image()); 
                    };
                    img.src = src;
                });
            })
        );

        // Helper to draw slots based on layer order
        const drawSlots = (order: 'bottom' | 'top') => {
            for (const slot of layout.slots) {
                // Default to 'bottom' if undefined
                const slotOrder = slot.layerOrder || 'bottom';
                if (slotOrder !== order) continue;

                const assignedIndex = state.slotAssignments[slot.id];
                const photoIndex = (assignedIndex !== undefined && assignedIndex < userImages.length) 
                    ? assignedIndex 
                    : (slot.targetTakeIndex < userImages.length ? slot.targetTakeIndex : 0);
                
                const img = userImages[photoIndex];
                
                if (img && img.width > 0) {
                    ctx.save();
                    
                    // 1. Move to Center of the Slot (Global Coordinates)
                    const cx = slot.x + slot.width / 2;
                    const cy = slot.y + slot.height / 2;
                    ctx.translate(cx, cy);

                    // 2. Rotate Context around Center
                    if (slot.rotation) {
                        ctx.rotate((slot.rotation * Math.PI) / 180);
                    }

                    // 3. Draw Image Relative to Center (Local Coordinates: -w/2, -h/2)
                    // drawImageCover handles the aspect ratio cropping and mirroring internally
                    drawImageCover(ctx, img, -slot.width / 2, -slot.height / 2, slot.width, slot.height);
                    
                    ctx.restore();
                }
            }
        };

        // 3. LAYER 1: Bottom Photos (Behind Template)
        drawSlots('bottom');

        // 4. LAYER 2: Template Overlay
        await new Promise<void>((resolve) => { 
            const overlayImg = new Image();
            overlayImg.crossOrigin = "anonymous";
            overlayImg.onload = () => {
                ctx.drawImage(overlayImg, 0, 0, layout.width, layout.height);
                resolve();
            };
            overlayImg.onerror = (e) => {
                console.warn("Failed to load overlay", e);
                resolve();
            };
            overlayImg.src = state.selectedTemplate!.imageUrl;
        });

        // 5. LAYER 3: Top Photos (Over Template)
        drawSlots('top');

        // 6. Generate Data URL & Upload logic
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCompositeUrl(dataUrl);
        setIsProcessing(false);

        // Async Background Upload of both Raw and Final
        const uploadBackground = async () => {
            // Upload Raw
            const uploadedPhotoUrls: string[] = [];
            for (const photoBase64 of state.capturedPhotos) {
                const url = await db.uploadPhotoToStorage(photoBase64);
                uploadedPhotoUrls.push(url);
            }
            // Upload Composite
            const finalCompositeUrl = await db.uploadPhotoToStorage(dataUrl);

            // Save Session with new structure
            const savedSession = await db.saveSession(
                state.selectedTemplate!.id, 
                uploadedPhotoUrls, 
                finalCompositeUrl
            );
            setCurrentSessionId(savedSession.id);
        };
        uploadBackground().catch(err => console.error("Background upload failed:", err));

      } catch (err) {
          console.error("Render Error:", err);
          setError("Failed to render result image.");
          setIsProcessing(false);
      }
    };

    const t = setTimeout(generateComposite, 100);
    return () => clearTimeout(t);
  }, [state.capturedPhotos, state.selectedTemplate, state.slotAssignments]);

  const handleDownload = async () => {
    if (compositeUrl) {
      const link = document.createElement('a');
      link.href = compositeUrl;
      link.download = `AfterHours-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (currentSessionId) {
          // Optional: We might NOT want to delete the session immediately if we want Admin to see it?
          // For now, prompt implies Admin Gallery lists "Recent Sessions", so let's KEEP IT
          // await db.deleteSession(currentSessionId); 
          // If the requirement is "The Admin needs to see the Final Composited Image", 
          // we should NOT delete it immediately on download.
          console.log("Session kept for Admin Gallery:", currentSessionId);
      }
    }
  };

  const handleNewSession = () => {
    dispatch({ type: 'RESET_SESSION' });
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full max-w-7xl mx-auto p-6 gap-8 animate-fade-in items-center justify-center">
      {/* Left: Controls */}
      <div className="flex-1 flex flex-col justify-center order-2 md:order-1 w-full max-w-md">
        <h2 className="text-4xl font-extrabold text-brand-black dark:text-white mb-2">SESSION COMPLETE</h2>
        
        {error ? (
           <p className="text-red-500 mb-8 font-mono">{error}</p>
        ) : (
           <p className="text-zinc-500 mb-8">
               Your photo is ready. <br/>
               <span className="text-xs font-mono text-brand-blue dark:text-brand-gold">
                   NATIVE RESOLUTION: {resolution.w}x{resolution.h}px
               </span>
           </p>
        )}

        <div className="space-y-4 w-full">
          <button 
            onClick={handleDownload}
            disabled={!compositeUrl}
            className="w-full flex items-center justify-center gap-3 py-4 bg-brand-blue dark:bg-brand-gold hover:opacity-90 text-white dark:text-black font-bold tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icons.Download weight="bold" /> DOWNLOAD ORIGINAL
          </button>
          
          <button 
            onClick={handleNewSession}
            className="w-full py-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-brand-blue dark:hover:border-white text-brand-black dark:text-white font-bold tracking-wider transition-all"
          >
            NEW SESSION
          </button>
        </div>

        {/* --- RETENTION POLICY WARNING --- */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
             <div className="text-yellow-500 mt-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"></path>
                 </svg>
             </div>
             <div>
                 <h4 className="text-yellow-500 font-bold text-xs uppercase tracking-widest mb-1">Server Retention Policy</h4>
                 <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                     Photos are automatically deleted from our secure server after <span className="text-brand-black dark:text-white font-bold">24 hours</span> to protect your privacy. Please download your files immediately.
                 </p>
             </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="flex-1 flex items-center justify-center order-1 md:order-2 bg-zinc-200 dark:bg-zinc-900/50 p-4 rounded-lg overflow-hidden w-full h-[60vh] md:h-[80vh] relative">
        <canvas 
            ref={canvasRef} 
            className="shadow-2xl border-4 border-white dark:border-zinc-900" 
            style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                display: isProcessing && !compositeUrl ? 'none' : 'block'
            }}
        />
        
        {(isProcessing && !compositeUrl) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-blue dark:text-brand-gold animate-pulse bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm z-10">
             <div className="animate-spin mb-4"><Icons.Lightning size={48} weight="fill"/></div>
             <span className="font-mono text-xs tracking-widest">RENDERING HIGH-RES...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultView;