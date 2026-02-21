import React, { useRef, useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useEditor } from '../editor/EditorContext';

export const headingDefaults = { 
    content: '', 
    level: 2, 
    textAlign: 'left',
    blockSize: 'full',
    align: 'center'
};

const MAX_CHARS = 35;

export const HeadingEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();
    const ref = useRef<HTMLDivElement>(null);
    
    const { blockSize = 'full', align = 'center', level = 2 } = block.attributes;

    const widthClass = {
        'small': 'w-full md:w-1/3',
        'medium': 'w-full md:w-2/3',
        'full': 'w-full'
    }[blockSize as string] || 'w-full';

    const alignClass = {
        'left': 'mr-auto',
        'center': 'mx-auto',
        'right': 'ml-auto'
    }[align as string] || 'mx-auto';

    useEffect(() => {
        if (ref.current && document.activeElement !== ref.current) {
            const val = block.attributes.content || '';
            if (ref.current.innerText !== val) {
                ref.current.innerText = val;
            }
        }
    }, [block.attributes.content]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        updateBlock(block.clientId, { content: e.currentTarget.innerText });
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text/plain');
        const currentText = ref.current?.innerText || '';
        
        const selection = window.getSelection();
        const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const selectedText = range ? range.toString() : '';

        const availableSpace = MAX_CHARS - (currentText.length - selectedText.length);
        
        if (availableSpace > 0) {
            const cleanPaste = pastedText.replace(/[\r\n]+/g, ' ');
            const textToInsert = cleanPaste.substring(0, availableSpace);
            document.execCommand('insertText', false, textToInsert);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            return;
        }

        const allowedKeys = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
            'Home', 'End', 'Tab'
        ];
        
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (allowedKeys.includes(e.key)) return;

        const currentText = ref.current?.innerText || '';
        const selection = window.getSelection();
        const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const selectedText = range ? range.toString() : '';

        if (currentText.length - selectedText.length >= MAX_CHARS && e.key.length === 1) {
            e.preventDefault();
        }
    };

    return (
        <div className={`relative flex items-stretch transition-all duration-300 group/heading ${widthClass} ${alignClass}`}>
            <div className="w-3 bg-f1-pink mr-4 shrink-0 skew-x-[-12deg] mt-[-1px] mb-[9px]" />
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-0 bg-transparent focus:outline-none font-display font-black text-white uppercase italic tracking-tighter leading-[1.1] outline-none cursor-text min-h-[1.1em] break-words empty:before:content-[attr(data-placeholder)] empty:before:text-white/20"
                style={{ 
                    fontSize: level === 2 ? 'clamp(28px, 8vw, 48px)' : 'clamp(24px, 6vw, 36px)', 
                    textAlign: block.attributes.textAlign 
                }}
                data-placeholder={`ÜBERSCHRIFT (MAX ${MAX_CHARS})`}
            />
        </div>
    );
};

export const HeadingInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();
    const currentSize = block.attributes?.blockSize || 'full';

    return (
        <div className="space-y-6 font-sans">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Blockgröße</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {[
                        { id: 'small', label: 'Klein' },
                        { id: 'medium', label: 'Mittel' },
                        { id: 'full', label: 'Voll' }
                    ].map(size => (
                        <button 
                            key={size.id}
                            onClick={() => updateBlock(block.clientId, { blockSize: size.id })}
                            className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${block.attributes?.blockSize === size.id || (!block.attributes?.blockSize && size.id === 'full') ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {size.label}
                        </button>
                    ))}
                </div>
            </div>

            {currentSize !== 'full' && (
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Blockausrichtung</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => updateBlock(block.clientId, { align: 'left' })}
                            className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center transition-all ${block.attributes?.align === 'left' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <AlignLeft size={14} className="mr-1"/> Links
                        </button>
                        <button 
                            onClick={() => updateBlock(block.clientId, { align: 'center' })}
                            className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center transition-all ${block.attributes?.align === 'center' || !block.attributes?.align ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}
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
        </div>
    );
};