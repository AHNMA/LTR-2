
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Facebook, Twitter, Instagram, MapPin, Calendar, Ruler, Weight, Flag, Award, Zap, Car, Video } from 'lucide-react';
import { getFlagUrl } from '../../constants';

const TeamsDriversPage: React.FC = () => {
  const { teams, getDriversByTeam } = useData();
  const { goToTeam, goToDriver } = useNavigation();

  return (
    <div className="bg-slate-50 min-h-screen pb-20 pt-8">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-4 uppercase italic">Teams & Drivers 2026</h1>
            <div className="h-1 w-24 bg-f1-pink mx-auto"></div>
        </div>

        <div className="space-y-16">
          {teams.map(team => {
            const drivers = getDriversByTeam(team.id);

            return (
              <div key={team.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                {/* Team Top Strip - Color Accent */}
                <div className="h-2 w-full" style={{ backgroundColor: team.color }}></div>

                {/* Team Header Section */}
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50">
                    <div className="flex items-center space-x-6 mb-4 md:mb-0 cursor-pointer group" onClick={() => goToTeam(team.id)}>
                        <div className="w-20 h-20 p-2 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-f1-pink transition-colors">
                             <img src={team.logo} alt={team.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <img src={getFlagUrl(team.nationalityFlag)} alt="" className="h-5 w-auto border border-black/50" />
                                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Est. {team.entryYear}</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 uppercase italic leading-none group-hover:text-f1-pink transition-colors">
                                {team.name}
                            </h2>
                        </div>
                    </div>
                    
                    {/* Team Socials */}
                    <div className="flex space-x-3">
                        {team.socials.facebook && <a href={team.socials.facebook} className="p-2 bg-white text-slate-400 hover:text-[#1877F2] rounded-full border border-slate-200 shadow-sm transition-colors"><Facebook size={18} /></a>}
                        {team.socials.twitter && <a href={team.socials.twitter} className="p-2 bg-white text-slate-400 hover:text-[#1DA1F2] rounded-full border border-slate-200 shadow-sm transition-colors"><Twitter size={18} /></a>}
                        {team.socials.instagram && <a href={team.socials.instagram} className="p-2 bg-white text-slate-400 hover:text-[#E1306C] rounded-full border border-slate-200 shadow-sm transition-colors"><Instagram size={18} /></a>}
                        {team.socials.tiktok && <a href={team.socials.tiktok} className="p-2 bg-white text-slate-400 hover:text-black rounded-full border border-slate-200 shadow-sm transition-colors"><Video size={18} /></a>}
                    </div>
                </div>

                {/* Middle: Drivers Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {drivers.map((driver, index) => (
                        <div key={driver.id} className="p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group">
                             {/* Number Watermark */}
                             <div className="absolute top-0 right-0 text-[120px] font-display font-bold text-slate-50 leading-none -mr-4 -mt-4 select-none z-0 pointer-events-none">
                                {driver.raceNumber}
                             </div>
                             
                             {/* Content Z-Index 10 */}
                             <div className="relative z-10 w-full">
                                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-slate-100 shadow-md mb-4 bg-slate-200 cursor-pointer relative" onClick={() => goToDriver(driver.id)}>
                                    <img src={driver.image} alt={driver.lastName} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                
                                <h3 className="text-2xl font-display font-bold text-slate-900 uppercase italic mb-1 cursor-pointer hover:text-f1-pink transition-colors" onClick={() => goToDriver(driver.id)}>
                                    {driver.firstName} {driver.lastName}
                                </h3>
                                <div className="flex justify-center items-center space-x-2 mb-6">
                                     <img src={getFlagUrl(driver.nationalityFlag)} alt="" className="h-4 w-auto border border-black/50" />
                                     <span className="text-xs font-bold text-slate-400 uppercase">{driver.nationalityText}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-left max-w-xs mx-auto mb-6">
                                    <div className="flex items-center space-x-2">
                                        <MapPin size={14} className="text-f1-pink shrink-0" />
                                        <div>
                                            <div className="text-[10px] uppercase text-slate-400 font-bold">Birthplace</div>
                                            <div className="text-xs font-bold text-slate-800 leading-tight">{driver.birthplace || '-'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar size={14} className="text-f1-pink shrink-0" />
                                        <div>
                                            <div className="text-[10px] uppercase text-slate-400 font-bold">Birthday</div>
                                            <div className="text-xs font-bold text-slate-800 leading-tight">{driver.dob || '-'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Ruler size={14} className="text-f1-pink shrink-0" />
                                        <div>
                                            <div className="text-[10px] uppercase text-slate-400 font-bold">Height</div>
                                            <div className="text-xs font-bold text-slate-800 leading-tight">{driver.height ? `${driver.height} cm` : '-'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Weight size={14} className="text-f1-pink shrink-0" />
                                        <div>
                                            <div className="text-[10px] uppercase text-slate-400 font-bold">Weight</div>
                                            <div className="text-xs font-bold text-slate-800 leading-tight">{driver.weight ? `${driver.weight} kg` : '-'}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Driver Socials */}
                                <div className="flex justify-center space-x-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    {driver.socials.facebook && <a href={driver.socials.facebook} className="text-slate-400 hover:text-[#1877F2]"><Facebook size={16} /></a>}
                                    {driver.socials.twitter && <a href={driver.socials.twitter} className="text-slate-400 hover:text-[#1DA1F2]"><Twitter size={16} /></a>}
                                    {driver.socials.instagram && <a href={driver.socials.instagram} className="text-slate-400 hover:text-[#E1306C]"><Instagram size={16} /></a>}
                                    {driver.socials.tiktok && <a href={driver.socials.tiktok} className="text-slate-400 hover:text-black"><Video size={16} /></a>}
                                </div>
                             </div>
                        </div>
                    ))}
                    {drivers.length === 0 && <div className="col-span-2 p-8 text-center text-slate-400 italic">No drivers assigned yet.</div>}
                </div>

                {/* Bottom: Car & Tech Specs */}
                <div className="bg-slate-900 text-white relative overflow-hidden">
                     {/* Car Image (Right aligned) */}
                     {team.carImage && (
                        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 md:opacity-100 pointer-events-none">
                            <div className="relative w-full h-full">
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10"></div>
                                <img src={team.carImage} alt="Car" className="w-full h-full object-contain object-right" />
                            </div>
                        </div>
                     )}

                     <div className="relative z-20 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl">
                        <div>
                             <div className="flex items-center text-f1-pink mb-2"><Flag size={16} className="mr-2" /> <span className="text-xs font-bold uppercase tracking-widest">Base</span></div>
                             <div className="font-bold">{team.base || '-'}</div>
                        </div>
                        <div>
                             <div className="flex items-center text-f1-pink mb-2"><Award size={16} className="mr-2" /> <span className="text-xs font-bold uppercase tracking-widest">Entry</span></div>
                             <div className="font-bold">{team.entryYear || '-'}</div>
                        </div>
                        <div>
                             <div className="flex items-center text-f1-pink mb-2"><Car size={16} className="mr-2" /> <span className="text-xs font-bold uppercase tracking-widest">Chassis</span></div>
                             <div className="font-bold">{team.chassis || '-'}</div>
                        </div>
                        <div>
                             <div className="flex items-center text-f1-pink mb-2"><Zap size={16} className="mr-2" /> <span className="text-xs font-bold uppercase tracking-widest">Power Unit</span></div>
                             <div className="font-bold">{team.powerUnit || '-'}</div>
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
