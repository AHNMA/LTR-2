
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { MapPin, Clock, Flag, Trophy, Timer, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getFlagUrl } from '../../constants';

const CalendarPage: React.FC = () => {
    const { races } = useData();
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

    // Find next race logic: First 'next', otherwise first 'upcoming'
    const nextRace = races.find(r => r.status === 'next') || races.find(r => r.status === 'upcoming');
    
    useEffect(() => {
        if (!nextRace || !nextRace.sessions?.race) return;
        
        const targetDate = new Date(nextRace.sessions.race).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                // Race started or passed
                setTimeLeft(null);
            } else {
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

    // Helpers
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
        <div className="bg-slate-50 min-h-screen pb-20 pt-8 font-sans">
            <div className="container mx-auto px-4">
                
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-4 uppercase italic">Rennkalender 2026</h1>
                    <div className="h-1 w-24 bg-f1-pink mx-auto"></div>
                </div>

                {/* NEXT RACE HERO */}
                {nextRace && (
                    <div className="mb-16 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative text-white border-t-4 border-f1-pink">
                        {/* Background Map Faded */}
                        {nextRace.trackMap && (
                            <div className="absolute right-0 top-0 h-full w-2/3 opacity-10 pointer-events-none">
                                <img src={nextRace.trackMap} alt="Track" className="h-full w-full object-contain object-right" />
                            </div>
                        )}
                        
                        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
                            <div className="mb-8 md:mb-0 text-center md:text-left">
                                <div className="text-f1-pink font-bold uppercase tracking-[0.2em] mb-2 flex items-center justify-center md:justify-start">
                                    <span className="animate-pulse mr-2">●</span> Nächstes Rennen
                                </div>
                                <h2 className="text-5xl md:text-7xl font-display font-bold italic leading-none mb-2">{nextRace.country}</h2>
                                <p className="text-xl text-slate-400 font-light flex items-center justify-center md:justify-start">
                                    <MapPin size={18} className="mr-2" /> {nextRace.circuitName}
                                </p>
                            </div>

                            {/* Countdown */}
                            {timeLeft && (
                                <div className="flex space-x-4 md:space-x-8">
                                    <div className="text-center">
                                        <div className="text-3xl md:text-5xl font-display font-bold">{timeLeft.days}</div>
                                        <div className="text-[10px] md:text-xs uppercase text-slate-500 tracking-widest">Tage</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl md:text-5xl font-display font-bold">{timeLeft.hours}</div>
                                        <div className="text-[10px] md:text-xs uppercase text-slate-500 tracking-widest">Std</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl md:text-5xl font-display font-bold">{timeLeft.minutes}</div>
                                        <div className="text-[10px] md:text-xs uppercase text-slate-500 tracking-widest">Min</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl md:text-5xl font-display font-bold text-f1-pink w-[60px] tabular-nums">{timeLeft.seconds}</div>
                                        <div className="text-[10px] md:text-xs uppercase text-slate-500 tracking-widest">Sek</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Calendar Grid */}
                <div className="space-y-6 max-w-5xl mx-auto">
                    {races.map((race) => {
                        const isNext = race.id === nextRace?.id;
                        const isCompleted = race.status === 'completed';

                        return (
                            <div key={race.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-lg group ${isNext ? 'ring-2 ring-f1-pink border-transparent' : 'border-slate-200'} ${isCompleted ? 'opacity-75 grayscale-[0.5] hover:grayscale-0' : ''}`}>
                                <div className="flex flex-col md:flex-row h-full">
                                    
                                    {/* Left: Date & Flag Badge */}
                                    <div className="md:w-32 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-4 flex flex-row md:flex-col items-center justify-between md:justify-center text-center shrink-0">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Runde {race.round}</div>
                                        <img src={getFlagUrl(race.flag)} className="w-10 h-auto border border-black/50 mb-1" alt="" />
                                        {race.sessions?.race && (
                                            <div>
                                                <div className="text-xl font-bold font-display text-slate-900 leading-none">
                                                    {new Date(race.sessions.race).getDate()}
                                                </div>
                                                <div className="text-xs font-bold uppercase text-slate-500">
                                                    {getMonthName(race.sessions.race).slice(0,3)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Middle: Info */}
                                    <div className="flex-1 p-6 flex flex-col justify-center relative overflow-hidden">
                                        {race.trackMap && (
                                            <div className="absolute right-0 bottom-[-20px] w-40 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12 pointer-events-none">
                                                <img src={race.trackMap} alt="Track" />
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h3 className="text-2xl font-display font-bold text-slate-900 uppercase italic">
                                                {race.country} Grand Prix
                                            </h3>
                                            {race.format === 'sprint' && (
                                                <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Sprint</span>
                                            )}
                                            {isCompleted && <span className="bg-slate-200 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Beendet</span>}
                                        </div>
                                        <div className="text-sm text-slate-500 font-medium flex items-center">
                                            <MapPin size={14} className="mr-1 text-f1-pink" />
                                            {race.circuitName}, {race.city}
                                        </div>
                                    </div>

                                    {/* Right: Schedule Compact */}
                                    <div className="md:w-80 bg-slate-50/50 p-4 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center text-sm">
                                        <div className="space-y-2">
                                            {/* Quali */}
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center text-slate-500">
                                                    <span className="w-8 text-[10px] font-bold uppercase">{formatDate(race.sessions?.qualifying)}</span>
                                                    <span className="font-bold text-slate-700 ml-2">Qualifying</span>
                                                </div>
                                                <span className="font-mono text-slate-900 font-bold">{formatTime(race.sessions?.qualifying)}</span>
                                            </div>

                                            {/* Sprint if applicable */}
                                            {race.format === 'sprint' && (
                                                 <div className="flex justify-between items-center">
                                                    <div className="flex items-center text-orange-600">
                                                        <span className="w-8 text-[10px] font-bold uppercase">{formatDate(race.sessions?.sprint)}</span>
                                                        <span className="font-bold ml-2">Sprint</span>
                                                    </div>
                                                    <span className="font-mono text-slate-900 font-bold">{formatTime(race.sessions?.sprint)}</span>
                                                </div>
                                            )}
                                            
                                            {/* Race */}
                                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
                                                <div className="flex items-center text-f1-pink">
                                                    <span className="w-8 text-[10px] font-bold uppercase">{formatDate(race.sessions?.race)}</span>
                                                    <span className="font-bold ml-2 uppercase tracking-wide">Rennen</span>
                                                </div>
                                                <span className="font-mono text-f1-pink font-bold bg-f1-pink/10 px-2 py-0.5 rounded">
                                                    {formatTime(race.sessions?.race)}
                                                </span>
                                            </div>
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
