
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { ChevronUp, ChevronDown, Minus, Trophy, Calculator, CheckCircle2, XCircle } from 'lucide-react';

const StandingsPage: React.FC = () => {
  const { drivers, teams, races } = useData();
  const { goToDriver, goToTeam } = useNavigation();
  const [activeTab, setActiveTab] = useState<'drivers' | 'teams'>('drivers');

  // --- CHAMPIONSHIP MATH LOGIC ---
  const championshipMath = useMemo(() => {
      // 1. Calculate Remaining Points available
      const remainingRaces = races.filter(r => r.status !== 'completed');
      const standardRacesCount = remainingRaces.length;
      const sprintRacesCount = remainingRaces.filter(r => r.format === 'sprint').length;

      // Driver: 25 (Win) + 1 (FL) = 26 per Race | 8 per Sprint
      const driverMaxRemaining = (standardRacesCount * 26) + (sprintRacesCount * 8);

      // Team: 25+18+1 (P1+P2+FL) = 44 per Race | 8+7 (P1+P2) = 15 per Sprint
      const teamMaxRemaining = (standardRacesCount * 44) + (sprintRacesCount * 15);

      return { driverMaxRemaining, teamMaxRemaining, remainingEvents: standardRacesCount };
  }, [races]);

  // Sort data
  const sortedDrivers = [...drivers].sort((a, b) => a.rank - b.rank);
  const sortedTeams = [...teams].sort((a, b) => a.rank - b.rank);

  // Determine Leaders and Cutoffs
  const driverLeaderPoints = sortedDrivers[0]?.points || 0;
  const teamLeaderPoints = sortedTeams[0]?.points || 0;

  const driverCutoff = driverLeaderPoints - championshipMath.driverMaxRemaining;
  const teamCutoff = teamLeaderPoints - championshipMath.teamMaxRemaining;

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
    switch (trend) {
      case 'up': return <div className="bg-green-100 text-green-600 p-1 rounded-full"><ChevronUp size={14} /></div>;
      case 'down': return <div className="bg-red-100 text-red-600 p-1 rounded-full"><ChevronDown size={14} /></div>;
      default: return <div className="bg-slate-100 text-slate-400 p-1 rounded-full"><Minus size={14} /></div>;
    }
  };

  const getTeamForDriver = (teamId: string | null) => {
      return teams.find(t => t.id === teamId);
  };

  const ContendersView = () => {
      const isDrivers = activeTab === 'drivers';
      const maxRemaining = isDrivers ? championshipMath.driverMaxRemaining : championshipMath.teamMaxRemaining;
      const leaderPoints = isDrivers ? driverLeaderPoints : teamLeaderPoints;
      const candidates = isDrivers 
        ? sortedDrivers.filter(d => d.points + maxRemaining >= leaderPoints)
        : sortedTeams.filter(t => t.points + maxRemaining >= leaderPoints);

      if (candidates.length <= 1) {
          // Champion decided
          const winner = candidates[0];
          if (!winner) return null;
          return (
              <div className="bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm sticky top-24">
                  <div className="bg-white p-4 rounded-full shadow-md mb-4">
                     <Trophy size={40} className="text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-bold text-yellow-800 uppercase tracking-widest mb-1">Weltmeister {activeTab === 'drivers' ? '2026' : '2026'}</h3>
                  <div className="text-2xl font-display font-bold text-slate-900 leading-none">
                      {isDrivers ? (winner as any).lastName : (winner as any).name}
                  </div>
                  <div className="h-1 w-12 bg-yellow-400 my-4 rounded-full"></div>
                  <p className="text-xs text-yellow-800 font-medium">Der Titel ist rechnerisch entschieden.</p>
              </div>
          );
      }

      return (
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden sticky top-24">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Calculator size={120} />
              </div>
              
              <div className="relative z-10">
                  <div className="mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-f1-pink flex items-center mb-2">
                          <Calculator size={16} className="mr-2" /> Title Watch
                      </h3>
                      <div className="text-xs text-slate-400 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                          Noch <span className="text-white font-bold">{championshipMath.remainingEvents}</span> Rennen.<br/>
                          Maximal <span className="text-white font-bold">{maxRemaining}</span> Punkte offen.
                      </div>
                  </div>

                  <div className="space-y-3">
                      {candidates.map(candidate => {
                          const gap = leaderPoints - candidate.points;
                          const name = isDrivers ? (candidate as any).lastName : (candidate as any).name;
                          const firstName = isDrivers ? (candidate as any).firstName : '';
                          const img = isDrivers ? (candidate as any).image : (candidate as any).logo;
                          const teamColor = isDrivers ? getTeamForDriver((candidate as any).teamId)?.color : (candidate as any).color;
                          
                          return (
                              <div key={candidate.id} className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/10 flex items-center justify-between group hover:bg-white/20 transition-colors">
                                  <div className="flex items-center space-x-3">
                                      <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 ${!isDrivers ? 'bg-white p-1' : 'bg-slate-800'}`} style={{ borderColor: teamColor || '#ffffff' }}>
                                          <img src={img} className="w-full h-full object-cover" alt="" />
                                      </div>
                                      <div>
                                          <div className="font-bold text-sm leading-none text-white">
                                              <span className="text-xs font-normal opacity-70 block mb-0.5">{firstName}</span>
                                              {name}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className={`text-xs font-bold uppercase ${gap === 0 ? 'text-green-400' : 'text-f1-pink'}`}>
                                          {gap === 0 ? 'Leader' : `-${gap}`}
                                      </div>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/10 text-[10px] text-center text-slate-500">
                      Mathematisch noch im Rennen um den Titel.
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 pt-8 font-sans">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-4 uppercase italic">WM-Stand 2026</h1>
            <div className="h-1 w-24 bg-f1-pink mx-auto"></div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
            <div className="bg-white p-1 rounded-full shadow-sm border border-slate-200 inline-flex">
                <button 
                    onClick={() => setActiveTab('drivers')}
                    className={`px-8 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'drivers' ? 'bg-f1-pink text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Fahrerwertung
                </button>
                <button 
                    onClick={() => setActiveTab('teams')}
                    className={`px-8 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'teams' ? 'bg-f1-pink text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Konstrukteure
                </button>
            </div>
        </div>

        <div className="max-w-7xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Main Table Column */}
                <div className="lg:col-span-8 order-2 lg:order-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Table Header */}
                    <div className="grid grid-cols-12 bg-slate-50 text-xs font-bold uppercase text-slate-400 tracking-widest p-4 border-b border-slate-100 sticky top-0 z-20">
                        <div className="col-span-2 md:col-span-1 text-center">Pos</div>
                        <div className="col-span-5 md:col-span-4 pl-4">{activeTab === 'drivers' ? 'Fahrer' : 'Team'}</div>
                        <div className="col-span-2 hidden md:block text-center">{activeTab === 'drivers' ? 'Team' : ''}</div>
                        <div className="col-span-3 md:col-span-3 text-center">Status</div>
                        <div className="col-span-2 text-right pr-4">Punkte</div>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-slate-100">
                        {activeTab === 'drivers' ? (
                            sortedDrivers.map((driver) => {
                                const team = getTeamForDriver(driver.teamId);
                                const isTop3 = driver.rank <= 3;
                                const isEliminated = driver.points < driverCutoff;
                                
                                return (
                                    <div 
                                        key={driver.id} 
                                        onClick={() => goToDriver(driver.id)}
                                        className={`grid grid-cols-12 p-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group ${isTop3 ? 'bg-yellow-50/10' : ''} ${isEliminated ? 'opacity-50 grayscale-[0.8]' : ''}`}
                                    >
                                        {/* Rank */}
                                        <div className="col-span-2 md:col-span-1 flex justify-center">
                                            <div className={`font-display font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-lg ${
                                                driver.rank === 1 ? 'bg-yellow-400 text-white shadow-md' : 
                                                driver.rank === 2 ? 'bg-slate-300 text-white' : 
                                                driver.rank === 3 ? 'bg-amber-600 text-white' : 
                                                'text-slate-900 bg-slate-100'
                                            }`}>
                                                {driver.rank}
                                            </div>
                                        </div>

                                        {/* Driver */}
                                        <div className="col-span-5 md:col-span-4 pl-4 flex items-center">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 mr-4 bg-slate-100 shrink-0 relative">
                                                <img src={driver.image} alt={driver.lastName} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-bold text-slate-900 truncate group-hover:text-f1-pink transition-colors text-sm md:text-base">
                                                    <span className="hidden md:inline font-normal text-slate-500 mr-1">{driver.firstName}</span>
                                                    {driver.lastName}
                                                </div>
                                                <div className="flex items-center text-xs text-slate-400 md:hidden mt-0.5">
                                                    {team ? team.name : 'Free Agent'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Team (Desktop) */}
                                        <div className="col-span-2 hidden md:flex items-center justify-center">
                                            {team && (
                                                <div 
                                                    className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-white border border-transparent hover:border-slate-100 transition-all cursor-pointer"
                                                    onClick={(e) => { e.stopPropagation(); goToTeam(team.id); }}
                                                >
                                                    <div className="w-1 h-4 rounded-full" style={{backgroundColor: team.color}}></div>
                                                    <span className="text-xs font-bold text-slate-600 uppercase truncate max-w-[100px]">{team.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status / Trend */}
                                        <div className="col-span-3 flex justify-center items-center flex-col md:flex-row md:space-x-3">
                                            <TrendIcon trend={driver.trend} />
                                            <div className="mt-1 md:mt-0">
                                                {isEliminated ? (
                                                    <span className="text-[9px] font-bold uppercase text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded flex items-center">
                                                        <XCircle size={10} className="mr-1" /> Raus
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold uppercase text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded flex items-center">
                                                        <CheckCircle2 size={10} className="mr-1" /> Aktiv
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Points */}
                                        <div className="col-span-2 text-right pr-4">
                                            <div className="font-display font-bold text-lg md:text-xl text-slate-900 bg-slate-100 px-2 md:px-3 py-1 rounded inline-block min-w-[50px] text-center">
                                                {driver.points}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            sortedTeams.map((team) => {
                                const isEliminated = team.points < teamCutoff;

                                return (
                                    <div 
                                        key={team.id} 
                                        onClick={() => goToTeam(team.id)}
                                        className={`grid grid-cols-12 p-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group ${isEliminated ? 'opacity-50 grayscale-[0.8]' : ''}`}
                                    >
                                        {/* Rank */}
                                        <div className="col-span-2 md:col-span-1 flex justify-center">
                                            <div className={`font-display font-bold text-2xl w-9 h-9 flex items-center justify-center rounded-lg ${
                                                team.rank === 1 ? 'bg-yellow-400 text-white shadow-md' : 
                                                team.rank === 2 ? 'bg-slate-300 text-white' : 
                                                team.rank === 3 ? 'bg-amber-600 text-white' : 
                                                'text-slate-900 bg-slate-100'
                                            }`}>
                                                {team.rank}
                                            </div>
                                        </div>

                                        {/* Team */}
                                        <div className="col-span-5 md:col-span-4 pl-4 flex items-center">
                                            <div className="w-10 h-10 md:w-12 md:h-8 rounded p-1 bg-white border border-slate-200 mr-4 shrink-0 flex items-center justify-center">
                                                <img src={team.logo} alt={team.name} className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-bold text-slate-900 uppercase italic text-sm md:text-lg group-hover:text-f1-pink transition-colors truncate">
                                                    {team.name}
                                                </div>
                                                <div className="h-0.5 md:h-1 w-8 md:w-12 rounded-full mt-1" style={{backgroundColor: team.color}}></div>
                                            </div>
                                        </div>

                                        {/* Empty/Spacer */}
                                        <div className="col-span-2 hidden md:block"></div>

                                        {/* Status / Trend */}
                                        <div className="col-span-3 flex justify-center items-center flex-col md:flex-row md:space-x-3">
                                            <TrendIcon trend={team.trend} />
                                            <div className="mt-1 md:mt-0">
                                                {isEliminated ? (
                                                    <span className="text-[9px] font-bold uppercase text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded flex items-center">
                                                        <XCircle size={10} className="mr-1" /> Raus
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold uppercase text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded flex items-center">
                                                        <CheckCircle2 size={10} className="mr-1" /> Aktiv
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Points */}
                                        <div className="col-span-2 text-right pr-4">
                                            <div className="font-display font-bold text-lg md:text-xl text-slate-900 bg-slate-100 px-2 md:px-3 py-1 rounded inline-block min-w-[50px] text-center">
                                                {team.points}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Sidebar (Math / Contender Section) - Right Side on Desktop */}
                <div className="lg:col-span-4 order-1 lg:order-2">
                    <ContendersView />
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default StandingsPage;
