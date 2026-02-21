import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Facebook, Twitter, Instagram, Trophy, MapPin, Calendar, Ruler, Weight, Video } from 'lucide-react';
import { getFlagUrl } from '../../constants';

const DriverDetailPage: React.FC = () => {
    const { getDriver, getTeam } = useData();
    const { currentEntityId, goToTeam } = useNavigation();
    const driver = currentEntityId ? getDriver(currentEntityId) : null;
    const team = driver && driver.teamId ? getTeam(driver.teamId) : null;
    if (!driver) return <div className="p-20 text-center text-white">Driver not found</div>;
    const age = new Date().getFullYear() - new Date(driver.dob).getFullYear();

    return (
        <div className="bg-f1-dark min-h-screen pb-20 font-sans text-slate-300">
            <div className="relative pt-20 pb-0 md:pt-32 bg-slate-950 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ background: `linear-gradient(180deg, ${team?.color || '#333'} 0%, #0f1014 100%)` }}></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-end">
                        <div className="order-2 md:order-1 w-full md:w-5/12 relative -mb-4 z-20"><img src={driver.image} alt={driver.lastName} className="w-full h-auto drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]" /></div>
                        <div className="order-1 md:order-2 w-full md:w-7/12 pb-12 md:pl-12 font-display italic">
                             <div className="flex items-center space-x-6 mb-8 not-italic">
                                <span className="text-7xl font-black text-white/5 leading-none">#{driver.raceNumber}</span>
                                {getFlagUrl(driver.nationalityFlag) && <img src={getFlagUrl(driver.nationalityFlag)} alt={driver.nationalityText} className="h-8 w-auto rounded border border-black/50 shadow-lg" />}
                                {team && (
                                    <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl cursor-pointer hover:bg-white/10 transition-all" onClick={() => goToTeam(team.id)}>
                                        <img src={team.logo} className="h-6 w-auto" alt="" />
                                        <span className="text-white font-black uppercase text-[10px] tracking-[0.2em]">{team.name}</span>
                                    </div>
                                )}
                             </div>
                             <h1 className="text-5xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.8] mb-8">
                                <span className="block text-3xl md:text-5xl text-f1-pink not-italic mb-2 tracking-widest">{driver.firstName}</span>
                                {driver.lastName}
                             </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-f1-card border-b border-white/5 sticky top-[60px] z-30 shadow-2xl backdrop-blur-md bg-opacity-90">
                 <div className="container mx-auto px-4 py-6 flex justify-between items-center overflow-x-auto">
                      <div className="flex space-x-12 md:space-x-20 text-center min-w-max font-display">
                           {/* Fix: use 's.v' instead of 's.val' to match object property names in map */}
                           {[{l: 'Rank', v: driver.rank, c: 'text-f1-pink'}, {l: 'Points', v: driver.points}, {l: 'Wins', v: '--'}, {l: 'Podiums', v: '--'}].map((s,i)=>(
                               <div key={i}><div className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em] mb-1">{s.l}</div><div className={`text-3xl font-black italic ${s.c || 'text-white'}`}>{s.v}</div></div>
                           ))}
                      </div>
                      <div className="flex space-x-3 pl-8 border-l border-white/5 hidden md:flex">
                        {[Instagram, Twitter, Video].map((Icon, i) => (<button key={i} className="p-2.5 bg-white/5 rounded-lg text-slate-500 hover:text-white border border-white/5 transition-all"><Icon size={18} /></button>))}
                    </div>
                 </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <div className="lg:col-span-4 order-2 lg:order-1">
                      <div className="bg-f1-card rounded-2xl p-8 border border-white/5 shadow-2xl">
                           <h3 className="font-black uppercase text-slate-500 text-[10px] tracking-[0.2em] mb-10 border-b border-white/5 pb-4">Driver Profile</h3>
                           <dl className="space-y-8 font-display">
                                {[{i: Calendar, l: 'Age', v: `${age} Years (${driver.dob})`}, {i: MapPin, l: 'Origin', v: driver.birthplace}, {i: Ruler, l: 'Height', v: `${driver.height} cm`}, {i: Weight, l: 'Weight', v: `${driver.weight} kg`}].map((d,i)=>(
                                    <div key={i} className="flex items-center">
                                         <div className="w-10 text-center"><d.i className="mx-auto text-f1-pink" size={22} /></div>
                                         <div className="flex-1 ml-4 border-b border-white/5 pb-2">
                                             <dt className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{d.l}</dt>
                                             <dd className="font-bold text-white text-xl uppercase italic tracking-tight">{d.v}</dd>
                                         </div>
                                    </div>
                                ))}
                           </dl>
                      </div>
                 </div>
                 <div className="lg:col-span-8 order-1 lg:order-2">
                     <h2 className="text-3xl font-display font-black text-white mb-8 uppercase italic border-l-4 border-f1-pink pl-6 leading-none">Biography</h2>
                     <div className="text-slate-400 font-light leading-relaxed whitespace-pre-wrap text-lg mb-12">{driver.bio || "No biography available."}</div>
                     {driver.gallery && driver.gallery.length > 0 && (
                        <div>
                             <h3 className="text-xl font-display font-black text-white mb-6 uppercase italic tracking-widest">Gallery</h3>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {driver.gallery.map((img, idx) => (<div key={idx} className="aspect-square bg-f1-card rounded-xl overflow-hidden border border-white/5 cursor-pointer"><img src={img} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" alt="" /></div>))}
                             </div>
                        </div>
                     )}
                 </div>
            </div>
        </div>
    );
};

export default DriverDetailPage;