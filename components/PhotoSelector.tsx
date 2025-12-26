import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useStore } from '../store';
import { AppStep } from '../types';
import { Icons } from '../constants';

const PhotoSelector: React.FC = () => {
  const { state, dispatch } = useStore();
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, visible: boolean}>({ msg: '', visible: false });
  const [imageError, setImageError] = useState(false);
  
  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Layout State
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | null>(null);
  
  const template = state.selectedTemplate;

  useEffect(() => {
    // 1. Auto-assign slots initially if empty
    if (template && Object.keys(state.slotAssignments).length === 0) {
        dispatch({ type: 'AUTO_ASSIGN_SLOTS' });
    }
    
    // 2. Set the first slot as active by default for better UX
    if (template && template.layout.slots.length > 0 && !activeSlotId) {
        setActiveSlotId(template.layout.slots[0].id);
    }
  }, [dispatch, state.slotAssignments, template, activeSlotId]);

  // Robust sizing logic to replace CSS aspect-ratio which can be flaky in nested flex containers
  useLayoutEffect(() => {
    if (!containerRef.current || !template) return;

    const updateSize = () => {
        if (!containerRef.current || !template) return;
        const { clientWidth, clientHeight } = containerRef.current;
        const { width: tW, height: tH } = template.layout;
        
        // Prevent div/0 or empty rects
        if (clientWidth === 0 || clientHeight === 0) return;

        const templateRatio = tW / tH;
        const containerRatio = clientWidth / clientHeight;

        let finalW, finalH;

        if (containerRatio > templateRatio) {
            // Container is wider than template -> Constrain by height
            // We leave some padding (e.g. 32px total vertical) if needed, but let's fit tight for max size
            const availableH = clientHeight; 
            finalH = availableH;
            finalW = finalH * templateRatio;
        } else {
            // Container is taller than template -> Constrain by width
            const availableW = clientWidth;
            finalW = availableW;
            finalH = finalW / templateRatio;
        }

        setDimensions({ width: finalW, height: finalH });
    };

    // Use ResizeObserver to handle window resize or panel resize events
    const observer = new ResizeObserver(() => {
        // Wrap in requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
        window.requestAnimationFrame(updateSize);
    });
    
    observer.observe(containerRef.current);
    updateSize(); // Initial call

    return () => observer.disconnect();
  }, [template]);

  // Toast Helper
  const showToast = (msg: string) => {
      setToast({ msg, visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  const handlePhotoSelect = (photoIndex: number) => {
    if (activeSlotId) {
        dispatch({ 
            type: 'ASSIGN_SLOT', 
            payload: { slotId: activeSlotId, photoIndex } 
        });
        showToast("Photo Assigned");
    }
  };

  const handleConfirm = () => {
    dispatch({ type: 'INCREMENT_SESSION_COUNT' });
    dispatch({ type: 'SET_STEP', payload: AppStep.RESULT });
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) return;
      
      dispatch({ 
          type: 'REORDER_PHOTOS', 
          payload: { fromIndex: draggedIndex, toIndex: dropIndex } 
      });
      setDraggedIndex(null);
  };

  if (!template) return (
      <div className="flex items-center justify-center h-full bg-zinc-900 text-white animate-pulse">
          <div className="flex flex-col items-center gap-4">
              <Icons.Aperture size={48} className="animate-spin-slow"/>
              <p className="font-mono tracking-widest text-sm">LOADING TEMPLATE...</p>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-black text-brand-black dark:text-white animate-fade-in overflow-hidden relative">
      
      {/* Toast Notification */}
      <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 pointer-events-none ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="bg-brand-black/90 text-white px-6 py-2 rounded-full font-bold text-xs tracking-widest uppercase flex items-center gap-2 shadow-xl backdrop-blur-md border border-brand-gold/30">
              <Icons.CheckCircle weight="fill" className="text-brand-gold" size={16}/>
              {toast.msg}
          </div>
      </div>

      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 z-30 shadow-sm">
         <div>
            <h2 className="text-xl font-black tracking-tight uppercase">Curate Your Session</h2>
            <p className="text-xs text-zinc-500 font-mono hidden md:block">Select a slot, then choose a photo from the roll below. Drag to reorder.</p>
         </div>
         <button 
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-3 bg-brand-blue dark:bg-brand-gold text-white dark:text-black font-bold text-sm tracking-widest hover:opacity-90 transition-opacity"
         >
            FINISH <Icons.ArrowUpRight weight="bold" />
         </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left/Top: Canvas Area */}
        {/* We use a Ref here to measure available space */}
        <div ref={containerRef} className="flex-1 bg-zinc-200 dark:bg-zinc-950 relative w-full h-full flex items-center justify-center p-4 md:p-8 overflow-hidden min-h-0 min-w-0">
             
             {/* The Stage: Explicit dimensions based on calculation */}
             {dimensions && (
                 <div 
                    className="relative shadow-2xl transition-all duration-75 ease-out box-border bg-white dark:bg-zinc-900"
                    style={{ 
                        width: dimensions.width,
                        height: dimensions.height,
                        backgroundColor: template.backgroundColor || (state.isDarkMode ? '#27272a' : '#fff')
                    }}
                 >
                    {/* 1. SLOTS LAYER (Relative % Positioning) */}
                    {template.layout.slots.map((slot, idx) => {
                        const assignedPhotoIndex = state.slotAssignments[slot.id];
                        const photoSrc = assignedPhotoIndex !== undefined ? state.capturedPhotos[assignedPhotoIndex] : null;
                        const isActive = activeSlotId === slot.id;
                        const layerOrder = slot.layerOrder || 'bottom';
                        
                        // Z-Index Logic:
                        // Bottom Slots: 10
                        // Template Overlay: 20
                        // Top Slots: 30
                        // Active Slot: 40 (Always on top for editing visibility)
                        const zIndex = isActive ? 40 : (layerOrder === 'top' ? 30 : 10);

                        return (
                            <div 
                                key={slot.id}
                                onClick={() => setActiveSlotId(slot.id)}
                                className={`
                                  absolute cursor-pointer overflow-hidden transition-all duration-200 bg-zinc-800/50
                                  ${isActive ? 'ring-4 ring-brand-blue dark:ring-brand-gold shadow-[0_0_30px_rgba(212,175,55,0.4)]' : 'hover:ring-2 ring-zinc-400 dark:ring-zinc-600'}
                                `}
                                style={{ 
                                    left: `${(slot.x / template.layout.width) * 100}%`,
                                    top: `${(slot.y / template.layout.height) * 100}%`,
                                    width: `${(slot.width / template.layout.width) * 100}%`,
                                    height: `${(slot.height / template.layout.height) * 100}%`,
                                    transform: `rotate(${slot.rotation || 0}deg)`,
                                    zIndex: zIndex
                                }}
                            >
                                {/* Empty State Placeholder */}
                                {!photoSrc && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 border border-dashed border-zinc-400">
                                      <span className="text-xl md:text-3xl font-black text-zinc-400/50">#{idx + 1}</span>
                                  </div>
                                )}

                                {/* Assigned Image */}
                                {photoSrc && (
                                    <img 
                                        src={photoSrc} 
                                        alt={`Slot ${idx}`} 
                                        className="w-full h-full object-cover object-center transform scale-x-[-1]" 
                                    />
                                )}
                                
                                {/* Active Selection Border */}
                                {isActive && (
                                    <div className="absolute inset-0 border-4 border-brand-blue dark:border-brand-gold animate-pulse pointer-events-none"></div>
                                )}
                            </div>
                        );
                    })}

                    {/* 2. TEMPLATE OVERLAY (Z-Index 20) */}
                    {/* Positioned on top of 'bottom' slots, but below 'top' slots */}
                    {!imageError ? (
                        <img 
                            src={template.imageUrl} 
                            alt="Template Overlay" 
                            onError={() => {
                                console.error("Template image failed to load", template.imageUrl);
                                setImageError(true);
                            }}
                            className="absolute inset-0 w-full h-full pointer-events-none block object-fill" 
                            style={{ zIndex: 20 }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center border-2 border-red-500 z-50 pointer-events-none bg-black/20">
                            <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded">TEMPLATE ERROR</span>
                        </div>
                    )}
                 </div>
             )}
        </div>

        {/* Right/Bottom: Photo Strip */}
        <div className="h-32 md:h-full md:w-48 bg-white dark:bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 flex md:flex-col overflow-x-auto md:overflow-y-auto p-4 gap-4 z-40 shadow-xl shrink-0 items-center md:items-stretch">
             <div className="md:hidden w-full text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 sticky left-0">
                 Drag to Reorder • Tap to Assign
             </div>
             
             {state.capturedPhotos.map((photo, idx) => {
                 const isAssigned = Object.values(state.slotAssignments).includes(idx);
                 const assignedCount = Object.values(state.slotAssignments).filter(i => i === idx).length;
                 
                 return (
                     <div 
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onClick={() => handlePhotoSelect(idx)}
                        className={`
                            flex-none w-24 h-24 md:w-full md:h-32 relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all duration-200
                            ${draggedIndex === idx ? 'opacity-40 scale-95' : 'opacity-100'}
                            ${isAssigned 
                                ? 'border-brand-blue dark:border-brand-gold ring-2 ring-offset-1 ring-offset-zinc-900 ring-brand-gold/50' 
                                : 'border-transparent hover:border-zinc-400'
                            }
                        `}
                     >
                        <img 
                            src={photo} 
                            alt={`Take ${idx + 1}`} 
                            className={`w-full h-full object-cover transform scale-x-[-1] transition-all duration-300 ${isAssigned ? 'brightness-75' : 'group-hover:brightness-110'}`} 
                        />
                        
                        {/* Number Badge */}
                        <div className="absolute bottom-0 right-0 bg-brand-blue dark:bg-brand-gold text-white dark:text-black text-[10px] font-bold px-2 py-1 z-10">
                            #{idx + 1}
                        </div>

                        {/* Used Indicator Overlay */}
                        {isAssigned && (
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="bg-brand-blue/80 dark:bg-brand-gold/80 rounded-full p-1.5 shadow-lg backdrop-blur-sm">
                                    <Icons.CheckCircle size={20} className="text-white dark:text-black" weight="fill"/>
                                </div>
                            </div>
                        )}
                        
                        {/* Multi-use count if used more than once */}
                        {assignedCount > 1 && (
                            <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white z-20">
                                x{assignedCount}
                            </div>
                        )}
                     </div>
                 );
             })}
        </div>
      </div>
    </div>
  );
};

export default PhotoSelector;