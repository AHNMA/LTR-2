import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { ChevronUp, ChevronDown, Minus, Trophy, Calculator, CheckCircle2, XCircle } from 'lucide-react';

const StandingsPage: React.FC = () => {
  const { drivers, teams, races } = useData();
  const { goToDriver, goToTeam } = useNavigation();
  const [activeTab, setActiveTab] = useState<'drivers' | 'teams'>('drivers');

  const championshipMath = useMemo(() => {
      const remainingRaces = races.filter(r => r.status !== 'completed');
      const standardRacesCount = remainingRaces.length;
      const sprintRacesCount = remainingRaces.filter(r => r.format === 'sprint').length;
      return { driverMaxRemaining: (standardRacesCount * 26) + (sprintRacesCount * 8), teamMaxRemaining: (standardRacesCount * 44) + (sprintRacesCount * 15), remainingEvents: standardRacesCount };
  }, [races]);

  const sortedDrivers = [...drivers].sort((a, b) => a.rank - b.rank);
  const sortedTeams = [...teams].sort((a, b) => a.rank - b.rank);
  const driverLeaderPoints = sortedDrivers[0]?.points || 0;
  const teamLeaderPoints = sortedTeams[0]?.points || 0;
  const driverCutoff = driverLeaderPoints - championshipMath.driverMaxRemaining;
  const teamCutoff = teamLeaderPoints - championshipMath.teamMaxRemaining;

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
    switch (trend) {
      case 'up': return <ChevronUp size={14} className="text-green-400" />;
      case 'down': return <ChevronDown size={14} className="text-f1-pink" />;
      default: return <Minus size={14} className="text-slate-600" />;
    }
  };

  const ContendersView = () => {
      const isDrivers = activeTab === 'drivers';
      const maxRemaining = isDrivers ? championshipMath.driverMaxRemaining : championshipMath.teamMaxRemaining;
      const leaderPoints = isDrivers ? driverLeaderPoints : teamLeaderPoints;
      const candidates = isDrivers ? sortedDrivers.filter(d => d.points + maxRemaining >= leaderPoints) : sortedTeams.filter(t => t.points + maxRemaining >= leaderPoints);

      if (candidates.length <= 1) {
          const winner = candidates[0];
          if (!winner) return null;
          return (
              <div className="bg-f1-card border border-f1-pink/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-glow sticky top-24">
                  <div className="bg-f1-pink/20 p-5 rounded-full shadow-lg mb-4 border border-f1-pink/30"><Trophy size={48} className="text-yellow-400" /></div>
                  <h3 className="text-sm font-black text-f1-pink uppercase tracking-[0.2em] mb-2">Weltmeister 2026</h3>
                  <div className="text-3xl font-display font-black text-white leading-none italic uppercase tracking-tighter">{isDrivers ? (winner as any).lastName : (winner as any).name}</div>
                  <div className="h-1 w-16 bg-f1-pink my-6 rounded-full"></div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Titel rechnerisch entschieden.</p>
              </div>
          );
      }

      return (
          <div className="bg-f1-card text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden sticky top-24 border border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Calculator size={120} /></div>
              <div className="relative z-10">
                  <div className="mb-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-f1-pink flex items-center mb-4"><Calculator size={16} className="mr-2" /> Title Watch</h3>
                      <div className="text-[10px] text-slate-400 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 font-bold uppercase tracking-wider">
                        Noch <span className="text-f1-pink">{championshipMath.remainingEvents}</span> Rennen.<br/>
                        Maximal <span className="text-white">{maxRemaining}</span> Pts offen.
                      </div>
                  </div>
                  <div className="space-y-3">
                      {candidates.map(candidate => {
                          const gap = leaderPoints - candidate.points;
                          const name = isDrivers ? (candidate as any).lastName : (candidate as any).name;
                          return (
                              <div key={candidate.id} className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                  <div className="flex items-center space-x-3">
                                      <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 ${!isDrivers ? 'bg-white p-1' : 'bg-slate-800'}`} style={{ borderColor: (isDrivers ? (teams.find(t=>t.id===(candidate as any).teamId)?.color) : (candidate as any).color) || '#e10059' }}>
                                          {(isDrivers ? (candidate as any).image : (candidate as any).logo) && <img src={isDrivers ? (candidate as any).image : (candidate as any).logo} className="w-full h-full object-cover" alt="" />}
                                      </div>
                                      <div className="font-display font-black text-base leading-none text-white uppercase italic tracking-tight">{name}</div>
                                  </div>
                                  <div className={`text-xs font-black uppercase tracking-tighter ${gap === 0 ? 'text-green-400' : 'text-f1-pink'}`}>{gap === 0 ? 'Leader' : `-${gap}`}</div>
                              </div>
                          )
                      })}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="bg-f1-dark min-h-screen pb-20 pt-8 font-sans text-slate-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 uppercase italic leading-none tracking-tighter">WM-Stand 2026</h1>
            <div className="h-1.5 w-24 bg-f1-pink mx-auto rounded-full shadow-glow"></div>
        </div>

        <div className="flex justify-center mb-12">
            <div className="bg-f1-card p-1 rounded-full shadow-2xl border border-white/5 inline-flex">
                <button onClick={() => setActiveTab('drivers')} className={`px-8 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'drivers' ? 'bg-f1-pink text-white shadow-glow' : 'text-slate-500 hover:text-white'}`}>Fahrerwertung</button>
                <button onClick={() => setActiveTab('teams')} className={`px-8 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'teams' ? 'bg-f1-pink text-white shadow-glow' : 'text-slate-500 hover:text-white'}`}>Konstrukteure</button>
            </div>
        </div>

        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 order-2 lg:order-1 bg-f1-card rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
                    <div className="grid grid-cols-12 bg-white/5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] p-4 border-b border-white/5 sticky top-0 z-20 backdrop-blur-md">
                        <div className="col-span-2 md:col-span-1 text-center">Pos</div>
                        <div className="col-span-5 md:col-span-4 pl-4">{activeTab === 'drivers' ? 'Fahrer' : 'Team'}</div>
                        <div className="col-span-2 hidden md:block text-center">Team</div>
                        <div className="col-span-3 md:col-span-3 text-center">Status</div>
                        <div className="col-span-2 text-right pr-4">Punkte</div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {(activeTab === 'drivers' ? sortedDrivers : sortedTeams).map((item) => {
                            const isDrivers = activeTab === 'drivers';
                            const team = isDrivers ? teams.find(t => t.id === (item as any).teamId) : (item as any);
                            const isEliminated = item.points < (isDrivers ? driverCutoff : teamCutoff);
                            return (
                                <div key={item.id} onClick={() => isDrivers ? goToDriver(item.id) : goToTeam(item.id)} className={`grid grid-cols-12 p-4 items-center hover:bg-white/5 transition-colors cursor-pointer group ${isEliminated ? 'opacity-40 grayscale' : ''}`}>
                                    <div className="col-span-2 md:col-span-1 flex justify-center">
                                        <div className={`font-display font-black text-2xl w-9 h-9 flex items-center justify-center rounded-lg shadow-sm ${item.rank === 1 ? 'bg-yellow-400 text-slate-900 shadow-glow' : item.rank === 2 ? 'bg-slate-300 text-slate-900' : item.rank === 3 ? 'bg-amber-600 text-white' : 'text-slate-400 bg-white/5'}`}>{item.rank}</div>
                                    </div>
                                    <div className="col-span-5 md:col-span-4 pl-4 flex items-center">
                                        <div className={`w-10 h-10 rounded-full overflow-hidden border border-white/10 mr-4 bg-slate-800 shrink-0 ${!isDrivers ? 'p-1 bg-white' : ''}`}>{(isDrivers ? (item as any).image : (item as any).logo) && <img src={isDrivers ? (item as any).image : (item as any).logo} className="w-full h-full object-cover" />}</div>
                                        <div className="font-display font-bold text-white uppercase italic text-lg group-hover:text-f1-pink transition-colors truncate">{isDrivers ? (item as any).lastName : (item as any).name}</div>
                                    </div>
                                    <div className="col-span-2 hidden md:flex items-center justify-center">
                                        {team && <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px] bg-white/5 px-2 py-1 rounded border border-white/5" style={{borderLeftColor: team.color, borderLeftWidth: '3px'}}>{team.name}</div>}
                                    </div>
                                    <div className="col-span-3 flex justify-center items-center"><TrendIcon trend={item.trend} /></div>
                                    <div className="col-span-2 text-right pr-4"><div className="font-display font-black text-xl text-white bg-white/5 px-3 py-1 rounded-lg border border-white/5 inline-block min-w-[50px] text-center tabular-nums">{item.points}</div></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="lg:col-span-4 order-1 lg:order-2"><ContendersView /></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StandingsPage;