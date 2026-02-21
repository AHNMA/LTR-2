
import React from 'react';
import { Play, Image as ImageIcon, Crop, X, Plus, ChevronLeft, ChevronRight, Camera, Maximize, Layout } from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useEditor } from '../editor/EditorContext';
import { normalizeGalleryImages } from './GalleryBlock';
import AutoResizeTextarea from '../editor/AutoResizeTextarea';

export const sliderDefaults = { 
    images: [], 
    aspectRatio: 'auto', 
    crop: true
};

export const SliderEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock, setMediaPickerTarget } = useEditor();
    
    const rawImages = block.attributes?.images || [];
    const images = normalizeGalleryImages(rawImages);
    const aspectRatio = block.attributes?.aspectRatio || 'auto';
    
    // Global crop setting (defaults to true if undefined)
    const crop = block.attributes.crop !== false;

    const [activeIndex, setActiveIndex] = React.useState(0);

    const handleImageUpdate = (index: number, updates: any) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], ...updates };
        updateBlock(block.clientId, { images: newImages });
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        updateBlock(block.clientId, { images: newImages });
        if (activeIndex >= newImages.length) setActiveIndex(Math.max(0, newImages.length - 1));
    };

    // Helper for aspect ratio style
    const getAspectRatioStyle = (): React.CSSProperties => {
        if (aspectRatio === 'auto') return { aspectRatio: '16/9' }; // Fallback for auto in editor if needed, or allow natural height
        return { aspectRatio: aspectRatio.replace(':', ' / ') };
    };

    return (
        <div className={`space-y-4 w-full font-display italic`}>
            {/* Main Stage - Unified Card Design */}
            <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 group/slider">
                
                {/* Image Area */}
                <div className="relative bg-slate-900 group/image" style={getAspectRatioStyle()}>
                    {images.length > 0 ? (
                        <>
                            {images[activeIndex].url && (
                                <img 
                                    src={images[activeIndex].url} 
                                    className="w-full h-full transition-opacity duration-500 opacity-100 group-hover/image:opacity-90"
                                    style={{ objectFit: crop ? 'cover' : 'contain' }}
                                    alt="" 
                                />
                            )}
                            
                            {/* Credits (Bottom Left, Text Only, Full Width) */}
                            <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-auto">
                                <input 
                                    key={`credits-${activeIndex}`}
                                    value={images[activeIndex].credit || ''}
                                    onChange={(e) => handleImageUpdate(activeIndex, { credit: e.target.value })}
                                    className="bg-transparent border-none focus:outline-none text-white/50 hover:text-white focus:text-white transition-colors w-full font-sans text-[9px] font-black uppercase tracking-[0.2em] placeholder:text-white/20 drop-shadow-md"
                                    placeholder="CREDITS"
                                />
                            </div>

                            {/* Delete Slide Button (Top Right) */}
                            <div className="absolute top-4 right-4 z-20 pointer-events-auto opacity-0 group-hover/slider:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleRemoveImage(activeIndex)}
                                    className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow-lg"
                                    title="Slide entfernen"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Top Center Slide Counter */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                                <div className="bg-f1-pink text-white text-[10px] font-black uppercase px-3 py-1 skew-x-[-12deg] shadow-glow tabular-nums">
                                    SLIDE {activeIndex + 1} / {images.length}
                                </div>
                            </div>

                            {/* Navigation Arrows */}
                            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none z-10">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => (prev - 1 + images.length) % images.length); }}
                                    className="w-10 h-10 bg-white/10 hover:bg-f1-pink backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl transition-all pointer-events-auto border border-white/20 transform hover:-translate-x-1"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => (prev + 1) % images.length); }}
                                    className="w-10 h-10 bg-white/10 hover:bg-f1-pink backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl transition-all pointer-events-auto border border-white/20 transform hover:translate-x-1"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div 
                            onClick={() => setMediaPickerTarget({ clientId: block.clientId, isCollection: true })}
                            className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-800 transition-colors group"
                        >
                            <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-4 group-hover:border-f1-pink group-hover:text-f1-pink transition-all">
                                <Plus size={32} />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">Bilder-Galerie erstellen</span>
                            <p className="text-[10px] uppercase mt-2 opacity-40">Klicken um Medienbibliothek zu öffnen</p>
                        </div>
                    )}
                </div>

                {/* Separator Line (Like Image Block) */}
                <div className="h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div>

                {/* Unified Caption Area (Like Image Block) */}
                {images.length > 0 && (
                    <div className="p-4 bg-white/5">
                        <AutoResizeTextarea
                            key={`caption-${activeIndex}`}
                            value={images[activeIndex].alt || ''}
                            onChange={(e) => handleImageUpdate(activeIndex, { alt: e.target.value })}
                            className="w-full bg-transparent border-none focus:outline-none text-white font-display font-bold uppercase italic text-2xl tracking-wide placeholder:text-white/20 resize-none"
                            placeholder={`BILDUNTERSCHRIFT (SLIDE ${activeIndex + 1})...`}
                        />
                    </div>
                )}
            </div>

            {/* Thumbnail Strip (F1 Pitlane Style) */}
            {images.length > 0 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar px-1">
                    {images.map((img: any, i: number) => (
                        <div 
                            key={img.id || i}
                            onClick={() => setActiveIndex(i)}
                            className={`relative w-16 h-10 rounded overflow-hidden shrink-0 cursor-pointer transition-all duration-300 border-2 ${i === activeIndex ? 'border-f1-pink opacity-100 shadow-glow scale-105' : 'border-transparent opacity-40 hover:opacity-80 hover:border-white/30'}`}
                        >
                            {img.url && <img src={img.url} className="w-full h-full object-cover" alt="" />}
                        </div>
                    ))}
                    <button 
                        onClick={() => setMediaPickerTarget({ clientId: block.clientId, isCollection: true })}
                        className="w-16 h-10 rounded border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-400 hover:text-f1-pink hover:border-f1-pink transition-all shrink-0 bg-white/5"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export const SliderInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();

    // Ratios as requested
    const ratios = ['auto', '1:1', '4:3', '3:4', '3:2', '2:2', '16:9', '9:16', '21:9'];

    return (
        <div className="space-y-6 font-sans">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Seitenverhältnis
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {ratios.map(ratio => (
                        <button 
                            key={ratio}
                            onClick={() => updateBlock(block.clientId, { aspectRatio: ratio })}
                            className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${block.attributes?.aspectRatio === ratio || (!block.attributes?.aspectRatio && ratio === 'auto') ? 'bg-f1-pink text-white border-f1-pink shadow-glow' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                        >
                            {ratio === 'auto' ? 'Auto' : ratio}
                        </button>
                    ))}
                </div>
            </div>

            {/* Crop Toggle */}
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer" onClick={() => updateBlock(block.clientId, { crop: !block.attributes?.crop })}>
                    <span className="text-xs font-bold text-slate-700 uppercase flex items-center">
                        <Crop size={14} className="mr-2 text-slate-400" /> Ausfüllen (Crop)
                    </span>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${block.attributes?.crop !== false ? 'bg-f1-pink' : 'bg-slate-300'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${block.attributes?.crop !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};