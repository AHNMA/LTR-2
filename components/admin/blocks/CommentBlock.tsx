
import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, User } from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useEditor } from '../editor/EditorContext';
import AutoResizeTextarea from '../editor/AutoResizeTextarea';

export const CommentEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();
    const { blockSize = 'full', align = 'center', style = 'card' } = block.attributes;
    const isCard = style === 'card';

    // Width Calculation based on Fractions (Matches ListBlock logic)
    const widthClass = isCard ? ({
        'small': 'w-full md:w-1/3',
        'medium': 'w-full md:w-2/3',
        'large': 'w-full md:w-5/6',
        'full': 'w-full'
    }[blockSize as string] || 'w-full') : 'w-full';

    const alignClass = isCard ? ({
        'left': 'mr-auto',
        'center': 'mx-auto',
        'right': 'ml-auto'
    }[align as string] || 'mx-auto') : '';

    // 1. STYLE: SIMPLE (Minimalist, Left Border)
    if (!isCard) {
        return (
            <div className="w-full border-l-4 border-f1-pink pl-6 py-4 font-display italic">
                <div className="flex items-center mb-2">
                    <div className="bg-f1-pink text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest mr-3 font-sans">
                        {block.attributes.author || 'AUTOR'}
                    </div>
                </div>
                <div className="w-full">
                    <AutoResizeTextarea 
                        value={block.attributes.content || ''} 
                        onChange={(e) => updateBlock(block.clientId, { content: e.target.value })} 
                        className="bg-transparent text-xl md:text-2xl font-bold italic w-full outline-none placeholder:text-slate-500 text-white leading-tight uppercase resize-none" 
                        placeholder="KOMMENTAR SCHREIBEN..." 
                    />
                </div>
                <input 
                    value={block.attributes.author || ''} 
                    onChange={(e) => updateBlock(block.clientId, { author: e.target.value })} 
                    className="bg-transparent text-slate-500 font-bold text-xs uppercase mt-2 outline-none w-full placeholder:text-slate-600 tracking-wider font-sans" 
                    placeholder="Name / Rolle eingeben..."
                />
            </div>
        );
    }

    // 2. STYLE: CARD (Matches ListBlock Aesthetic)
    return (
        <div className={`bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 font-display italic ${widthClass} ${alignClass} group/comment`}>
            
            {/* Header: Author Input (Similar to List Title) */}
            <div className="p-6 pb-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex-1 flex items-center min-w-0">
                    <User size={20} className="text-f1-pink mr-3 mb-1 shrink-0 -translate-y-[2px]" />
                    <AutoResizeTextarea
                        value={block.attributes.author || ''}
                        onChange={(e) => updateBlock(block.clientId, { author: e.target.value })}
                        className="w-full bg-transparent focus:outline-none text-white font-display font-black text-3xl uppercase italic tracking-tight placeholder:text-white/20 resize-none overflow-hidden"
                        placeholder="AUTOR..."
                    />
                </div>
            </div>

            {/* Accent Line */}
            <div className="h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div>

            {/* Body Content */}
            <div className="p-6 relative">
                <div className="relative z-10 w-full">
                    <AutoResizeTextarea 
                        value={block.attributes.content || ''} 
                        onChange={(e) => updateBlock(block.clientId, { content: e.target.value })} 
                        className="w-full bg-transparent focus:outline-none text-white/90 font-display font-bold text-xl md:text-2xl uppercase tracking-wide leading-relaxed placeholder:text-white/10 resize-none" 
                        placeholder="DEIN KOMMENTAR TEXT HIER..." 
                    />
                </div>
            </div>
        </div>
    );
};

export const CommentInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();
    const currentStyle = block.attributes?.style || 'card';
    const currentSize = block.attributes?.blockSize || 'full';

    return (
        <div className="space-y-6 font-sans">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Stil</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => updateBlock(block.clientId, { style: 'card' })} className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center transition-all ${currentStyle === 'card' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}>Card</button>
                    <button onClick={() => updateBlock(block.clientId, { style: 'simple' })} className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center transition-all ${currentStyle === 'simple' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}>Simple</button>
                </div>
            </div>

            {currentStyle === 'card' && (
                <>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Blockgröße</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {['small', 'medium', 'full'].map(size => (
                                <button 
                                    key={size}
                                    onClick={() => updateBlock(block.clientId, { blockSize: size })}
                                    className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${block.attributes?.blockSize === size || (!block.attributes?.blockSize && size === 'full') ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {size === 'small' ? 'Klein' : size === 'medium' ? 'Mittel' : 'Voll'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {currentSize !== 'full' && (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Ausrichtung</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => updateBlock(block.clientId, { align: 'left' })}
                                    className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center transition-all ${block.attributes?.align === 'left' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <AlignLeft size={14} className="mr-1"/> Links
                                </button>
                                <button 
                                    onClick={() => updateBlock(block.clientId, { align: 'center' })}
                                    className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center transition-all ${block.attributes?.align === 'center' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <AlignCenter size={14} className="mr-1"/> Mitte
                                </button>
                                <button 
                                    onClick={() => updateBlock(block.clientId, { align: 'right' })}
                                    className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center transition-all ${block.attributes?.align === 'right' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <AlignRight size={14} className="mr-1"/> Rechts
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export const defaultAttributes = {
    content: '',
    author: 'Redaktion',
    blockSize: 'full',
    align: 'center',
    style: 'card'
};
