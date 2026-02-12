
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
    
    if (!driver) return <div className="p-20 text-center">Driver not found</div>;

    // Calc Age
    const age = new Date().getFullYear() - new Date(driver.dob).getFullYear();

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header / Hero */}
            <div className="relative pt-20 pb-0 md:pt-32 bg-slate-900 overflow-hidden">
                {/* Team Color Accent */}
                <div 
                    className="absolute top-0 left-0 w-full h-full opacity-20"
                    style={{ background: `linear-gradient(180deg, ${team?.color || '#333'} 0%, #0f172a 100%)` }}
                ></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-end">
                        
                        {/* Driver Cutout */}
                        <div className="order-2 md:order-1 w-full md:w-5/12 relative -mb-4 z-20">
                             <img src={driver.image} alt={driver.lastName} className="w-full h-auto drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
                        </div>

                        {/* Info Block */}
                        <div className="order-1 md:order-2 w-full md:w-7/12 pb-12 md:pl-12">
                             <div className="flex items-center space-x-4 mb-4">
                                <span className="text-6xl font-display font-bold text-white/10">{driver.raceNumber}</span>
                                <img 
                                    src={getFlagUrl(driver.nationalityFlag)} 
                                    alt={driver.nationalityText}
                                    className="h-8 w-auto rounded border border-black/50" 
                                />
                                {team && (
                                    <div 
                                        className="flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full cursor-pointer hover:bg-white/20 transition-colors"
                                        onClick={() => goToTeam(team.id)}
                                    >
                                        <img src={team.logo} className="h-6 w-auto" alt="" />
                                        <span className="text-white font-bold uppercase text-xs tracking-wider">{team.name}</span>
                                    </div>
                                )}
                             </div>
                             <h1 className="text-5xl md:text-8xl font-display font-bold text-white uppercase italic tracking-tighter leading-none mb-6">
                                <span className="block text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 not-italic mb-2">{driver.firstName}</span>
                                {driver.lastName}
                             </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-[60px] z-30 shadow-sm">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center overflow-x-auto">
                      <div className="flex space-x-8 md:space-x-16 text-center min-w-max">
                           <div>
                               <div className="text-xs uppercase text-slate-400 font-bold tracking-widest">Rank</div>
                               <div className="text-2xl font-display font-bold text-f1-pink">{driver.rank}</div>
                           </div>
                           <div>
                               <div className="text-xs uppercase text-slate-400 font-bold tracking-widest">Points</div>
                               <div className="text-2xl font-display font-bold text-slate-900">{driver.points}</div>
                           </div>
                            <div>
                               <div className="text-xs uppercase text-slate-400 font-bold tracking-widest">Wins</div>
                               <div className="text-2xl font-display font-bold text-slate-900">--</div>
                           </div>
                           <div>
                               <div className="text-xs uppercase text-slate-400 font-bold tracking-widest">Podiums</div>
                               <div className="text-2xl font-display font-bold text-slate-900">--</div>
                           </div>
                      </div>
                      
                      {/* Socials */}
                       <div className="flex space-x-3 pl-8 border-l border-slate-100 hidden md:flex">
                        {driver.socials.facebook && <a href={driver.socials.facebook} className="text-slate-400 hover:text-[#1877F2]"><Facebook size={18} /></a>}
                        {driver.socials.twitter && <a href={driver.socials.twitter} className="text-slate-400 hover:text-[#1DA1F2]"><Twitter size={18} /></a>}
                        {driver.socials.instagram && <a href={driver.socials.instagram} className="text-slate-400 hover:text-[#E1306C]"><Instagram size={18} /></a>}
                        {driver.socials.tiktok && <a href={driver.socials.tiktok} className="text-slate-400 hover:text-black"><Video size={18} /></a>}
                    </div>
                 </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                 {/* Sidebar Info */}
                 <div className="lg:col-span-4 order-2 lg:order-1">
                      <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                           <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider mb-6">Driver Profile</h3>
                           <dl className="space-y-6">
                                <div className="flex items-center">
                                     <div className="w-10 text-center"><Calendar className="mx-auto text-f1-pink" size={20} /></div>
                                     <div className="flex-1 ml-2">
                                         <dt className="text-xs text-slate-500 uppercase font-bold">Age</dt>
                                         <dd className="font-bold text-slate-900">{age} Years ({driver.dob})</dd>
                                     </div>
                                </div>
                                <div className="flex items-center">
                                     <div className="w-10 text-center"><MapPin className="mx-auto text-f1-pink" size={20} /></div>
                                     <div className="flex-1 ml-2">
                                         <dt className="text-xs text-slate-500 uppercase font-bold">Place of Birth</dt>
                                         <dd className="font-bold text-slate-900">{driver.birthplace}</dd>
                                     </div>
                                </div>
                                <div className="flex items-center">
                                     <div className="w-10 text-center"><Ruler className="mx-auto text-f1-pink" size={20} /></div>
                                     <div className="flex-1 ml-2">
                                         <dt className="text-xs text-slate-500 uppercase font-bold">Height</dt>
                                         <dd className="font-bold text-slate-900">{driver.height} cm</dd>
                                     </div>
                                </div>
                                <div className="flex items-center">
                                     <div className="w-10 text-center"><Weight className="mx-auto text-f1-pink" size={20} /></div>
                                     <div className="flex-1 ml-2">
                                         <dt className="text-xs text-slate-500 uppercase font-bold">Weight</dt>
                                         <dd className="font-bold text-slate-900">{driver.weight} kg</dd>
                                     </div>
                                </div>
                           </dl>
                      </div>
                 </div>

                 {/* Bio Content */}
                 <div className="lg:col-span-8 order-1 lg:order-2">
                     <h2 className="text-3xl font-display font-bold text-slate-900 mb-6 uppercase border-l-4 border-f1-pink pl-4">Biography</h2>
                     <div className="prose prose-lg text-slate-600 font-light leading-relaxed whitespace-pre-wrap">
                         {driver.bio || "No biography available."}
                     </div>

                      {/* Gallery */}
                     {driver.gallery && driver.gallery.length > 0 && (
                        <div className="mt-12">
                             <h3 className="text-xl font-display font-bold text-slate-900 mb-6 uppercase">Gallery</h3>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {driver.gallery.map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ))}
                             </div>
                        </div>
                     )}
                 </div>
            </div>

        </div>
    );
};

export default DriverDetailPage;
