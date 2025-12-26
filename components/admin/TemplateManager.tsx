import React, { useRef, useState, useEffect } from 'react';
import { database as db } from '../../services/database';
import { LayoutSlot, Template } from '../../types';
import { Icons } from '../../constants';

interface TemplateManagerProps {
    onCancel: () => void;
    onSaveSuccess: () => void;
    initialTemplate?: Template | null;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onCancel, onSaveSuccess, initialTemplate }) => {
    // File & Image State
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imgMeta, setImgMeta] = useState<{ width: number; height: number } | null>(null);
    const [bgColor, setBgColor] = useState('#ffffff');
    const [name, setName] = useState('');

    // Canvas State
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [slots, setSlots] = useState<LayoutSlot[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    
    // Interaction State
    const [isDrawing, setIsDrawing] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Initialization for Edit Mode
    useEffect(() => {
        if (initialTemplate) {
            setName(initialTemplate.name);
            setImageUrl(initialTemplate.imageUrl);
            setSlots(initialTemplate.layout.slots);
            setBgColor(initialTemplate.backgroundColor || '#ffffff');
            setImgMeta({ width: initialTemplate.layout.width, height: initialTemplate.layout.height });
        }
    }, [initialTemplate]);

    // Handle File Upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setName(f.name.replace(/\.[^/.]+$/, ""));
            
            const url = URL.createObjectURL(f);
            setImageUrl(url);
            
            // Get Dimensions
            const img = new Image();
            img.onload = () => {
                setImgMeta({ width: img.naturalWidth, height: img.naturalHeight });
                setSlots([]); // Reset slots on new file
            };
            img.src = url;
        }
    };

    // --- CANVAS LOGIC ---

    const getCanvasCoords = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas || !imgMeta) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = imgMeta.width / rect.width;
        const scaleY = imgMeta.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !imageUrl || !imgMeta) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // 1. Draw Background & Image
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, imgMeta.width, imgMeta.height);
            
            // Draw original image (overlay)
            ctx.drawImage(img, 0, 0, imgMeta.width, imgMeta.height);
            
            // 2. Draw Slots
            slots.forEach((slot, idx) => {
                const isSelected = slot.id === selectedSlotId;
                
                // Fill (Semi-transparent)
                ctx.fillStyle = isSelected ? 'rgba(212, 175, 55, 0.3)' : 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
                
                // Stroke
                ctx.lineWidth = isSelected ? 4 : 2;
                ctx.strokeStyle = isSelected ? '#D4AF37' : '#fff';
                ctx.strokeRect(slot.x, slot.y, slot.width, slot.height);

                // Label
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 40px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText((slot.targetTakeIndex + 1).toString(), slot.x + slot.width / 2, slot.y + slot.height / 2);
            });

            // 3. Draw Active Dragging Rect
            if (isDrawing && dragStart && canvasRef.current) {
                 // We can't easily get current mouse pos here without state, 
                 // but drawing logic usually runs on animation frame or event.
                 // Handled in mouse move.
            }
        };
        img.src = imageUrl;
    };

    // Redraw whenever state changes
    useEffect(() => {
        drawCanvas();
    }, [imageUrl, slots, selectedSlotId, bgColor]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!imgMeta) return;
        const coords = getCanvasCoords(e);
        
        // 1. Check Hit Test on Existing Slots
        // Reverse order to select top-most first
        const hitSlot = [...slots].reverse().find(s => 
            coords.x >= s.x && 
            coords.x <= s.x + s.width && 
            coords.y >= s.y && 
            coords.y <= s.y + s.height
        );

        if (hitSlot) {
            setSelectedSlotId(hitSlot.id);
            // Logic for move/resize could be added here, but keeping it simple as "Draw Mapper"
        } else {
            // Start Drawing New Slot
            setSelectedSlotId(null);
            setIsDrawing(true);
            setDragStart(coords);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !dragStart || !imgMeta) return;
        const coords = getCanvasCoords(e);
        
        // Re-render canvas with transient rectangle
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // We rely on the base drawCanvas to clear/redraw bg, then we add current rect
        drawCanvas(); 
        
        // Wait for image load in drawCanvas is async, so we might flicker. 
        // For a robust implementation, we'd cache the image.
        // Simplified: Just drawing rect on top for now assuming sync draw.
        
        const w = coords.x - dragStart.x;
        const h = coords.y - dragStart.y;
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(dragStart.x, dragStart.y, w, h);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (isDrawing && dragStart) {
            const coords = getCanvasCoords(e);
            const w = coords.x - dragStart.x;
            const h = coords.y - dragStart.y;
            
            if (Math.abs(w) > 20 && Math.abs(h) > 20) {
                // Normalize negative width/height
                const newSlot: LayoutSlot = {
                    id: `slot_${Date.now()}`,
                    x: w < 0 ? coords.x : dragStart.x,
                    y: h < 0 ? coords.y : dragStart.y,
                    width: Math.abs(w),
                    height: Math.abs(h),
                    targetTakeIndex: slots.length, // Auto increment
                    rotation: 0,
                    layerOrder: 'bottom'
                };
                setSlots([...slots, newSlot]);
                setSelectedSlotId(newSlot.id);
            }
            setIsDrawing(false);
            setDragStart(null);
        }
    };

    const handleSave = async () => {
        if (!name || !imgMeta) return;
        setIsSaving(true);
        try {
            const layout = { width: imgMeta.width, height: imgMeta.height, slots };
            
            if (initialTemplate) {
                await db.updateTemplate(initialTemplate.id, {
                    name,
                    backgroundColor: bgColor,
                    layout
                });
            } else {
                if (file) {
                    await db.uploadTemplate(file, layout, bgColor);
                }
            }
            onSaveSuccess();
        } catch (error) {
            console.error(error);
            alert("Failed to save template. Check console.");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteSelectedSlot = () => {
        if (selectedSlotId) {
            setSlots(slots.filter(s => s.id !== selectedSlotId));
            setSelectedSlotId(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white animate-fade-in">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="text-zinc-400 hover:text-white transition-colors">
                        <Icons.CaretLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold">{initialTemplate ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}</h2>
                        <p className="text-xs text-zinc-500 font-mono">CANVAS MAPPER MODE</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Template Name"
                        className="bg-zinc-800 border-none rounded px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-brand-gold outline-none w-48"
                    />
                     <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 uppercase">Bg:</span>
                        <input 
                            type="color" 
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                        />
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || slots.length === 0}
                        className="px-6 py-2 bg-brand-gold text-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'SAVING...' : 'SAVE TEMPLATE'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Canvas Area */}
                <div className="flex-1 bg-zinc-900/50 p-8 overflow-auto flex items-center justify-center relative">
                    {!imageUrl ? (
                        <div className="text-center p-12 border-2 border-dashed border-zinc-700 rounded-xl hover:border-brand-gold transition-colors cursor-pointer relative">
                             <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/png" />
                             <Icons.Download className="mx-auto mb-4 rotate-180 text-zinc-500" size={48} />
                             <h3 className="text-xl font-bold mb-2">UPLOAD FRAME (PNG)</h3>
                             <p className="text-zinc-500 text-sm">Transparent PNGs recommended</p>
                        </div>
                    ) : (
                        <div className="relative shadow-2xl border border-zinc-800" style={{ fontSize: 0 }}>
                            <canvas
                                ref={canvasRef}
                                width={imgMeta?.width}
                                height={imgMeta?.height}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                className="max-w-full max-h-[80vh] object-contain cursor-crosshair bg-[url('https://t4.ftcdn.net/jpg/02/69/48/94/360_F_269489484_6G7Q6G8q6G8q6G8q6G8q6G8q6G8q6G8q.jpg')]"
                                style={{
                                    // Checkerboard pattern for transparency visual
                                    backgroundImage: `
                                        linear-gradient(45deg, #222 25%, transparent 25%), 
                                        linear-gradient(-45deg, #222 25%, transparent 25%), 
                                        linear-gradient(45deg, transparent 75%, #222 75%), 
                                        linear-gradient(-45deg, transparent 75%, #222 75%)
                                    `,
                                    backgroundSize: '20px 20px',
                                    backgroundColor: '#111'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar Controls */}
                <div className="w-72 bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Slot Config</h3>
                    
                    {selectedSlotId ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="p-4 bg-zinc-800 rounded border border-zinc-700">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-brand-gold font-bold">SELECTED SLOT</span>
                                    <button onClick={deleteSelectedSlot} className="text-red-500 hover:text-red-400">
                                        <Icons.X size={16} />
                                    </button>
                                </div>
                                {slots.map(s => s.id === selectedSlotId && (
                                    <div key={s.id} className="space-y-3">
                                        <div>
                                            <label className="text-[10px] uppercase text-zinc-500 block mb-1">Target Photo Index (0-2)</label>
                                            <input 
                                                type="number" 
                                                value={s.targetTakeIndex} 
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    setSlots(slots.map(slot => slot.id === s.id ? { ...slot, targetTakeIndex: val } : slot));
                                                }}
                                                className="w-full bg-zinc-900 border border-zinc-700 px-2 py-1 text-sm font-mono focus:border-brand-gold outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-zinc-500 block mb-1">Layer Order</label>
                                            <div className="flex bg-zinc-900 rounded p-1">
                                                <button 
                                                    onClick={() => setSlots(slots.map(slot => slot.id === s.id ? { ...slot, layerOrder: 'bottom' } : slot))}
                                                    className={`flex-1 text-[10px] font-bold py-1 ${s.layerOrder !== 'top' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                                                >
                                                    BEHIND
                                                </button>
                                                <button 
                                                    onClick={() => setSlots(slots.map(slot => slot.id === s.id ? { ...slot, layerOrder: 'top' } : slot))}
                                                    className={`flex-1 text-[10px] font-bold py-1 ${s.layerOrder === 'top' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                                                >
                                                    FRONT
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-zinc-500 text-sm italic p-4 text-center border border-dashed border-zinc-800 rounded">
                            Select a slot on the canvas or click and drag to draw a new one.
                        </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-zinc-800">
                         <div className="text-[10px] text-zinc-500 font-mono mb-2">INSTRUCTIONS</div>
                         <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4">
                             <li>Upload a PNG frame (transparent center).</li>
                             <li><strong>Draw:</strong> Click & Drag on canvas to define photo area.</li>
                             <li><strong>Select:</strong> Click existing box to edit properties.</li>
                             <li>Ensure 'Target Index' matches camera sequence (0=1st, 1=2nd, etc).</li>
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateManager;