
import React, { useState } from 'react';
import { Image as ImageIcon, Crop, Camera } from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useEditor } from '../editor/EditorContext';
import AutoResizeTextarea from '../editor/AutoResizeTextarea';

// --- Editor Component ---
export const ImageEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock, setMediaPickerTarget } = useEditor();
    
    const { 
        url, credits, alt,
        aspectRatio = 'auto', 
        crop = true
    } = block.attributes;

    // Logic: Use container for aspect ratio to enforce shape
    const isCustomRatio = aspectRatio && aspectRatio !== 'auto';
    
    const containerStyles: React.CSSProperties = isCustomRatio ? {
        aspectRatio: aspectRatio.replace(':', ' / ')
    } : {};

    const imgStyles: React.CSSProperties = {
        objectFit: crop ? 'cover' : 'contain',
    };

    if (isCustomRatio) {
        imgStyles.width = '100%';
        imgStyles.height = '100%';
    } else {
        imgStyles.width = '100%';
        imgStyles.height = 'auto';
    }

    return (
        <div className="relative group/img transition-all duration-500 font-display italic w-full">
            {url ? (
                <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 group/container">
                    {/* Image Area */}
                    <div 
                        className="relative bg-slate-900"
                        style={containerStyles}
                    >
                        {url && (
                            <img 
                                src={url} 
                                className={`block transition-opacity duration-500 opacity-100 group-hover/container:opacity-90 ${isCustomRatio ? 'absolute inset-0 w-full h-full' : 'w-full'}`}
                                style={imgStyles}
                                alt="" 
                            />
                        )}
                        
                        {/* CREDITS: Bottom Left, Text Only, Full Width */}
                        <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-auto">
                            <input 
                                value={credits || ''}
                                onChange={(e) => updateBlock(block.clientId, { credits: e.target.value })}
                                className="bg-transparent border-none focus:outline-none text-white/50 hover:text-white focus:text-white transition-colors placeholder:text-white/20 w-full font-sans text-[9px] font-black uppercase tracking-[0.2em] drop-shadow-md"
                                placeholder="FOTO CREDITS"
                            />
                        </div>

                        {/* Editor Action Buttons (Top Left - Hover Only) */}
                        <div className="absolute top-4 left-4 flex space-x-2 opacity-0 group-hover/container:opacity-100 transition-opacity z-30">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setMediaPickerTarget({ clientId: block.clientId }); }}
                                className="bg-white/90 backdrop-blur text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white shadow-lg transition-colors font-sans"
                            >
                                Bild ändern
                            </button>
                        </div>
                    </div>

                    {/* Separator Line */}
                    <div className="h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div>
                    
                    {/* Caption Input */}
                    <div className="p-4 bg-white/5">
                        <AutoResizeTextarea
                            value={alt || ''}
                            onChange={(e) => updateBlock(block.clientId, { alt: e.target.value })}
                            className="w-full bg-transparent border-none focus:outline-none text-white font-display font-bold uppercase italic text-2xl tracking-wide placeholder:text-white/20 resize-none"
                            placeholder="BILDUNTERSCHRIFT EINGEBEN..."
                        />
                    </div>
                </div>
            ) : (
                <div 
                    onClick={(e) => { e.stopPropagation(); setMediaPickerTarget({ clientId: block.clientId }); }}
                    className="aspect-video bg-slate-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 text-slate-400 hover:text-f1-pink transition-all border-2 border-dashed border-slate-200 group/btn"
                >
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-3 group-hover/btn:border-f1-pink group-hover/btn:scale-110 transition-all">
                        <ImageIcon size={32} className="opacity-40" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest font-sans">Bild aus Bibliothek wählen</span>
                </div>
            )}
        </div>
    );
};

// --- Inspector Component ---
export const ImageInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();

    // Ratios: Auto + others
    const ratios = ['auto', '1:1', '4:3', '3:4', '3:2', '2:3', '16:9', '9:16', '21:9'];
    
    // Default crop to true if undefined
    const isCrop = block.attributes.crop !== false;

    return (
        <div className="space-y-6 font-sans">
            {/* Aspect Ratio */}
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Seitenverhältnis</label>
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
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer" onClick={() => updateBlock(block.clientId, { crop: !isCrop })}>
                    <span className="text-xs font-bold text-slate-700 uppercase flex items-center">
                        <Crop size={14} className="mr-2 text-slate-400" /> Ausfüllen (Crop)
                    </span>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isCrop ? 'bg-f1-pink' : 'bg-slate-300'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isCrop ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const defaultAttributes = { 
    url: '', alt: '', credits: '', 
    aspectRatio: 'auto', 
    align: 'center', 
    resolution: 'original',
    crop: true,
    viewMode: 'preview'
};