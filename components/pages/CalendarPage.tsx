import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { MapPin, Clock, Flag, Trophy, Timer, ChevronRight, Calendar as CalendarIcon, Zap } from 'lucide-react';
import { getFlagUrl } from '../../constants';

const CalendarPage: React.FC = () => {
    const { races } = useData();
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

    const nextRace = races.find(r => r.status === 'next') || races.find(r => r.status === 'upcoming');
    
    useEffect(() => {
        if (!nextRace || !nextRace.sessions?.race) return;
        const targetDate = new Date(nextRace.sessions.race).getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            if (distance < 0) setTimeLeft(null);
            else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [nextRace]);

    const formatDate = (isoString?: string) => {
        if (!isoString) return 'TBA';
        const date = new Date(isoString);
        return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '--:--';
        const date = new Date(isoString);
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    };

    const getMonthName = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('de-DE', { month: 'long' }).toUpperCase();
    };

    return (
        <div className="bg-f1-dark min-h-screen pb-20 pt-8 font-sans">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 uppercase italic leading-none tracking-tighter">Rennkalender 2026</h1>
                    <div className="h-1.5 w-24 bg-f1-pink mx-auto rounded-full shadow-glow"></div>
                </div>

                {nextRace && (
                    <div className="mb-16 bg-f1-card rounded-2xl overflow-hidden shadow-2xl relative text-white border-t-4 border-f1-pink">
                        {nextRace.trackMap && (
                            <div className="absolute right-0 top-0 h-full w-2/3 opacity-10 pointer-events-none">
                                <img src={nextRace.trackMap} alt="Track" className="h-full w-full object-contain object-right" />
                            </div>
                        )}
                        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
                            <div className="mb-8 md:mb-0 text-center md:text-left font-display">
                                <div className="text-f1-pink font-black uppercase tracking-[0.2em] mb-4 flex items-center justify-center md:justify-start text-xs">
                                    <Zap size={14} className="animate-pulse mr-2" /> Nächstes Rennen
                                </div>
                                <h2 className="text-5xl md:text-8xl font-black italic leading-[0.8] mb-4 uppercase tracking-tighter">{nextRace.country}</h2>
                                <p className="text-xl text-slate-500 font-medium flex items-center justify-center md:justify-start not-italic uppercase tracking-widest">
                                    <MapPin size={18} className="mr-2 text-f1-pink" /> {nextRace.circuitName}
                                </p>
                            </div>
                            {timeLeft && (
                                <div className="flex space-x-4 md:space-x-8 bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
                                    {[{val: timeLeft.days, label: 'Tage'}, {val: timeLeft.hours, label: 'Std'}, {val: timeLeft.minutes, label: 'Min'}, {val: timeLeft.seconds, label: 'Sek', color: 'text-f1-pink'}].map((t, i) => (
                                        <div key={i} className="text-center min-w-[50px]">
                                            <div className={`text-3xl md:text-5xl font-display font-bold leading-none mb-1 ${t.color || 'text-white'}`}>{t.val}</div>
                                            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">{t.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-6 max-w-5xl mx-auto">
                    {races.map((race) => {
                        const isNext = race.id === nextRace?.id;
                        const isCompleted = race.status === 'completed';
                        return (
                            <div key={race.id} className={`bg-f1-card rounded-2xl shadow-xl border overflow-hidden transition-all hover:shadow-glow group ${isNext ? 'ring-2 ring-f1-pink border-transparent' : 'border-white/5'} ${isCompleted ? 'opacity-60 grayscale-[0.4] hover:opacity-100 hover:grayscale-0' : ''}`}>
                                <div className="flex flex-col md:flex-row h-full">
                                    <div className="md:w-32 bg-white/5 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-row md:flex-col items-center justify-between md:justify-center text-center shrink-0">
                                        <img src={getFlagUrl(race.flag)} className="w-10 h-auto border border-black/40 shadow-xl mb-4" alt="" />
                                        {race.sessions?.race && (
                                            <div>
                                                <div className="text-2xl font-bold font-display text-white leading-none italic">{new Date(race.sessions.race).getDate()}</div>
                                                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{getMonthName(race.sessions.race).slice(0,3)}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-center relative overflow-hidden font-display italic">
                                        {race.trackMap && (
                                            <div className="absolute right-0 bottom-[-20px] w-40 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12 pointer-events-none">
                                                <img src={race.trackMap} alt="Track" />
                                            </div>
                                        )}
                                        
                                        {/* Centered City Overlay for Calendar List */}
                                        <div className="absolute bottom-4 right-6 z-20 hidden md:flex">
                                            <div className="bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-sm transition-all group-hover:border-f1-pink/30">
                                                <MapPin size={10} className="text-f1-pink" />
                                                <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest group-hover:text-white">{race.city}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 mb-4">
                                            <h3 className="text-2xl md:text-4xl font-black text-white uppercase leading-none tracking-tight group-hover:text-f1-pink transition-colors">{race.country} Grand Prix</h3>
                                            {isCompleted && <span className="bg-white/10 text-slate-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider not-italic">Beendet</span>}
                                        </div>
                                        <div className="text-sm text-slate-500 font-bold uppercase not-italic tracking-widest flex items-center mb-2">
                                            <MapPin size={14} className="mr-2 text-f1-pink" /> {race.circuitName}
                                        </div>

                                        {/* Minimal Info Row */}
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                                            <span>Runde {race.round}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                            <span className={race.format === 'sprint' ? 'text-orange-500/60' : ''}>
                                                {race.format === 'sprint' ? 'Sprint' : 'Standard'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="md:w-80 bg-white/5 p-6 border-t md:border-t-0 md:border-l border-white/5 flex flex-col justify-center text-xs font-bold uppercase tracking-widest">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center"><div className="flex items-center text-slate-500"><span className="w-10 text-[9px]">{formatDate(race.sessions?.qualifying)}</span><span className="text-slate-400 ml-2">Qualifying</span></div><span className="font-mono text-white text-sm">{formatTime(race.sessions?.qualifying)}</span></div>
                                            {race.format === 'sprint' && (<div className="flex justify-between items-center"><div className="flex items-center text-orange-500"><span className="w-10 text-[9px]">{formatDate(race.sessions?.sprint)}</span><span className="ml-2">Sprint</span></div><span className="font-mono text-white text-sm">{formatTime(race.sessions?.sprint)}</span></div>)}
                                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10"><div className="flex items-center text-f1-pink"><span className="w-10 text-[9px]">{formatDate(race.sessions?.race)}</span><span className="ml-2 tracking-widest">Rennen</span></div><span className="font-mono text-f1-pink text-base bg-f1-pink/10 px-2 py-1 rounded shadow-glow">{formatTime(race.sessions?.race)}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;