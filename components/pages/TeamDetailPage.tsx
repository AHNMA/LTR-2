
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Facebook, Twitter, Instagram, Trophy, MapPin, Users, Zap, Car, Video } from 'lucide-react';
import { getFlagUrl } from '../../constants';

const TeamDetailPage: React.FC = () => {
    const { getTeam, getDriversByTeam } = useData();
    const { currentEntityId, goToDriver } = useNavigation();
    
    const team = currentEntityId ? getTeam(currentEntityId) : null;
    
    if (!team) return <div className="p-20 text-center">Team not found</div>;

    const drivers = getDriversByTeam(team.id);

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header Hero */}
            <div className="relative h-[400px] md:h-[500px] bg-slate-900 overflow-hidden">
                {/* Background Pattern using team color */}
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{ background: `linear-gradient(45deg, ${team.color} 0%, transparent 100%)` }}
                ></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                
                {/* Car Image Large */}
                <div className="absolute bottom-[-50px] right-[-100px] md:right-0 md:w-2/3 w-full opacity-100 transition-transform hover:scale-105 duration-1000">
                    <img src={team.carImage} alt="Car" className="w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
                </div>

                <div className="container mx-auto px-4 h-full relative z-10 flex items-center">
                    <div className="max-w-2xl">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="bg-white p-2 rounded-lg shadow-lg">
                                <img src={team.logo} alt={team.name} className="h-12 w-auto" />
                            </div>
                            <img 
                                src={getFlagUrl(team.nationalityFlag)} 
                                alt={team.nationalityText} 
                                className="h-8 w-auto rounded border border-black/50" 
                            />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-display font-bold text-white uppercase italic tracking-tighter leading-none mb-6">
                            {team.name}
                        </h1>
                        <div className="flex space-x-6 text-white/80 font-bold uppercase tracking-wider text-sm">
                            <div className="flex items-center"><MapPin size={16} className="mr-2 text-f1-pink" /> {team.base}</div>
                            <div className="flex items-center"><Users size={16} className="mr-2 text-f1-pink" /> Principal: {team.teamPrincipal}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-slate-900 text-white py-6 border-t border-white/10">
                <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-3xl font-display font-bold text-f1-pink">{team.rank}</div>
                        <div className="text-xs uppercase text-slate-400 tracking-widest">WCC Rank</div>
                    </div>
                     <div>
                        <div className="text-3xl font-display font-bold">{team.points}</div>
                        <div className="text-xs uppercase text-slate-400 tracking-widest">Points</div>
                    </div>
                     <div>
                        <div className="text-3xl font-display font-bold">{team.entryYear}</div>
                        <div className="text-xs uppercase text-slate-400 tracking-widest">Debut</div>
                    </div>
                     <div>
                        <div className="text-3xl font-display font-bold">{team.chassis}</div>
                        <div className="text-xs uppercase text-slate-400 tracking-widest">Chassis</div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Main Content */}
                <div className="lg:col-span-8">
                     <h2 className="text-3xl font-display font-bold text-slate-900 mb-6 uppercase border-l-4 border-f1-pink pl-4">Team History & Bio</h2>
                     <div className="prose prose-lg text-slate-600 font-light leading-relaxed whitespace-pre-wrap">
                         {team.bio || "No biography available."}
                     </div>

                     {/* Gallery */}
                     {team.gallery && team.gallery.length > 0 && (
                        <div className="mt-12">
                             <h3 className="text-xl font-display font-bold text-slate-900 mb-6 uppercase">Gallery</h3>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {team.gallery.map((img, idx) => (
                                    <div key={idx} className="aspect-video bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ))}
                             </div>
                        </div>
                     )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Drivers Card */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                         <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider mb-6">2026 Drivers</h3>
                         <div className="space-y-4">
                             {drivers.map(driver => (
                                 <div 
                                    key={driver.id} 
                                    onClick={() => goToDriver(driver.id)}
                                    className="flex items-center bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                                >
                                     <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm mr-4">
                                         <img src={driver.image} className="w-full h-full object-cover" alt="" />
                                     </div>
                                     <div>
                                         <div className="font-display font-bold text-xl text-slate-900 group-hover:text-f1-pink transition-colors">{driver.firstName} {driver.lastName}</div>
                                         <div className="text-xs text-slate-500 font-bold">#{driver.raceNumber}</div>
                                     </div>
                                     <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                         <span className="text-f1-pink text-xs font-bold uppercase">Profile</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>

                    {/* Tech Specs */}
                    <div className="bg-slate-900 text-white p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Car size={100} />
                        </div>
                        <h3 className="font-bold uppercase text-white/50 text-xs tracking-wider mb-6">Technical Data</h3>
                        <dl className="space-y-4 relative z-10">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <dt className="text-sm font-medium text-slate-400">Chassis</dt>
                                <dd className="font-bold">{team.chassis}</dd>
                            </div>
                             <div className="flex justify-between border-b border-white/10 pb-2">
                                <dt className="text-sm font-medium text-slate-400">Power Unit</dt>
                                <dd className="font-bold">{team.powerUnit}</dd>
                            </div>
                             <div className="flex justify-between border-b border-white/10 pb-2">
                                <dt className="text-sm font-medium text-slate-400">Base</dt>
                                <dd className="font-bold">{team.base}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Socials */}
                    <div className="flex justify-center space-x-4">
                        {team.socials.facebook && <a href={team.socials.facebook} className="p-3 bg-slate-100 rounded-full hover:bg-[#1877F2] hover:text-white transition-colors"><Facebook size={20} /></a>}
                        {team.socials.twitter && <a href={team.socials.twitter} className="p-3 bg-slate-100 rounded-full hover:bg-[#1DA1F2] hover:text-white transition-colors"><Twitter size={20} /></a>}
                        {team.socials.instagram && <a href={team.socials.instagram} className="p-3 bg-slate-100 rounded-full hover:bg-[#E1306C] hover:text-white transition-colors"><Instagram size={20} /></a>}
                        {team.socials.tiktok && <a href={team.socials.tiktok} className="p-3 bg-slate-100 rounded-full hover:bg-black hover:text-white transition-colors"><Video size={20} /></a>}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default TeamDetailPage;
