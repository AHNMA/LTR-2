
import React from 'react';
import { Layers, Image as ImageIcon, Crop, AlignLeft, AlignCenter, AlignRight, GripVertical, X, Plus, Camera } from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useEditor } from '../editor/EditorContext';
import AutoResizeTextarea from '../editor/AutoResizeTextarea';

// --- Utils ---
export const normalizeGalleryImages = (images: any[]) => {
    return images.map(img => {
        if (typeof img === 'string') {
            return {
                id: Math.random().toString(36).substr(2, 9),
                url: img,
                credit: '',
                alt: '', // Legacy individual alt, kept for internal structure but not displayed as main caption
                crop: true,
                align: 'center'
            };
        }
        if (!img.id) img.id = Math.random().toString(36).substr(2, 9);
        return img;
    });
};

// --- Editor Component ---
export const GalleryEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock, setMediaPickerTarget } = useEditor();
    
    const columns = block.attributes?.columns || 2;
    const rawImages = block.attributes?.images || [];
    const images = normalizeGalleryImages(rawImages);
    const aspectRatio = block.attributes?.aspectRatio || 'auto';
    const globalCaption = block.attributes?.caption || '';
    
    // Global crop setting (defaults to true if undefined)
    const crop = block.attributes.crop !== false;

    const handleImageUpdate = (index: number, updates: any) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], ...updates };
        updateBlock(block.clientId, { images: newImages });
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        updateBlock(block.clientId, { images: newImages });
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('dragIndex', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = Number(e.dataTransfer.getData('dragIndex'));
        if (dragIndex === dropIndex) return;

        const newImages = [...images];
        const [movedItem] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, movedItem);
        updateBlock(block.clientId, { images: newImages });
    };

    // Helper for aspect ratio style used in both images and the add button
    const getAspectRatioStyle = (): React.CSSProperties => ({
        aspectRatio: (aspectRatio && aspectRatio !== 'auto') ? aspectRatio.replace(':', ' / ') : '4/3'
    });

    return (
        <div className="w-full font-display italic transition-all duration-500">
            
            {/* Main Card Container */}
            <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 group/container">
                
                {/* Grid Area with Padding - Neutral Background (Removed Slate/Blue) */}
                <div className="p-4 bg-black/20">
                    <div 
                        className="grid gap-4" 
                        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                    >
                        {images.map((img: any, i: number) => {
                            const imgAlign = img.align || 'center';
                            const objectPosition = {
                                'left': 'left center',
                                'center': 'center center',
                                'right': 'right center'
                            }[imgAlign as string] || 'center center';

                            return (
                                <div 
                                    key={img.id || i} 
                                    className="relative rounded-xl overflow-hidden border border-white/10 group/item bg-neutral-800 shadow-md transition-transform z-10"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, i)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, i)}
                                >
                                    <div className="relative w-full overflow-hidden" style={getAspectRatioStyle()}>
                                        {img.url && (
                                            <img 
                                                src={img.url} 
                                                className="absolute inset-0 w-full h-full transition-opacity duration-500 opacity-100 group-hover/item:opacity-90"
                                                style={{ objectFit: crop ? 'cover' : 'contain', objectPosition: objectPosition }}
                                                alt="" 
                                            />
                                        )}
                                        
                                        {/* Credits (Bottom Left, Text Only, Full Width, Multiline) */}
                                        <div className="absolute bottom-2 left-2 right-2 z-30">
                                            <AutoResizeTextarea
                                                value={img.credit || ''}
                                                onChange={(e) => handleImageUpdate(i, { credit: e.target.value })}
                                                className="bg-transparent border-none focus:outline-none text-white/50 hover:text-white focus:text-white transition-colors w-full font-sans text-[8px] font-black uppercase tracking-[0.2em] placeholder:text-white/20 drop-shadow-md resize-none overflow-hidden leading-tight"
                                                placeholder="CREDITS"
                                            />
                                        </div>

                                        {/* Edit Controls (Top Left) */}
                                        <div className="absolute top-2 left-2 flex space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-30">
                                            <div className="p-1.5 bg-black/40 text-white/50 rounded cursor-grab hover:bg-black/60 hover:text-white transition-colors"><GripVertical size={10} /></div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleRemoveImage(i); }}
                                                className="p-1.5 rounded text-white bg-red-600 hover:bg-red-700 shadow-md"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {images.length < 24 && (
                            <button 
                                onClick={() => setMediaPickerTarget({ clientId: block.clientId, isCollection: true })}
                                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 text-neutral-500 hover:text-f1-pink hover:border-f1-pink transition-all bg-white/5 w-full group/btn"
                                style={getAspectRatioStyle()}
                            >
                                <Plus size={24} className="mb-2 group-hover/btn:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest font-sans">Bild hinzufügen</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Separator Line */}
                <div className="h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div>

                {/* Global Caption Area (Image Block Style) */}
                <div className="p-4 bg-white/5">
                    <AutoResizeTextarea
                        value={globalCaption}
                        onChange={(e) => updateBlock(block.clientId, { caption: e.target.value })}
                        className="w-full bg-transparent border-none focus:outline-none text-white font-display font-bold uppercase italic text-2xl tracking-wide placeholder:text-white/20 resize-none"
                        placeholder="GALERIE-BILDUNTERSCHRIFT EINGEBEN..."
                    />
                </div>

            </div>
        </div>
    );
};

// --- Inspector Component ---
export const GalleryInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();

    // Ratios as requested
    const ratios = ['auto', '1:1', '4:3', '3:4', '3:2', '2:2', '16:9', '9:16', '21:9'];

    return (
        <div className="space-y-6 font-sans">
            {/* 1. Aspect Ratio */}
            <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-2">Seitenverhältnis (Bilder)</label>
                <div className="grid grid-cols-3 gap-2">
                    {ratios.map(ratio => (
                        <button 
                            key={ratio}
                            onClick={() => updateBlock(block.clientId, { aspectRatio: ratio })}
                            className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${block.attributes?.aspectRatio === ratio || (!block.attributes?.aspectRatio && ratio === 'auto') ? 'bg-f1-pink text-white border-f1-pink shadow-glow' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'}`}
                        >
                            {ratio === 'auto' ? 'Auto' : ratio}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Crop Toggle */}
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50 cursor-pointer" onClick={() => updateBlock(block.clientId, { crop: !block.attributes?.crop })}>
                    <span className="text-xs font-bold text-neutral-700 uppercase flex items-center">
                        <Crop size={14} className="mr-2 text-neutral-400" /> Ausfüllen (Crop)
                    </span>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${block.attributes?.crop !== false ? 'bg-f1-pink' : 'bg-neutral-300'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${block.attributes?.crop !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                </div>
            </div>

            {/* 3. Columns */}
            <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-2">Spalten (Columns)</label>
                <div className="flex items-center space-x-2">
                    <input 
                        type="range" min="1" max="6" 
                        className="w-full accent-f1-pink cursor-pointer" 
                        value={block.attributes?.columns || 2} 
                        onChange={e => updateBlock(block.clientId, { columns: parseInt(e.target.value) })} 
                    />
                    <span className="text-xs font-bold w-6 text-center bg-neutral-100 rounded py-1">{block.attributes?.columns || 2}</span>
                </div>
            </div>
        </div>
    );
};

export const defaultAttributes = { 
    images: [], 
    columns: 2, 
    aspectRatio: 'auto', 
    crop: true,
    caption: '' 
};