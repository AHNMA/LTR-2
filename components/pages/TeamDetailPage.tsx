import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Facebook, Twitter, Instagram, Trophy, MapPin, Users, Zap, Car, Video } from 'lucide-react';
import { getFlagUrl } from '../../constants';

const TeamDetailPage: React.FC = () => {
    const { getTeam, getDriversByTeam } = useData();
    const { currentEntityId, goToDriver } = useNavigation();
    const team = currentEntityId ? getTeam(currentEntityId) : null;
    if (!team) return <div className="p-20 text-center text-white">Team not found</div>;
    const drivers = getDriversByTeam(team.id);

    return (
        <div className="bg-f1-dark min-h-screen pb-20 font-sans text-slate-300">
            <div className="relative h-[400px] md:h-[550px] bg-slate-950 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(45deg, ${team.color} 0%, transparent 100%)` }}></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-40"></div>
                <div className="absolute bottom-[-50px] right-[-50px] md:right-0 md:w-3/4 w-full opacity-100 transition-transform hover:scale-105 duration-[3s] flex items-end justify-end">
                    <img src={team.carImage} alt="Car" className="w-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]" />
                </div>
                <div className="container mx-auto px-4 h-full relative z-10 flex items-center">
                    <div className="max-w-2xl font-display">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="bg-white p-3 rounded-xl shadow-2xl"><img src={team.logo} alt={team.name} className="h-10 w-auto" /></div>
                            {getFlagUrl(team.nationalityFlag) && <img src={getFlagUrl(team.nationalityFlag)} alt={team.nationalityText} className="h-8 w-auto rounded border border-black/50 shadow-lg" />}
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.8] mb-8">{team.name}</h1>
                        <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <div className="flex items-center bg-white/5 px-4 py-2 rounded-full border border-white/5"><MapPin size={14} className="mr-2 text-f1-pink" /> {team.base}</div>
                            <div className="flex items-center bg-white/5 px-4 py-2 rounded-full border border-white/5"><Users size={14} className="mr-2 text-f1-pink" /> Principal: {team.teamPrincipal}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-f1-card text-white py-8 border-b border-white/5">
                <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[{val: team.rank, label: 'WCC Rank', c: 'text-f1-pink'}, {val: team.points, label: 'Points'}, {val: team.entryYear, label: 'Debut'}, {val: team.chassis, label: 'Chassis'}].map((s,i) => (
                        <div key={i}><div className={`text-4xl font-display font-black leading-none mb-1 ${s.c || 'text-white'}`}>{s.val}</div><div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{s.label}</div></div>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8">
                     <h2 className="text-3xl font-display font-black text-white mb-8 uppercase italic border-l-4 border-f1-pink pl-6 leading-none">Team History & Bio</h2>
                     <div className="text-slate-400 font-light leading-relaxed whitespace-pre-wrap text-lg mb-12">{team.bio || "No biography available."}</div>
                     {team.gallery && team.gallery.length > 0 && (
                        <div>
                             <h3 className="text-xl font-display font-black text-white mb-6 uppercase italic tracking-widest">Team Gallery</h3>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {team.gallery.map((img, idx) => (<div key={idx} className="aspect-video bg-f1-card rounded-xl overflow-hidden border border-white/5 hover:border-f1-pink/50 transition-colors cursor-pointer"><img src={img} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" alt="" /></div>))}
                             </div>
                        </div>
                     )}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-f1-card p-8 rounded-2xl border border-white/5 shadow-2xl">
                         <h3 className="font-black uppercase text-slate-500 text-[10px] tracking-[0.2em] mb-8 border-b border-white/5 pb-4">2026 Drivers</h3>
                         <div className="space-y-4">
                             {drivers.map(driver => (
                                 <div key={driver.id} onClick={() => goToDriver(driver.id)} className="flex items-center bg-white/5 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-f1-pink/10 hover:border-f1-pink/30 transition-all group">
                                     <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 shadow-lg mr-4 bg-slate-800"><img src={driver.image} className="w-full h-full object-cover" alt="" /></div>
                                     <div className="font-display italic">
                                         <div className="text-xl font-black text-white group-hover:text-f1-pink transition-colors leading-none uppercase">{driver.lastName}</div>
                                         <div className="text-xs text-slate-500 font-bold mt-1">#{driver.raceNumber}</div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>

                    <div className="bg-slate-950 text-white p-8 rounded-2xl relative overflow-hidden border border-white/5 shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Car size={120} /></div>
                        <h3 className="font-black uppercase text-slate-500 text-[10px] tracking-[0.2em] mb-8">Technical Specs</h3>
                        <dl className="space-y-6 relative z-10 font-display">
                            {[{l: 'Chassis', v: team.chassis}, {l: 'Power Unit', v: team.powerUnit}, {l: 'Base', v: team.base}].map((d,i) => (
                                <div key={i} className="flex justify-between border-b border-white/5 pb-2"><dt className="text-xs font-bold text-slate-500 uppercase not-italic tracking-widest">{d.l}</dt><dd className="font-black text-lg uppercase italic tracking-tight">{d.v}</dd></div>
                            ))}
                        </dl>
                    </div>

                    <div className="flex justify-center space-x-4">
                        {[Instagram, Twitter, Video].map((Icon, i) => (<button key={i} className="p-4 bg-f1-card rounded-xl text-slate-500 hover:text-white border border-white/5 hover:border-f1-pink transition-all"><Icon size={20} /></button>))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeamDetailPage;