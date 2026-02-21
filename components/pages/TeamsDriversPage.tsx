import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Facebook, Twitter, Instagram, MapPin, Calendar, Ruler, Weight, Flag, Award, Zap, Car, Video } from 'lucide-react';
import { getFlagUrl } from '../../constants';

const TeamsDriversPage: React.FC = () => {
  const { teams, getDriversByTeam } = useData();
  const { goToTeam, goToDriver } = useNavigation();

  return (
    <div className="bg-f1-dark min-h-screen pb-20 pt-8 font-sans">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 uppercase italic leading-none tracking-tighter">Teams & Drivers 2026</h1>
            <div className="h-1.5 w-24 bg-f1-pink mx-auto rounded-full shadow-glow"></div>
        </div>

        <div className="space-y-16">
          {teams.map(team => {
            const drivers = getDriversByTeam(team.id);

            return (
              <div key={team.id} className="bg-f1-card rounded-2xl shadow-2xl border border-white/5 overflow-hidden relative group/card">
                {/* Team Top Strip - Color Accent */}
                <div className="h-1.5 w-full shadow-lg" style={{ backgroundColor: team.color }}></div>

                {/* Team Header Section */}
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-white/5">
                    <div className="flex items-center space-x-6 mb-4 md:mb-0 cursor-pointer group" onClick={() => goToTeam(team.id)}>
                        <div className="w-20 h-20 p-2 bg-white rounded-xl shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform border-2 border-transparent group-hover:border-f1-pink">
                             <img src={team.logo} alt={team.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                {getFlagUrl(team.nationalityFlag) && <img src={getFlagUrl(team.nationalityFlag)} alt="" className="h-5 w-auto border border-black/50 rounded-sm" />}
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Est. {team.entryYear}</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase italic leading-none group-hover:text-f1-pink transition-colors tracking-tight">
                                {team.name}
                            </h2>
                        </div>
                    </div>
                    
                    {/* Team Socials */}
                    <div className="flex space-x-3">
                        {team.socials.instagram && <a href={team.socials.instagram} className="p-2.5 bg-white/5 text-slate-400 hover:text-white rounded-lg border border-white/5 transition-all hover:bg-f1-pink shadow-sm"><Instagram size={18} /></a>}
                        {team.socials.twitter && <a href={team.socials.twitter} className="p-2.5 bg-white/5 text-slate-400 hover:text-white rounded-lg border border-white/5 transition-all hover:bg-f1-pink shadow-sm"><Twitter size={18} /></a>}
                        {team.socials.tiktok && <a href={team.socials.tiktok} className="p-2.5 bg-white/5 text-slate-400 hover:text-white rounded-lg border border-white/5 transition-all hover:bg-f1-pink shadow-sm"><Video size={18} /></a>}
                    </div>
                </div>

                {/* Middle: Drivers Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                    {drivers.map((driver, index) => (
                        <div key={driver.id} className="p-6 md:p-10 flex flex-col items-center text-center relative overflow-hidden group/driver">
                             {/* Number Watermark */}
                             <div className="absolute top-0 right-0 text-[140px] font-display font-black text-white/5 leading-none -mr-4 -mt-8 select-none z-0 pointer-events-none italic">
                                {driver.raceNumber}
                             </div>
                             
                             <div className="relative z-10 w-full">
                                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white/5 shadow-2xl mb-6 bg-slate-800 cursor-pointer relative group/img" onClick={() => goToDriver(driver.id)}>
                                    <img src={driver.image} alt={driver.lastName} className="w-full h-full object-cover transform group-hover/driver:scale-110 transition-transform duration-700 opacity-90 group-hover/driver:opacity-100" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-f1-dark/40 to-transparent"></div>
                                </div>
                                
                                <h3 className="text-3xl font-display font-bold text-white uppercase italic mb-1 cursor-pointer hover:text-f1-pink transition-colors tracking-tight" onClick={() => goToDriver(driver.id)}>
                                    <span className="block text-sm font-normal text-slate-500 not-italic tracking-widest mb-1">{driver.firstName}</span>
                                    {driver.lastName}
                                </h3>
                                <div className="flex justify-center items-center space-x-2 mb-8">
                                     {getFlagUrl(driver.nationalityFlag) && <img src={getFlagUrl(driver.nationalityFlag)} alt="" className="h-4 w-auto border border-black/50" />}
                                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{driver.nationalityText}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-6 text-left max-w-xs mx-auto mb-6 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                    <div className="flex items-center space-x-3">
                                        <MapPin size={14} className="text-f1-pink shrink-0" />
                                        <div>
                                            <div className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Origin</div>
                                            <div className="text-xs font-bold text-white leading-tight truncate">{driver.birthplace || '-'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Calendar size={14} className="text-f1-pink shrink-0" />
                                        <div>
                                            <div className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Born</div>
                                            <div className="text-xs font-bold text-white leading-tight">{driver.dob || '-'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Ruler size={14} className="text-f1-pink shrink-0" />
                                        <div>
                                            <div className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Height</div>
                                            <div className="text-xs font-bold text-white leading-tight">{driver.height} CM</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Weight size={14} className="text-f1-pink shrink-0" />
                                        <div>
                                            <div className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Weight</div>
                                            <div className="text-xs font-bold text-white leading-tight">{driver.weight} KG</div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>

                {/* Bottom: Car & Tech Specs */}
                <div className="bg-slate-950 text-white relative overflow-hidden border-t border-white/5">
                     {team.carImage && (
                        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 md:opacity-100 pointer-events-none flex items-center justify-end">
                            <div className="relative w-full h-full flex items-center justify-end">
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-10"></div>
                                <img src={team.carImage} alt="Car" className="h-3/4 object-contain object-right transform group-hover/card:scale-105 transition-transform duration-[2s]" />
                            </div>
                        </div>
                     )}

                     <div className="relative z-20 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl font-display italic">
                        <div>
                             <div className="flex items-center text-slate-500 mb-2 not-italic"><Flag size={14} className="mr-2 text-f1-pink" /> <span className="text-[10px] font-black uppercase tracking-widest">Base</span></div>
                             <div className="text-xl font-bold uppercase tracking-tight">{team.base || '-'}</div>
                        </div>
                        <div>
                             <div className="flex items-center text-slate-500 mb-2 not-italic"><Award size={14} className="mr-2 text-f1-pink" /> <span className="text-[10px] font-black uppercase tracking-widest">Entry</span></div>
                             <div className="text-xl font-bold uppercase tracking-tight">{team.entryYear || '-'}</div>
                        </div>
                        <div>
                             <div className="flex items-center text-slate-500 mb-2 not-italic"><Car size={14} className="mr-2 text-f1-pink" /> <span className="text-[10px] font-black uppercase tracking-widest">Chassis</span></div>
                             <div className="text-xl font-bold uppercase tracking-tight">{team.chassis || '-'}</div>
                        </div>
                        <div>
                             <div className="flex items-center text-slate-500 mb-2 not-italic"><Zap size={14} className="mr-2 text-f1-pink" /> <span className="text-[10px] font-black uppercase tracking-widest">Power</span></div>
                             <div className="text-xl font-bold uppercase tracking-tight">{team.powerUnit || '-'}</div>
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

export default TeamsDriversPage;