import React from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Trophy, Calendar, Calculator, MapPin, Zap, ChevronRight, Clock } from 'lucide-react';
import { getFlagUrl } from '../constants';

const PaddockOverview: React.FC = () => {
    const { races, drivers, teams } = useData();
    const { goToCalendar, goToStandings } = useNavigation();

    // Data for widgets
    const nextRace = races.find(r => r.status === 'next') || races.find(r => r.status === 'upcoming');
    const topDrivers = [...drivers].sort((a, b) => a.rank - b.rank).slice(0, 5);
    
    // Title Watch Logic
    const remainingRaces = races.filter(r => r.status !== 'completed');
    const maxPoints = (remainingRaces.length * 26) + (remainingRaces.filter(r => r.format === 'sprint').length * 8);
    const leaderPoints = topDrivers[0]?.points || 0;
    const contenders = drivers.filter(d => d.points + maxPoints >= leaderPoints).sort((a,b) => b.points - a.points).slice(0, 3);

    const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : '--.--';
    const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '--:--';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* WIDGET 1: NEXT EVENT (Event Block Style) */}
                <div onClick={goToCalendar} className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 font-display italic transition-all hover:shadow-glow group cursor-pointer relative h-full flex flex-col">
                    {nextRace?.trackMap && (
                        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none z-0">
                            <img src={nextRace.trackMap} alt="" className="h-full w-full object-contain object-right transform scale-125" />
                        </div>
                    )}
                    
                    {/* Centered City Overlay for Paddock Widget */}
                    {nextRace && (
                        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
                            <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-2xl transition-all group-hover:bg-f1-pink/20 group-hover:border-f1-pink/30">
                                <MapPin size={10} className="text-f1-pink" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{nextRace.city}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center not-italic z-10">
                        <div className="flex items-center space-x-2">
                            <Zap className="text-f1-pink animate-pulse" size={16} />
                            <span className="text-xs font-black uppercase text-f1-pink tracking-widest">Live Event Center</span>
                        </div>
                        <span className="text-[10px] font-bold text-white/30 uppercase">Saison 2026</span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-center z-10 relative">
                        {nextRace ? (
                            <>
                                <h3 className="text-4xl md:text-5xl font-black text-white uppercase leading-none tracking-tighter mb-2 transition-colors group-hover:text-f1-pink">{nextRace.country} GP</h3>
                                <div className="flex items-center text-slate-400 text-sm md:text-lg font-medium not-italic uppercase tracking-wider mb-2">
                                    <MapPin size={14} className="mr-1.5 text-f1-pink" /> {nextRace.circuitName}
                                </div>

                                {/* Minimal Info Row */}
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">
                                    <span>Runde {nextRace.round}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                    <span className={nextRace.format === 'sprint' ? 'text-orange-500/60' : ''}>
                                        {nextRace.format === 'sprint' ? 'Sprint' : 'Standard'}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 not-italic">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">Qualifying</div>
                                        <div className="text-white font-bold text-sm">{formatDate(nextRace.sessions?.qualifying)} • {formatTime(nextRace.sessions?.qualifying)}</div>
                                    </div>
                                    <div className="bg-f1-pink/10 p-3 rounded-xl border border-f1-pink/20">
                                        <div className="text-[9px] uppercase font-black text-f1-pink tracking-widest mb-1">Rennen</div>
                                        <div className="text-white font-bold text-sm">{formatDate(nextRace.sessions?.race)} • {formatTime(nextRace.sessions?.race)}</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10 text-slate-500 uppercase font-bold tracking-widest">Keine anstehenden Events</div>
                        )}
                    </div>
                </div>

                {/* WIDGET 2: WORLD STANDINGS (Standings Block Style) */}
                <div onClick={goToStandings} className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 font-display italic transition-all hover:shadow-glow group cursor-pointer flex flex-col h-full">
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center not-italic">
                        <div className="flex items-center space-x-2">
                            <Trophy className="text-f1-pink" size={16} />
                            <span className="text-xs font-black uppercase text-white tracking-widest">WM-Stand: Fahrer</span>
                        </div>
                        <ChevronRight size={16} className="text-white/20 group-hover:text-f1-pink transition-colors" />
                    </div>
                    
                    <div className="divide-y divide-white/5 flex-1">
                        {topDrivers.map((d, i) => (
                            <div key={d.id} className="px-6 py-2.5 flex items-center justify-between group/row hover:bg-white/5 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <span className={`text-xl font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-white/10'}`}>{i + 1}</span>
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/10">
                                        <img src={d.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <span className="text-xl font-black text-white uppercase tracking-tighter group-hover/row:text-f1-pink transition-colors">{d.lastName}</span>
                                </div>
                                <div className="text-xl font-black text-white bg-white/5 px-2 py-0.5 rounded min-w-[45px] text-center tabular-nums">{d.points}</div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-black/20 text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 border-t border-white/5 not-italic">
                        Top 5 • Saison {new Date().getFullYear()}
                    </div>
                </div>

                {/* WIDGET 3: TITLE WATCH (Title Watch Style) */}
                <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 font-display italic transition-all hover:shadow-glow group flex flex-col h-full relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Calculator size={100} className="text-white" /></div>
                    
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center not-italic z-10">
                        <div className="flex items-center space-x-2">
                            <Calculator className="text-f1-pink" size={16} />
                            <span className="text-xs font-black uppercase text-white tracking-widest">Title Watch</span>
                        </div>
                        <div className="text-[9px] font-black uppercase text-f1-pink tracking-widest">{maxPoints} Pts offen</div>
                    </div>

                    <div className="p-6 space-y-4 flex-1 z-10">
                        {contenders.map(c => {
                            const gap = leaderPoints - c.points;
                            const t = teams.find(team => team.id === c.teamId);
                            return (
                                <div key={c.id} className="flex items-center justify-between group/contender">
                                    <div className="flex items-center">
                                        <div className="w-1 h-8 rounded-full mr-3" style={{ backgroundColor: t?.color || '#ccc' }}></div>
                                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 mr-3 bg-white/10">
                                            <img src={c.image} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <span className="text-2xl font-black text-white uppercase tracking-tighter group-hover/contender:text-f1-pink transition-colors">{c.lastName}</span>
                                    </div>
                                    <div className={`text-xl font-black ${gap === 0 ? 'text-green-400' : 'text-f1-pink'} tabular-nums`}>
                                        {gap === 0 ? 'LEADER' : `-${gap} PTS`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-3 bg-black/20 text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 border-t border-white/5 not-italic">
                        Mathematische Titel-Chancen
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaddockOverview;