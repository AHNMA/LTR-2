
import React from 'react';
import { Calendar, MapPin, Zap, Clock, Info, Trophy, Flag as FlagIcon } from 'lucide-react';
import { ContentBlock, Race, SessionType } from '../../../types';
import { useEditor } from '../editor/EditorContext';
import { useData } from '../../../contexts/DataContext';
import { getFlagUrl } from '../../../constants';
import { DottedGlowBackground } from '../../ui/DottedGlowBackground';

export const EventEditor: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { races } = useData();
    const { id, style = 'card' } = block.attributes;
    
    const race = races.find(r => r.id === id);
    if (!race) {
        return (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs bg-white font-sans italic">
                Grand Prix über die Sidebar auswählen...
            </div>
        );
    }

    const formatDate = (iso?: string) => {
        if (!iso) return '--.--';
        return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    const formatTime = (iso?: string) => {
        if (!iso) return '--:--';
        return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    };

    const getSessionLabel = (key: string): string => {
        const labels: Record<string, string> = {
            fp1: '1. Training',
            fp2: '2. Training',
            fp3: '3. Training',
            sprintQuali: 'Sprint Quali',
            sprint: 'Sprint',
            qualifying: 'Qualifying',
            race: 'Das Rennen'
        };
        return labels[key] || key;
    };

    // Bestimme die anzuzeigenden Sessions basierend auf dem Format
    const sessionKeys: string[] = race.format === 'sprint' 
        ? ['fp1', 'sprintQuali', 'sprint', 'qualifying', 'race']
        : ['fp1', 'fp2', 'fp3', 'qualifying', 'race'];

    const accentColor = '#e10059'; // F1 Pink als Standard für Events

    return (
        <div className="w-full font-display italic">
            <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative cursor-pointer group">
                
                {/* Header Section */}
                <div className="p-6 pb-2 border-b border-white/5 bg-white/5 flex items-center justify-between relative z-20">
                     <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <div className="text-white font-black text-3xl uppercase italic tracking-tight leading-none flex items-center gap-3">
                                <span className="hover:text-f1-pink transition-colors">{race.country}</span>
                                {getFlagUrl(race.flag) && <img src={getFlagUrl(race.flag)} className="w-[26px] aspect-[3/2] object-cover border border-black/30 -translate-y-[3px]" alt="" />}
                            </div>
                        </div>
                     </div>
                </div>

                {/* Accent Strip */}
                <div 
                    className="h-1 w-full z-20 relative"
                    style={{ background: `linear-gradient(90deg, ${accentColor} 0%, #1b1c20 100%)` }}
                ></div>

                <div className="flex flex-col @[768px]:flex-row relative">
                    
                    {/* Visual Area (Track Map) */}
                    <div 
                        className="w-full @[768px]:w-5/12 relative overflow-hidden border-b @[768px]:border-b-0 @[768px]:border-r border-white/5 flex items-center justify-center h-52 @[768px]:h-auto min-h-[250px]"
                        style={{
                            background: `radial-gradient(circle at 50% 50%, ${accentColor}33 0%, #151619 85%)`
                        }}
                    >
                        {/* Map Hover Area */}
                        <div className="absolute inset-0 group/track z-10">
                            <DottedGlowBackground 
                                color={accentColor}
                                speed={0.3}
                                gap={12}
                                radius={1}
                                className="opacity-60"
                            />

                            <div className="relative w-full h-full flex items-center justify-center p-8 @[375px]:p-4 @[768px]:p-12 @[768px]:pb-24">
                                {race.trackMap ? (
                                    <img 
                                        src={race.trackMap} 
                                        className="max-w-full max-h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform scale-110 group-hover/track:scale-125 transition-transform duration-700" 
                                        alt={`${race.circuitName}`} 
                                    />
                                ) : (
                                    <MapPin size={64} className="text-white/10" />
                                )}
                            </div>
                        </div>
                        
                        {/* Centered City Overlay - Only for Desktop */}
                        <div className="absolute bottom-6 left-0 right-0 z-20 hidden @[768px]:flex justify-center">
                            <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl transition-all hover:bg-f1-pink/20 hover:border-f1-pink/30">
                                <MapPin size={12} className="text-f1-pink" />
                                <span className="text-sm font-bold text-white uppercase tracking-widest translate-y-[2px]">{race.city}</span>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Area */}
                    <div className="w-full @[768px]:w-7/12 p-6 flex flex-col justify-center relative bg-f1-card z-20">
                        
                        <div className="mb-6 border-b border-white/5 pb-6 flex flex-col @[375px]:flex-row @[375px]:items-center @[375px]:justify-between gap-4">
                            <div>
                                <div className="group/circuit inline-block mb-1">
                                    <div className="text-2xl font-bold text-white/80 leading-none uppercase tracking-tight transition-all group-hover/circuit:text-white group-hover/circuit:underline decoration-2 underline-offset-4 decoration-f1-pink">
                                        {race.circuitName}
                                    </div>
                                </div>

                                {/* Minimal City for Mobile (< 375px) */}
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-f1-pink uppercase tracking-widest mb-2.5 @[375px]:hidden">
                                    <MapPin size={10} className="translate-y-[1px]" />
                                    <span className="translate-y-[2px]">{race.city}</span>
                                </div>

                                {/* Minimal Info Row */}
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                    <span className="translate-y-[1px] hover:text-f1-pink transition-colors cursor-pointer">Runde {race.round}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                    <span className={`translate-y-[1px] hover:text-f1-pink transition-colors cursor-pointer ${race.format === 'sprint' ? 'text-orange-500/60' : ''}`}>
                                        {race.format === 'sprint' ? 'Sprint-Wochenende' : 'Standard-Wochenende'}
                                    </span>
                                </div>
                            </div>

                            {/* City Badge for Tablet Mode (375px - 768px) */}
                            <div className="hidden @[375px]:flex @[768px]:hidden">
                                <div className="bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-sm hover:bg-f1-pink/20 hover:border-f1-pink/30 transition-all">
                                    <MapPin size={12} className="text-f1-pink" />
                                    <span className="text-sm font-bold text-white uppercase tracking-widest translate-y-[2px]">{race.city}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sessions Grid */}
                        <div className="space-y-2">
                            {sessionKeys.map((key) => {
                                const dateStr = race.sessions[key];
                                const isRace = key === 'race';
                                return (
                                        <div 
                                            key={key} 
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group/session ${
                                                isRace 
                                                ? 'bg-f1-pink/10 border-f1-pink/30 shadow-[inset_0_0_15px_rgba(225,0,89,0.1)] hover:bg-f1-pink/20' 
                                                : 'bg-white/5 border-white/5 hover:bg-white/20 hover:border-f1-pink/30'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1 h-4 rounded-full ${isRace ? 'bg-f1-pink' : 'bg-white/20'}`}></div>
                                                <span className={`text-sm font-bold uppercase tracking-wide transition-colors translate-y-[2px] ${isRace ? 'text-white' : 'text-zinc-400 group-hover/session:text-white'}`}>
                                                    {getSessionLabel(key)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-right">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-bold uppercase not-italic leading-none translate-y-[2px] ${isRace ? 'text-f1-pink' : 'text-zinc-500'}`}>
                                                        {formatDate(dateStr)}
                                                    </span>
                                                    <span className={`text-lg font-black italic leading-none tabular-nums translate-y-[2px] ${isRace ? 'text-white' : 'text-zinc-300'}`}>
                                                        {formatTime(dateStr)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export const EventInspector: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const { updateBlock } = useEditor();
    const { races } = useData();

    return (
        <div className="space-y-4 font-sans">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Grand Prix auswählen</label>
                <select 
                    className="w-full border border-slate-200 rounded p-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-f1-pink" 
                    value={block.attributes?.id} 
                    onChange={e => updateBlock(block.clientId, { id: e.target.value })}
                >
                    <option value="">GP wählen...</option>
                    {races.sort((a,b) => a.round - b.round).map(r => (
                        <option key={r.id} value={r.id}>
                            Rd. {r.round}: {r.country} GP
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-400 leading-relaxed italic">
                Der Event-Block nutzt das standardisierte card-orientierte Design der F1-Entitäten. Er passt sich automatisch an das Rennformat (Standard vs. Sprint) an.
            </div>
        </div>
    );
};

export const defaultAttributes = { 
    id: '', 
    style: 'card' 
};
