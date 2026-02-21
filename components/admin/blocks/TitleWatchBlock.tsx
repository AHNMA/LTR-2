
import React from 'react';
import { Trophy, Calculator, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useEditor } from '../editor/EditorContext';
import { useData } from '../../../contexts/DataContext';

export const TitleWatchEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { drivers, teams, races } = useData();
    const { type = 'drivers', style = 'card', blockSize = 'medium', align = 'center' } = block.attributes;
    const isDrivers = type === 'drivers';
    
    const remainingRaces = races.filter(r => r.status !== 'completed');
    const standardCount = remainingRaces.length;
    const sprintCount = remainingRaces.filter(r => r.format === 'sprint').length;
    const maxPoints = isDrivers ? (standardCount * 26) + (sprintCount * 8) : (standardCount * 44) + (sprintCount * 15);
    const sorted = isDrivers 
        ? [...drivers].sort((a,b) => (b.points || 0) - (a.points || 0))
        : [...teams].sort((a,b) => (b.points || 0) - (a.points || 0));
    const leaderPoints = sorted[0]?.points || 0;
    const contenders = sorted.filter(entry => (entry.points || 0) + maxPoints >= leaderPoints).slice(0, 10);

    const isCard = style === 'card';
    const sizeClass = isCard ? ({ 'small': 'max-w-md', 'medium': 'max-w-2xl', 'full': 'w-full' }[blockSize as string] || 'max-w-2xl') : 'w-full';
    const alignClass = isCard ? ({ 'left': 'mr-auto', 'center': 'mx-auto', 'right': 'ml-auto' }[align as string] || 'mx-auto') : '';

    if (!isCard) {
        return (
            <div className="w-full border-l-4 border-f1-pink pl-6 py-4 bg-white/50 font-display italic">
                <div className="flex items-center space-x-3 mb-4 not-italic">
                    <Calculator className="text-f1-pink" size={24} />
                    <h4 className="text-2xl font-black text-slate-900 uppercase italic leading-none tracking-tight">Title Watch</h4>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Mathematisch noch im Rennen (Max {maxPoints} Pts offen)</div>
                <div className="space-y-2">
                    {contenders.map(c => {
                        const gap = leaderPoints - (c.points || 0);
                        return (
                            <div key={c.id} className="flex justify-between items-center border-b border-slate-100 last:border-0 py-1.5 group">
                                <span className="text-2xl font-bold uppercase text-slate-800 group-hover:text-f1-pink transition-colors">{isDrivers ? (c as any).lastName : (c as any).name}</span>
                                <span className={`text-xl font-black ${gap === 0 ? 'text-green-500' : 'text-f1-pink'}`}>
                                    {gap === 0 ? 'LEADER' : `-${gap} PTS`}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full ${sizeClass} ${alignClass} font-display italic`}>
            <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Calculator size={140} className="text-white" />
                </div>
                <div className="p-6 bg-white/10 border-b border-white/5 flex justify-between items-center not-italic relative z-10">
                    <div className="flex items-center space-x-3">
                        <Trophy className="text-f1-pink" size={24} />
                        <h4 className="text-2xl font-black text-white uppercase italic leading-none tracking-tight">
                            {isDrivers ? 'Driver Title Watch' : 'Constructor Title Watch'}
                        </h4>
                    </div>
                    <div className="text-[10px] font-black uppercase text-f1-pink tracking-widest">{maxPoints} Pts offen</div>
                </div>
                <div className="p-6 space-y-4 relative z-10">
                    {contenders.map(c => {
                        const gap = leaderPoints - (c.points || 0);
                        const t = isDrivers ? teams.find(team => team.id === (c as any).teamId) : (c as any);
                        return (
                            <div key={c.id} className="flex items-center justify-between group">
                                <div className="flex items-center">
                                    <div className="w-1.5 h-10 rounded-full mr-4" style={{ backgroundColor: t?.color || '#ccc' }}></div>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 mr-4 bg-white/10">
                                            {(isDrivers ? (c as any).image : (c as any).logo) && <img src={isDrivers ? (c as any).image : (c as any).logo} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                        <span className="text-3xl font-black text-white uppercase group-hover:text-f1-pink transition-colors tracking-tighter">
                                            {isDrivers ? (c as any).lastName : (c as any).name}
                                        </span>
                                    </div>
                                </div>
                                <div className={`text-2xl font-black ${gap === 0 ? 'text-green-400' : 'text-f1-pink'} tabular-nums`}>
                                    {gap === 0 ? 'LEADER' : `-${gap} PTS`}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 bg-black/20 text-center text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] relative z-10 border-t border-white/5">
                    Mathematische Titel-Chancen • Editor Preview
                </div>
            </div>
        </div>
    );
};

export const TitleWatchInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
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
