
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Team, Driver } from '../types';
import { Trophy, Minus, ChevronUp, ChevronDown } from 'lucide-react';

const DriverTicker: React.FC = () => {
  const { drivers, teams } = useData();
  const { goToDriver, goToTeam } = useNavigation();
  const [mode, setMode] = useState<'drivers' | 'teams'>('drivers');

  // Sort data by rank for the ticker
  const sortedDrivers = [...drivers].sort((a, b) => a.rank - b.rank);
  const sortedTeams = [...teams].sort((a, b) => a.rank - b.rank);

  // Select active dataset
  const activeData = mode === 'drivers' ? sortedDrivers : sortedTeams;
  
  // Double the data to create seamless loop effect
  const loopData = [...activeData, ...activeData];

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
    switch (trend) {
      case 'up': return <ChevronUp size={12} className="text-green-400" />;
      case 'down': return <ChevronDown size={12} className="text-f1-pink" />;
      default: return <Minus size={12} className="text-f1-gray" />;
    }
  };

  // Helper to get Team Name for a driver
  const getDriverTeamName = (teamId: string | null) => {
      if (!teamId) return '';
      return teams.find(t => t.id === teamId)?.name || '';
  };

  const handleItemClick = (item: Driver | Team) => {
      if (mode === 'drivers') {
          goToDriver(item.id);
      } else {
          goToTeam(item.id);
      }
  };

  return (
    <div className="w-full bg-f1-surface border-b border-white/5 py-3 overflow-hidden flex items-center shadow-lg relative z-40 h-16">
      
      {/* Control / Label Section (Sticky Left) */}
      <div className="pl-4 md:pl-6 pr-6 flex-shrink-0 z-20 bg-f1-surface h-full flex items-center border-r border-white/10 shadow-[10px_0_20px_-5px_rgba(0,0,0,0.5)]">
        <div className="flex items-center space-x-4">
            <div className="bg-white/5 p-1.5 rounded-full border border-white/10 relative">
                 <Trophy size={18} className="text-f1-pink animate-[pulse_3s_ease-in-out_infinite]" />
                 <div className="absolute inset-0 bg-f1-pink blur-lg opacity-20 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
                <button 
                    onClick={() => setMode('drivers')}
                    className={`px-3 py-0.5 text-[10px] font-bold uppercase rounded-full transition-all ${mode === 'drivers' ? 'bg-f1-pink text-white shadow-glow' : 'text-f1-gray hover:text-white'}`}
                >
                    Fahrer
                </button>
                <button 
                    onClick={() => setMode('teams')}
                    className={`px-3 py-0.5 text-[10px] font-bold uppercase rounded-full transition-all ${mode === 'teams' ? 'bg-f1-pink text-white shadow-glow' : 'text-f1-gray hover:text-white'}`}
                >
                    Teams
                </button>
            </div>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center mask-image-linear-gradient">
          <div className="flex animate-marquee whitespace-nowrap hover:[animation-play-state:paused] items-center">
            {loopData.map((item, index) => {
                const isDriver = mode === 'drivers';
                // Type casting for safe property access based on mode
                const driverItem = item as Driver;
                const teamItem = item as Team;
                
                const imageUrl = isDriver ? driverItem.image : teamItem.logo;
                const displayName = isDriver ? driverItem.lastName : teamItem.name;
                const subText = isDriver ? getDriverTeamName(driverItem.teamId) : '';

                return (
                    <div 
                        key={`${item.id}-${index}`} 
                        onClick={() => handleItemClick(item)}
                        className="flex items-center space-x-4 mx-8 group cursor-pointer opacity-80 hover:opacity-100 transition-opacity select-none"
                    >
                        
                        {/* Rank - Higher Contrast */}
                        <div className="font-display font-bold text-2xl text-white/20 italic w-6 text-right group-hover:text-white transition-colors">
                            {item.rank}
                        </div>

                        {/* Image */}
                        <div className={`relative ${isDriver ? 'w-10 h-10 rounded-full' : 'w-10 h-8 rounded-md'} overflow-hidden border border-white/10 bg-white/5`}>
                            <img 
                                src={imageUrl} 
                                alt={displayName} 
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-white uppercase leading-none tracking-wide">
                                    {displayName}
                                </span>
                                <TrendIcon trend={item.trend} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-f1-pink font-bold tracking-wider">{item.points} PTS</span>
                                {isDriver && subText && (
                                    <span className="text-[10px] text-f1-gray truncate max-w-[100px]">{subText}</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Separator */}
                        <div className="h-6 w-px bg-white/10 ml-8 transform skew-x-12 opacity-50"></div>
                    </div>
                );
            })}
          </div>
      </div>
      
      {/* Fade out right */}
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-f1-surface to-transparent pointer-events-none z-10"></div>
    </div>
  );
};

export default DriverTicker;
