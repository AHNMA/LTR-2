
import React from 'react';
import { Calendar, MapPin, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useEditor } from '../editor/EditorContext';
import { useData } from '../../../contexts/DataContext';
import { getFlagUrl } from '../../../constants';

export const CalendarEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { races } = useData();
    const { limit = 3, blockSize = 'medium', align = 'center', style = 'card' } = block.attributes;
    const upcomingRaces = races.filter(r => r.status !== 'completed').slice(0, limit);
    
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

    if (style === 'simple') {
        return (
            <div className="w-full border-l-4 border-f1-pink pl-6 py-2 bg-white/50 font-sans">
                <div className="flex items-center mb-4">
                    <Calendar size={18} className="text-f1-pink mr-2" />
                    <h4 className="font-display font-bold text-2xl uppercase italic text-slate-900 tracking-tight">Rennkalender Vorschau</h4>
                </div>
                <div className="space-y-4">
                    {upcomingRaces.map((race) => (
                        <div key={race.id} className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                            <div className="flex items-center space-x-3">
                                {getFlagUrl(race.flag) && <img src={getFlagUrl(race.flag)} className="w-6 h-auto border border-black/10" alt="" />}
                                <div>
                                    <div className="font-display font-bold text-xl uppercase italic text-slate-800 leading-none">{race.country} GP</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Runde {race.round}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-f1-pink font-display font-bold text-lg leading-none">
                                    {new Date(race.sessions?.race).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase mt-1">
                                    {new Date(race.sessions?.race).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full ${sizeClass} ${alignClass}`}>
            <div className="bg-f1-card rounded-2xl overflow-hidden border border-white/5 font-display italic">
                <div className="p-4 bg-white/10 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center text-white text-lg font-black uppercase tracking-tight">
                        <Calendar size={18} className="mr-2 text-f1-pink" /> Rennkalender Vorschau
                    </div>
                    <div className="text-[10px] font-bold text-white/40 uppercase not-italic">Saison 2026</div>
                </div>
                <div className="divide-y divide-white/5">
                    {upcomingRaces.map((race) => (
                        <div key={race.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="text-xl font-black text-white/20 w-8">R{race.round}</div>
                                {getFlagUrl(race.flag) && <img src={getFlagUrl(race.flag)} className="w-8 h-auto border border-black/40" alt="" />}
                                <div>
                                    <div className="text-xl font-bold text-white uppercase leading-none tracking-tight">{race.country} GP</div>
                                    <div className="text-[10px] text-slate-400 uppercase not-italic mt-1">
                                        {new Date(race.sessions?.race).toLocaleDateString('de-DE')} • {race.city}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-f1-pink text-xl font-black uppercase tracking-tighter">
                                    {new Date(race.sessions?.race).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {upcomingRaces.length === 0 && (
                        <div className="p-8 text-center text-white/30 text-xs italic">Keine anstehenden Rennen gefunden.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const CalendarInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();
    const currentStyle = block.attributes?.style || 'card';

    return (
        <div className="space-y-4 font-sans">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rennen Limit</label>
                <input type="number" min="1" max="24" className="w-full border border-slate-200 rounded p-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-f1-pink" value={block.attributes?.limit || 3} onChange={e => updateBlock(block.clientId, { limit: parseInt(e.target.value) })} />
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
