import React from 'react';
import { Trophy, BarChart2, Flag, Zap, Cpu, Users } from 'lucide-react';
import { ContentBlock } from '../../../types';
import { useEditor } from '../editor/EditorContext';
import { useData } from '../../../contexts/DataContext';
import { getFlagUrl } from '../../../constants';
import { DottedGlowBackground } from '../../ui/DottedGlowBackground';

export const TeamEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { teams, drivers } = useData();
    const { id } = block.attributes;
    
    const team = teams.find(t => t.id === id);
    if (!team) return <div className="p-4 border border-slate-200 rounded-2xl text-center text-slate-400 text-xs bg-white font-sans italic">Team über die Sidebar auswählen...</div>;
    
    const teamDrivers = drivers.filter(d => d.teamId === team.id);
    const accentColor = team.color || '#e10059';

    return (
        <div className="w-full mx-auto font-display italic">
            {/* Removed "group" to disable hover state in editor */}
            <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                
                <div className="p-6 pb-2 border-b border-white/5 bg-white/5 relative z-20">
                     <div className="w-full flex items-center gap-3 text-white font-display font-black text-3xl uppercase italic tracking-tight leading-none">
                        <span className="break-words">
                            {team.name}
                        </span>
                        <div className="h-7 w-12 flex items-center shrink-0 -translate-y-[2px]">
                             {team.logo && <img src={team.logo} alt={team.name} className="max-w-full max-h-full object-contain object-left" />}
                        </div>
                     </div>
                </div>

                <div 
                    className="h-1 w-full z-20 relative"
                    style={{ background: `linear-gradient(90deg, ${accentColor} 0%, #1b1c20 100%)` }}
                ></div>

                <div className="flex flex-col @[768px]:flex-row relative">
                    {/* Removed "group/car" zoom logic in editor */}
                    <div 
                        className="w-full @[768px]:w-5/12 relative overflow-hidden border-b @[768px]:border-b-0 @[768px]:border-r border-white/5 flex items-center justify-center h-64 @[768px]:h-auto min-h-[220px]"
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

                        <div className="relative z-10 w-full flex items-center justify-center p-6 h-full overflow-hidden">
                            {team.carImage && (
                                <img 
                                    src={team.carImage} 
                                    className="w-full h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-700 transform scale-90 @[768px]:scale-100 object-bottom" 
                                    alt={`${team.name} Car`} 
                                />
                            )}
                        </div>
                    </div>

                    <div className="w-full @[768px]:w-7/12 p-5 md:p-6 flex flex-col justify-center relative bg-f1-card z-20">
                        
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <div 
                                    className="w-1 h-6 rounded-full shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                    style={{ backgroundColor: accentColor }}
                                ></div>
                                <div className="flex flex-col leading-none pr-4">
                                    <span className="text-2xl font-bold uppercase text-white/80 tracking-tight font-display italic whitespace-nowrap translate-y-[2px]">
                                        {team.chassis} • {team.powerUnit}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                className="hidden @[768px]:flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 cursor-default font-sans not-italic shrink-0 ml-4"
                            >
                                Mehr erfahren
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                    <Flag size={10} className="text-f1-pink -translate-y-[1px]" />
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic">Nation</span>
                                </div>
                                <div className="flex items-center justify-center">
                                    {getFlagUrl(team.nationalityFlag) && <img src={getFlagUrl(team.nationalityFlag)} className="w-[18px] aspect-[3/2] object-cover border border-black/30 mr-1.5 -translate-y-[2px]" alt="" />}
                                    <span className="text-lg font-bold text-white uppercase">{team.nationalityFlag}</span>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                    <Trophy size={10} className="text-f1-pink -translate-y-[1px]" />
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic">Rang</span>
                                </div>
                                <div className="text-lg font-black text-white uppercase">
                                    P{team.rank || '-'}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                    <BarChart2 size={10} className="text-f1-pink -translate-y-[1px]" />
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic">Punkte</span>
                                </div>
                                <div className="text-lg font-black uppercase text-white">
                                    {team.points || 0}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 @[768px]:grid-cols-2 gap-3">
                            {teamDrivers.map(d => (
                                <div key={d.id} className="flex items-center justify-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="w-12 h-12 rounded-full border-2 border-f1-card overflow-hidden bg-slate-800 shrink-0">
                                        {d.image && <img src={d.image} className="w-full h-full object-cover" title={`${d.firstName} ${d.lastName}`} />}
                                    </div>
                                    <div className="flex flex-col min-w-0 items-center">
                                        <div className="flex items-center mb-1 justify-center w-full">
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic">Driver</span>
                                        </div>
                                        <span className="text-sm font-bold text-white truncate uppercase font-display italic pr-1">{d.lastName}</span>
                                    </div>
                                </div>
                            ))}
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

export const TeamInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();
    const { teams } = useData();

    return (
        <div className="space-y-4 font-sans">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Team auswählen</label>
                <select 
                    className="w-full border border-slate-200 rounded p-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-f1-pink" 
                    value={block.attributes?.id} 
                    onChange={e => updateBlock(block.clientId, { id: e.target.value })}
                >
                    <option value="">Team wählen...</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-400 leading-relaxed italic">
                Das Design des Team-Blocks ist nun exakt auf den Fahrer-Block abgestimmt, um ein harmonisches Gesamtbild im Artikel zu gewährleisten.
            </div>
        </div>
    );
};

export const defaultAttributes = { 
    id: '', 
    style: 'card' 
};