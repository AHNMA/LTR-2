
import React from 'react';
import { Trophy, BarChart2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useEditor } from '../editor/EditorContext';
import { useData } from '../../../contexts/DataContext';

export const StandingsEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { drivers, teams } = useData();
    const { type = 'drivers', style = 'card', blockSize = 'medium', align = 'center' } = block.attributes;
    
    const list = type === 'drivers' 
        ? [...drivers].sort((a,b) => (b.points || 0) - (a.points || 0)).slice(0, 5)
        : [...teams].sort((a,b) => (b.points || 0) - (a.points || 0)).slice(0, 5);

    const isCard = style === 'card';
    const sizeClass = isCard ? ({
        'small': 'max-w-md',
        'medium': 'max-w-2xl',
        'full': 'w-full'
    }[blockSize as string] || 'max-w-2xl') : 'w-full';

    const alignClass = isCard ? ({
        'left': 'mr-auto',
        'center': 'mx-auto',
        'right': 'ml-auto'
    }[align as string] || 'mx-auto') : '';

    if (!isCard) {
        return (
            <div className="w-full border-l-4 border-f1-pink pl-6 py-2 font-display italic">
                <div className="flex items-center mb-4 not-italic">
                    <BarChart2 size={18} className="text-f1-pink mr-2" />
                    <h4 className="text-2xl font-black text-slate-900 uppercase italic leading-none tracking-tight">
                        {type === 'drivers' ? 'Fahrerwertung' : 'Teamwertung'} Top 5
                    </h4>
                </div>
                <div className="space-y-1">
                    {list.map((entry, idx) => (
                        <div key={entry.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                            <div className="flex items-center space-x-3">
                                <span className="text-lg font-black text-slate-300 w-4">{idx + 1}</span>
                                <span className="text-xl font-bold text-slate-800 uppercase tracking-tighter">
                                    {type === 'drivers' ? (entry as any).lastName : entry.name}
                                </span>
                            </div>
                            <span className="text-xl font-black text-f1-pink">{entry.points}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full ${sizeClass} ${alignClass} font-display italic`}>
            <div className="bg-f1-card rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                <div className="p-4 bg-white/10 border-b border-white/5 flex justify-between items-center not-italic">
                    <div className="flex items-center text-white text-lg font-black uppercase tracking-tight">
                        <Trophy size={18} className="mr-2 text-f1-pink" /> 
                        {type === 'drivers' ? 'Championship Standings' : 'Constructors Standings'}
                    </div>
                    <div className="text-[10px] font-bold text-white/40 uppercase">Saison 2026</div>
                </div>
                <div className="divide-y divide-white/5">
                    {list.map((entry, idx) => (
                        <div key={entry.id} className="px-6 py-3 flex items-center justify-between group hover:bg-white/5 transition-colors">
                            <div className="flex items-center space-x-6">
                                <span className={`text-2xl font-black ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-white/20'}`}>
                                    {idx + 1}
                                </span>
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/10 shrink-0">
                                        {((entry as any).image || entry.logo) && <img src={(entry as any).image || entry.logo} className="w-full h-full object-cover" alt="" />}
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-white uppercase leading-none tracking-tighter group-hover:text-f1-pink transition-colors">
                                            {type === 'drivers' ? (entry as any).lastName : entry.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white bg-white/5 px-3 py-0.5 rounded border border-white/5 min-w-[50px] text-center">
                                    {entry.points}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const StandingsInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();
    const currentStyle = block.attributes?.style || 'card';

    return (
        <div className="space-y-4 font-sans">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Wertungstyp</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => updateBlock(block.clientId, { type: 'drivers' })} className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${block.attributes?.type === 'drivers' || !block.attributes?.type ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400'}`}>Fahrer</button>
                    <button onClick={() => updateBlock(block.clientId, { type: 'teams' })} className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${block.attributes?.type === 'teams' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400'}`}>Teams</button>
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Stil</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => updateBlock(block.clientId, { style: 'card' })} className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${currentStyle === 'card' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400'}`}>Card</button>
                    <button onClick={() => updateBlock(block.clientId, { style: 'simple' })} className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${currentStyle === 'simple' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400'}`}>Simple</button>
                </div>
            </div>
            {currentStyle === 'card' && (
                <div className="animate-in slide-in-from-top-2 duration-200 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Größe (Breite)</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {['small', 'medium', 'full'].map(size => (
                                <button key={size} onClick={() => updateBlock(block.clientId, { blockSize: size })} className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase transition-all ${block.attributes?.blockSize === size || (!block.attributes?.blockSize && size === 'medium') ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}>
                                    {size === 'small' ? 'Klein' : size === 'medium' ? 'Mittel' : 'Voll'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Ausrichtung</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button onClick={() => updateBlock(block.clientId, { align: 'left' })} className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center transition-all ${block.attributes?.align === 'left' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}><AlignLeft size={14} className="mr-1"/> Links</button>
                            <button onClick={() => updateBlock(block.clientId, { align: 'center' })} className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center transition-all ${block.attributes?.align === 'center' || !block.attributes?.align ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}><AlignCenter size={14} className="mr-1"/> Mitte</button>
                            <button onClick={() => updateBlock(block.clientId, { align: 'right' })} className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase flex items-center justify-center transition-all ${block.attributes?.align === 'right' ? 'bg-white shadow-sm text-f1-pink' : 'text-slate-400 hover:text-slate-600'}`}><AlignRight size={14} className="mr-1"/> Rechts</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
