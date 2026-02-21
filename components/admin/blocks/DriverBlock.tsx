import React from 'react';
import { Trophy, BarChart2, Flag } from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useEditor } from '../editor/EditorContext';
import { useData } from '../../../contexts/DataContext';
import { getFlagUrl } from '../../../constants';
import { DottedGlowBackground } from '../../ui/DottedGlowBackground';

export const DriverEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { drivers, teams } = useData();
    const { id } = block.attributes;
    
    const driver = drivers.find(d => d.id === id);
    if (!driver) return <div className="p-4 border border-slate-200 rounded-2xl text-center text-slate-400 text-xs bg-white font-sans italic">Fahrer über die Sidebar auswählen...</div>;
    const team = teams.find(t => t.id === driver.teamId);
    
    const accentColor = team?.color || '#e10059';
    const sizeClass = 'w-full';
    const alignClass = 'mx-auto';

    return (
        <div className={`w-full ${sizeClass} ${alignClass} font-display italic`}>
            {/* Removed "group" to disable hover effects in editor */}
            <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                
                <div className="p-6 pb-2 border-b border-white/5 bg-white/5 flex items-center justify-between relative z-20">
                     <div className="w-full bg-transparent focus:outline-none text-white font-display font-black text-3xl uppercase italic tracking-tight flex items-center gap-3">
                        <span>{driver.firstName} {driver.lastName}</span>
                        <span style={{ color: accentColor }}>#{driver.raceNumber}</span>
                     </div>
                </div>

                <div 
                    className="h-1 w-full z-20 relative"
                    style={{ background: `linear-gradient(90deg, ${accentColor} 0%, #1b1c20 100%)` }}
                ></div>

                <div className="flex flex-col @[768px]:flex-row relative">
                    <div 
                        className="w-full @[768px]:w-5/12 relative overflow-hidden border-b @[768px]:border-b-0 @[768px]:border-r border-white/5 flex items-end justify-center h-52 @[768px]:h-auto"
                        style={{
                            background: `radial-gradient(circle at 50% 100%, ${accentColor}66 0%, #151619 85%)`
                        }}
                    >
                        <DottedGlowBackground 
                            color={accentColor}
                            speed={0.4}
                            gap={10}
                            radius={1.2}
                            className="opacity-80"
                        />

                        <div className="relative z-10 w-full flex items-end justify-center pt-4 px-4 h-full">
                            <img 
                                src={driver.image} 
                                className="w-auto h-full @[768px]:h-44 object-contain drop-shadow-2xl object-bottom" 
                                alt={`${driver.lastName}`} 
                            />
                        </div>
                    </div>

                    <div className="w-full @[768px]:w-7/12 p-5 md:p-6 flex flex-col justify-center relative bg-f1-card z-20">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div 
                                    className="w-1 h-6 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                    style={{ backgroundColor: accentColor }}
                                ></div>
                                <span className="text-2xl font-bold uppercase text-white/80 tracking-tight font-display italic translate-y-[2px]">
                                    {team?.name || 'No Team'}
                                </span>
                            </div>
                            <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                className="hidden @[768px]:flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 cursor-default font-sans not-italic"
                            >
                                Mehr erfahren
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {/* Removed hover effects in editor */}
                            <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                    <Flag size={10} className="text-f1-pink -translate-y-[1px]" />
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic">Nation</span>
                                </div>
                                <div className="flex items-center justify-center">
                                    {getFlagUrl(driver.nationalityFlag) && <img src={getFlagUrl(driver.nationalityFlag)} className="w-[18px] aspect-[3/2] object-cover border border-black/30 mr-1.5 -translate-y-[2px]" alt="" />}
                                    <span className="text-lg font-bold text-white uppercase">{driver.nationalityFlag}</span>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                    <Trophy size={10} className="text-f1-pink -translate-y-[1px]" />
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic">Rang</span>
                                </div>
                                <div className="text-lg font-black text-white uppercase">
                                    P{driver.rank || '-'}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                    <BarChart2 size={10} className="text-f1-pink -translate-y-[1px]" />
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic">Punkte</span>
                                </div>
                                <div className="text-lg font-black uppercase text-white">
                                    {driver.points || 0}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Footer Button */}
                        <div className="mt-6 pt-4 border-t border-white/5 @[768px]:hidden flex justify-center">
                            <button className="flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 font-sans not-italic">
                                Mehr erfahren
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DriverInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();
    const { drivers } = useData();

    return (
        <div className="space-y-4 font-sans">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fahrer wählen</label>
                <select 
                    className="w-full border border-slate-200 rounded p-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-f1-pink" 
                    value={block.attributes?.id} 
                    onChange={e => updateBlock(block.clientId, { id: e.target.value })}
                >
                    <option value="">Fahrer wählen...</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.lastName}, {d.firstName}</option>)}
                </select>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-400 leading-relaxed italic">
                Der Fahrer-Block wird automatisch im Card-Design und in voller Breite angezeigt, um die beste mobile Kompatibilität zu gewährleisten.
            </div>
        </div>
    );
};

export const defaultAttributes = { 
    id: '', 
    mode: 'full', 
    blockSize: 'full', 
    align: 'center', 
    style: 'card' 
};