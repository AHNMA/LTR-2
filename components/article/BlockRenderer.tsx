import React, { useState, useRef, useEffect } from 'react';
import { ContentBlock, Driver, Team, Race } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { BLOCK_SPACINGS } from '../../constants';
import { 
    Quote, Trophy, MapPin, Calculator, BarChart2, Calendar, 
    ArrowRight, Flag, Zap, Clock, ChevronRight, ChevronDown, ChevronLeft,
    Instagram, Twitter, Facebook, MessageSquare, Info, CheckCircle,
    Camera, List, X, User, Cpu
} from 'lucide-react';
import { getFlagUrl } from '../../constants';
import { DottedGlowBackground } from '../ui/DottedGlowBackground';

interface BlockRendererProps {
  block: ContentBlock;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  const { drivers, teams, races, getSessionResult } = useData();
  const { goToDriver, goToTeam, goToCalendar, goToStandings } = useNavigation();
  
  // State for interactive blocks
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{url: string, alt?: string, credit?: string} | null>(null);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false); 

  if (!block) return null;

  const getDriver = (id: string) => drivers.find(d => d.id === id);
  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getRace = (id: string) => races.find(r => r.id === id);

  const openLightbox = (url: string, alt?: string, credit?: string) => {
      setLightboxImage({url, alt, credit});
      setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
      setIsLightboxOpen(false);
      setLightboxImage(null);
  }

  const scrollSlider = (direction: 'prev' | 'next', count: number) => {
      if (!sliderRef.current) return;
      
      isProgrammaticScroll.current = true;

      const newIndex = direction === 'next' 
          ? (currentSlide + 1) % count 
          : (currentSlide - 1 + count) % count;
      
      setCurrentSlide(newIndex);
      
      const scrollAmount = sliderRef.current.clientWidth * newIndex;
      sliderRef.current.scrollTo({
          left: scrollAmount,
          behavior: 'smooth'
      });

      setTimeout(() => {
          isProgrammaticScroll.current = false;
      }, 600);
  };

  const handleScroll = () => {
      if (!sliderRef.current) return;
      if (isProgrammaticScroll.current) return;

      const index = Math.round(sliderRef.current.scrollLeft / sliderRef.current.clientWidth);
      if (index !== currentSlide) {
          setCurrentSlide(index);
      }
  };

  const Lightbox = () => {
      if (!isLightboxOpen || !lightboxImage) return null;
      return (
        <div 
            className="fixed inset-0 z-[200] bg-f1-dark/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
            onClick={closeLightbox}
        >
            <button className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X size={32} />
            </button>
            <div className="relative max-w-full max-h-full flex flex-col items-center">
                <div className="relative">
                    <img 
                        src={lightboxImage.url} 
                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
                        alt={lightboxImage.alt || ''} 
                        onClick={(e) => e.stopPropagation()}
                    />
                    {lightboxImage.credit && (
                        <div className="absolute bottom-2 right-2 z-20 pointer-events-none">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70 drop-shadow-md font-sans bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                                {lightboxImage.credit}
                            </span>
                        </div>
                    )}
                </div>
                {lightboxImage.alt && (
                    <div className="mt-4 text-center max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        <span className="text-white font-display font-bold text-xl uppercase italic tracking-wide">{lightboxImage.alt}</span>
                    </div>
                )}
            </div>
        </div>
      );
  };

  const spacing = BLOCK_SPACINGS[block.type] || 'my-12';

  const renderContent = () => {
    switch (block.type) {
        case 'custom/paragraph': {
            const fontClass = block.attributes.fontFamily === 'sans' 
                ? 'font-sans font-light text-lg' 
                : 'font-display font-medium text-2xl tracking-wide';
                
            return (
                <div 
                    className={`leading-relaxed text-slate-300 selection:bg-f1-pink/20 [&_a]:text-f1-pink [&_a]:font-bold [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a]:hover:text-white [&_a]:transition-colors ${fontClass} break-words hyphens-auto`} 
                    style={{ textAlign: block.attributes?.textAlign }}
                    dangerouslySetInnerHTML={{ __html: block.attributes?.content || '' }} 
                />
            );
        }

        case 'f1/driver': {
            const { id, blockSize = 'medium', align = 'center', style = 'card' } = block.attributes;
            const driver = drivers.find(d => d.id === id);
            
            if (!driver) return null;

            const team = teams.find(t => t.id === driver.teamId);
            const accentColor = team?.color || '#e10059';

            const sizeClass = {
                'small': 'max-w-md',
                'medium': 'max-w-2xl',
                'full': 'w-full'
            }[blockSize as string] || 'max-w-2xl';
        
            const alignClass = {
                'left': 'mr-auto',
                'center': 'mx-auto',
                'right': 'ml-auto'
            }[align as string] || 'mx-auto';

            return (
                <div className={`w-full ${sizeClass} ${alignClass} font-display italic`}>
                    <div 
                        className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 group cursor-pointer"
                        onClick={() => goToDriver(driver.id)}
                    >
                        <div className="p-6 pb-2 border-b border-white/5 bg-white/5 flex items-center justify-between relative z-20">
                             <div className="w-full bg-transparent focus:outline-none text-white font-display font-black text-3xl uppercase italic tracking-tight flex items-center gap-3">
                                <span className="hover:text-f1-pink transition-colors">{driver.firstName} {driver.lastName}</span>
                                <span style={{ color: accentColor }}>#{driver.raceNumber}</span>
                             </div>
                        </div>
                        <div className="h-1 w-full z-20 relative" style={{ background: `linear-gradient(90deg, ${accentColor} 0%, #1b1c20 100%)` }}></div>
                        <div className="flex flex-col @[1250px]:flex-row relative">
                            <div className="w-full @[1250px]:w-5/12 relative overflow-hidden border-b @[1250px]:border-b-0 @[1250px]:border-r border-white/5 flex items-end justify-center group/img h-52 @[1250px]:h-auto" style={{ background: `radial-gradient(circle at 50% 100%, ${accentColor}66 0%, #151619 85%)` }}>
                                <DottedGlowBackground color={accentColor} speed={0.4} gap={10} radius={1.2} className="opacity-80" />
                                <div className="relative z-10 w-full flex items-end justify-center pt-4 px-4 h-full">
                                    <img src={driver.image} className="w-auto h-full @[1250px]:h-44 object-contain drop-shadow-2xl object-bottom transform group-hover/img:scale-105 transition-transform duration-500" alt={`${driver.lastName}`} />
                                </div>
                            </div>
                            <div className="w-full @[1250px]:w-7/12 p-5 md:p-6 flex flex-col justify-center relative bg-f1-card z-20">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3 group/team hover:opacity-80 transition-opacity" onClick={(e) => { e.stopPropagation(); if(team) goToTeam(team.id); }}>
                                        <div className="w-1 h-6 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: accentColor }}></div>
                                        <span className="text-2xl font-bold uppercase text-white/80 tracking-tight font-display italic group-hover/team:text-white group-hover/team:underline decoration-2 underline-offset-4 decoration-f1-pink translate-y-[2px]">{team?.name || 'No Team'}</span>
                                    </div>
                                    <button className="hidden @[1250px]:flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-f1-pink transition-colors group/link font-sans not-italic">Mehr erfahren</button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center hover:bg-white/20 hover:border-f1-pink/30 transition-all group/stat">
                                        <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                            <Flag size={10} className="text-f1-pink -translate-y-[1px]" />
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic group-hover/stat:text-white transition-colors">Nation</span>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            {getFlagUrl(driver.nationalityFlag) && <img src={getFlagUrl(driver.nationalityFlag)} className="w-[18px] aspect-[3/2] object-cover border border-black/30 mr-1.5 -translate-y-[2px]" alt="" />}
                                            <span className="text-lg font-bold text-white uppercase">{driver.nationalityFlag}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center hover:bg-white/20 hover:border-f1-pink/30 transition-all group/stat cursor-pointer relative z-30" onClick={(e) => { e.stopPropagation(); goToStandings(); }}>
                                        <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                            <Trophy size={10} className="text-f1-pink -translate-y-[1px]" />
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic group-hover/stat:text-white transition-colors">Rang</span>
                                        </div>
                                        <div className="text-lg font-black text-white uppercase transition-transform">P{driver.rank || '-'}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center hover:bg-white/20 hover:border-f1-pink/30 transition-all group/stat cursor-pointer relative z-30" onClick={(e) => { e.stopPropagation(); goToStandings(); }}>
                                        <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                            <BarChart2 size={10} className="text-f1-pink -translate-y-[1px]" />
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic group-hover/stat:text-white transition-colors">Punkte</span>
                                        </div>
                                        <div className="text-lg font-black uppercase text-white transition-transform">{driver.points || 0}</div>
                                    </div>
                                </div>

                                {/* Mobile Footer Button */}
                                <div className="mt-6 pt-4 border-t border-white/5 @[1250px]:hidden flex justify-center">
                                    <button className="flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-f1-pink transition-colors font-sans not-italic">
                                        Mehr erfahren
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        case 'f1/team': {
            const { id } = block.attributes;
            const team = teams.find(t => t.id === id);
            if (!team) return null;

            const teamDrivers = drivers.filter(d => d.teamId === team.id);
            const accentColor = team.color || '#e10059';

            return (
                <div className="w-full mx-auto font-display italic">
                    <div 
                        className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 group cursor-pointer transition-all duration-500"
                        onClick={() => goToTeam(team.id)}
                    >
                        {/* Header - Team Name with Pink Hover */}
                        <div className="p-6 pb-2 border-b border-white/5 bg-white/5 relative z-20">
                             <div className="w-full flex items-center gap-3 text-white font-display font-black text-3xl uppercase italic tracking-tight leading-none">
                                <span className="break-words leading-none hover:text-f1-pink transition-colors">
                                    {team.name}
                                </span>
                                <div className="h-7 w-12 flex items-center shrink-0 -translate-y-[2px]">
                                     <img src={team.logo} alt={team.name} className="max-w-full max-h-full object-contain object-left" />
                                </div>
                             </div>
                        </div>

                        {/* Accent Strip */}
                        <div className="h-1 w-full z-20 relative" style={{ background: `linear-gradient(90deg, ${accentColor} 0%, #1b1c20 100%)` }}></div>

                        {/* Content */}
                        <div className="flex flex-col @[768px]:flex-row relative">
                            
                            {/* Car Image Area */}
                            <div className="w-full @[768px]:w-5/12 relative overflow-hidden border-b @[768px]:border-b-0 @[768px]:border-r border-white/5 flex items-center justify-center h-64 @[768px]:h-auto min-h-[220px] group/car" style={{ background: `radial-gradient(circle at 50% 100%, ${accentColor}66 0%, #151619 85%)` }}>
                                <DottedGlowBackground color={accentColor} speed={0.4} gap={10} radius={1.2} className="opacity-80" />
                                <div className="relative z-10 w-full flex items-center justify-center p-6 h-full overflow-hidden">
                                    <img src={team.carImage} className="w-full h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-700 scale-90 @[768px]:scale-100 group-hover/car:scale-110 object-bottom" alt={`${team.name} Car`} />
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="w-full @[768px]:w-7/12 p-5 md:p-6 flex flex-col justify-center relative bg-f1-card z-20">
                                
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3 overflow-hidden group/info cursor-pointer hover:opacity-80 transition-opacity">
                                        <div className="w-1 h-6 rounded-full shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: accentColor }}></div>
                                        <div className="flex flex-col leading-none pr-4">
                                            <span className="text-2xl font-bold uppercase text-white/80 tracking-tight font-display italic whitespace-nowrap translate-y-[2px] group-hover/info:text-white group-hover/info:underline decoration-2 underline-offset-4 decoration-f1-pink">
                                                {team.chassis} • {team.powerUnit}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="hidden @[768px]:flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-f1-pink transition-colors group/link font-sans not-italic shrink-0 ml-4">
                                        Mehr erfahren
                                    </button>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center hover:bg-white/20 hover:border-f1-pink/30 transition-all group/stat">
                                        <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                            <Flag size={10} className="text-f1-pink -translate-y-[1px]" />
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic group-hover/stat:text-white transition-colors">Nation</span>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            {getFlagUrl(team.nationalityFlag) && <img src={getFlagUrl(team.nationalityFlag)} className="w-[18px] aspect-[3/2] object-cover border border-black/30 mr-1.5 -translate-y-[2px]" alt="" />}
                                            <span className="text-lg font-bold text-white uppercase">{team.nationalityFlag}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center hover:bg-white/20 hover:border-f1-pink/30 transition-all group/stat cursor-pointer relative z-30" onClick={(e) => { e.stopPropagation(); goToStandings(); }}>
                                        <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                            <Trophy size={10} className="text-f1-pink -translate-y-[1px]" />
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic group-hover/stat:text-white transition-colors">Rang</span>
                                        </div>
                                        <div className="text-lg font-black text-white uppercase transition-transform">P{team.rank || '-'}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center hover:bg-white/20 hover:border-f1-pink/30 transition-all group/stat cursor-pointer relative z-30" onClick={(e) => { e.stopPropagation(); goToStandings(); }}>
                                        <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                                            <BarChart2 size={10} className="text-f1-pink -translate-y-[1px]" />
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic group-hover/stat:text-white transition-colors">Punkte</span>
                                        </div>
                                        <div className="text-lg font-black uppercase text-white transition-transform">{team.points || 0}</div>
                                    </div>
                                </div>

                                {/* Driver Cards - Removed Hover Text Color Change for Names */}
                                <div className="grid grid-cols-1 @[768px]:grid-cols-2 gap-3">
                                    {teamDrivers.map(d => (
                                        <div 
                                            key={d.id} 
                                            onClick={(e) => { e.stopPropagation(); goToDriver(d.id); }} 
                                            className="flex items-center justify-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 hover:border-f1-pink/30 transition-all group/drivercard"
                                        >
                                            <div className="w-12 h-12 rounded-full border-2 border-f1-card overflow-hidden bg-slate-800 shadow-lg transition-transform shrink-0">
                                                <img src={d.image} className="w-full h-full object-cover" title={`${d.firstName} ${d.lastName}`} />
                                            </div>
                                            <div className="flex flex-col min-w-0 items-center">
                                                <div className="flex items-center mb-1 justify-center w-full">
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-sans not-italic">Driver</span>
                                                </div>
                                                <span className="text-sm font-bold text-white truncate uppercase font-display italic pr-1">{d.lastName}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Mobile Footer Button */}
                                <div className="mt-6 pt-4 border-t border-white/5 @[768px]:hidden flex justify-center">
                                    <button className="flex items-center text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-f1-pink transition-colors font-sans not-italic">
                                        Mehr erfahren
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        case 'custom/heading': {
            const { content, level = 2, textAlign = 'left', blockSize = 'full', align = 'left' } = block.attributes;
            const Tag = `h${level}` as any;
            
            const widthClass = {
                'small': 'max-w-md',
                'medium': 'max-w-2xl',
                'full': 'w-full'
            }[blockSize as string] || 'w-full';

            const alignClass = {
                'left': 'mr-auto',
                'center': 'mx-auto',
                'right': 'ml-auto'
            }[align as string] || 'mx-auto';

            const fontSizeClass = level === 2 ? 'text-3xl md:text-5xl lg:text-[48px]' : 'text-2xl md:text-4xl lg:text-[36px]';

            return (
                <div className={`flex items-stretch ${widthClass} ${alignClass}`}>
                    <div className="w-3 bg-f1-pink mr-4 shrink-0 skew-x-[-12deg] mt-[-1px] mb-[9px] shadow-glow" />
                    <Tag className={`font-display font-black text-white uppercase italic tracking-tighter leading-[1.1] m-0 flex-1 min-w-0 break-words ${fontSizeClass}`} style={{ textAlign: textAlign }}>
                        {content}
                    </Tag>
                </div>
            );
        }

        case 'custom/list': {
            const { ordered, textSize, blockSize, align, style = 'card', title, items = [] } = block.attributes;
            const currentSize = (textSize as 'small' | 'medium' | 'large') || 'medium';
            const isCard = style === 'card';
            const sizeConfig = { small: { text: 'text-xl leading-7', wrapper: 'h-7', pt: 'pt-[3px]', gap: 'space-y-2', padding: 'p-4' }, medium: { text: 'text-2xl leading-8', wrapper: 'h-8', pt: 'pt-[3px]', gap: 'space-y-3', padding: 'p-6' }, large: { text: 'text-4xl leading-10', wrapper: 'h-10', pt: 'pt-[4px]', gap: 'space-y-5', padding: 'p-8' } }[currentSize];
            let symbolPt = sizeConfig.pt; let textPt = sizeConfig.pt;
            if (ordered) { 
                if (currentSize === 'medium') { symbolPt = 'pt-[1px]'; textPt = 'pt-[2px]'; } 
                if (currentSize === 'small') { symbolPt = 'pt-[2px]'; textPt = 'pt-[2px]'; } 
                if (!isCard && currentSize === 'small') { symbolPt = 'pt-0'; textPt = '-mt-[3px]'; } 
                if (!isCard && currentSize === 'medium') { textPt = '-mt-[3px]'; } 
                if (isCard) {
                    if (currentSize === 'small') symbolPt = 'pt-[1px]';
                    if (currentSize === 'medium') symbolPt = 'pt-0';
                    if (currentSize === 'large') symbolPt = 'pt-[3px]';
                }
            }
            
            const widthClass = isCard ? ({
                'small': 'w-full md:w-1/3',
                'medium': 'w-full md:w-2/3',
                'large': 'w-full md:w-5/6',
                'full': 'w-full'
            }[blockSize as string] || 'w-full') : 'w-full';

            const alignClass = isCard ? ({ 'left': 'mr-auto', 'center': 'mx-auto', 'right': 'ml-auto' }[align as string] || 'mx-auto') : '';
            
            if (!isCard) { 
                return (
                    <div className={`py-4 pl-6 border-l-4 border-f1-pink w-full`}>
                        {title && (
                            <div className="mb-4">
                                <h3 className="w-full font-display font-black text-2xl md:text-3xl uppercase italic tracking-tight text-white leading-tight">
                                    {title}
                                </h3>
                            </div>
                        )}
                        <div className={`${sizeConfig.gap}`}>
                            {(items || []).map((item: string, index: number) => (
                                <div key={index} className="group flex items-start relative">
                                    <div className={`shrink-0 mr-4 flex justify-center transition-all duration-200 ${sizeConfig.wrapper} ${ordered ? `items-start ${symbolPt}` : 'items-center'}`}>
                                        {ordered ? (
                                            <span className="font-display font-black text-f1-pink italic leading-none transition-all duration-200 text-2xl">{String(index + 1).padStart(2, '0')}</span>
                                        ) : (
                                            <div className="w-2 h-2 bg-f1-pink rounded-full shadow-glow transition-all duration-200" />
                                        )}
                                    </div>
                                    <div className={`w-full text-slate-300 font-display font-bold uppercase italic leading-none break-words ${sizeConfig.text} ${textPt}`}>{item}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ); 
            }
            
            return (
                <div className={`bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 font-display italic ${widthClass} ${alignClass}`}>
                    {title && (
                        <div className="p-4 md:p-6 pb-2 border-b border-white/5 bg-white/5">
                            <h3 className="w-full text-white font-display font-black text-2xl md:text-3xl uppercase italic tracking-tight leading-tight">
                                {title}
                            </h3>
                        </div>
                    )}
                    <div className="h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div>
                    <div className="divide-y divide-white/5">
                        {(items || []).map((item: string, index: number) => (
                            <div key={index} className={`group relative flex items-start hover:bg-white/5 transition-colors duration-300 ${sizeConfig.padding}`}>
                                <div className={`shrink-0 mr-4 md:mr-6 w-8 md:w-12 text-center flex justify-center transition-all duration-200 ${sizeConfig.wrapper} ${ordered ? `items-start ${symbolPt}` : 'items-center'}`}>
                                    {ordered ? (
                                        <span className="font-black leading-none transition-all duration-300 text-white/20 group-hover:text-f1-pink text-3xl">{index + 1}</span>
                                    ) : (
                                        <div className="w-3 h-3 bg-f1-pink rounded-full shadow-glow group-hover:scale-125 transition-all duration-300" />
                                    )}
                                </div>
                                <div className={`w-full text-white font-bold uppercase tracking-wide leading-none break-words ${sizeConfig.text} ${textPt}`}>{item}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        case 'custom/quote': {
            const { blockSize = 'medium', align = 'center', style = 'card', textSize } = block.attributes;
            const isCard = style === 'card';
            const textSizeClass = { small: 'text-2xl md:text-3xl', medium: 'text-3xl md:text-4xl', large: 'text-4xl md:text-6xl' }[textSize as string || 'medium'];
            
            const widthClass = isCard ? ({
                'small': 'w-full md:w-1/3',
                'medium': 'w-full md:w-2/3',
                'large': 'w-full md:w-5/6',
                'full': 'w-full'
            }[blockSize as string] || 'w-full') : 'w-full';

            const alignClass = isCard ? ({ 'left': 'mr-auto', 'center': 'mx-auto', 'right': 'ml-auto' }[align as string] || 'mx-auto') : '';
            
            if (style === 'simple') { 
                return (
                    <div className={`w-full border-l-4 border-f1-pink pl-6 py-4`}>
                        <blockquote className={`font-display font-black italic text-white uppercase leading-none break-words ${textSizeClass}`}>
                            {block.attributes?.content}
                        </blockquote>
                        {(block.attributes?.citation) && (
                            <div className="flex items-center mt-3">
                                <div className="h-0.5 w-8 bg-f1-pink mr-3"></div>
                                <cite className="font-display font-bold uppercase tracking-widest text-slate-400 not-italic text-lg">
                                    {block.attributes.citation}
                                </cite>
                            </div>
                        )}
                    </div>
                ); 
            }
            
            return (
                <div className={`relative group ${widthClass} ${alignClass}`}>
                    <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative p-8 md:p-12 transition-transform hover:scale-[1.01] duration-300">
                        <Quote className="absolute -top-6 -left-6 text-white/5 transform rotate-12 scale-150 pointer-events-none" size={120} />
                        <div className="relative z-10 flex flex-col">
                            <blockquote className={`font-display font-black italic text-white uppercase leading-[0.9] tracking-tight text-center break-words ${textSizeClass}`}>
                                "{block.attributes?.content}"
                            </blockquote>
                            {(block.attributes?.citation) && (
                                <div className="mt-8 flex flex-col items-center justify-center">
                                    <div className="h-1 w-12 bg-f1-pink rounded-full mb-3 shadow-glow"></div>
                                    <cite className="font-display font-bold uppercase tracking-[0.2em] text-white/60 not-italic text-sm md:text-xl text-center">
                                        {block.attributes.citation}
                                    </cite>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        case 'custom/image': {
            const { url, credits, alt, aspectRatio = 'auto', crop = true } = block.attributes;
            
            const isCustomRatio = aspectRatio && aspectRatio !== 'auto';
            const containerStyle: React.CSSProperties = isCustomRatio ? { aspectRatio: aspectRatio.replace(':', ' / ') } : {};
            const imgStyles: React.CSSProperties = { 
                objectFit: crop ? 'cover' : 'contain',
                width: '100%',
                height: isCustomRatio ? '100%' : 'auto'
            };
            
            return (
                <>
                    <Lightbox />
                    <figure className="font-display italic w-full block mx-auto text-center">
                        <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-zoom-in w-full">
                            <div className="relative bg-f1-dark/50" style={containerStyle}>
                                <img src={url} alt={alt || ''} className={`block transition-opacity duration-500 opacity-100 group-hover:opacity-90 ${isCustomRatio ? 'absolute inset-0 h-full w-full' : 'w-full'}`} style={imgStyles} loading="lazy" onClick={() => openLightbox(url, alt, credits)} />
                                {credits && (
                                    <div className="absolute bottom-3 left-4 z-20 pointer-events-none">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 drop-shadow-md font-sans">
                                            {credits}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div>
                            {alt && (
                                <figcaption className="text-left font-display font-bold text-2xl text-white uppercase italic tracking-wide p-4 bg-white/5 whitespace-pre-wrap">
                                    {alt}
                                </figcaption>
                            )}
                        </div>
                    </figure>
                </>
            );
        }

        case 'custom/gallery': {
            const galleryImages = (block.attributes?.images || []).map((img: any) => typeof img === 'string' ? { url: img, credit: '', alt: '', crop: true, align: 'center' } : img);
            const { columns = 2, aspectRatio: gridAspectRatio = 'auto', crop = true, caption: globalCaption } = block.attributes;
            
            const gridWidthClass = 'w-full';
            const gridAlignClass = 'mx-auto';

            return (
                <>
                    <Lightbox />
                    <figure className={`${gridWidthClass} ${gridAlignClass} font-display italic`}>
                        <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <div className="p-4 bg-black/20">
                                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                                    {galleryImages.map((img: any, i: number) => {
                                        const itemStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: crop ? 'cover' : 'contain' };
                                        if (gridAspectRatio && gridAspectRatio !== 'auto') itemStyle.aspectRatio = gridAspectRatio.replace(':', ' / ');
                                        return (
                                            <div key={i} className="flex flex-col group cursor-zoom-in" onClick={() => openLightbox(img.url, img.alt || globalCaption, img.credit)}>
                                                <div className="bg-neutral-800 rounded-xl overflow-hidden border border-white/10 shadow-lg flex flex-col h-full hover:border-f1-pink/20 transition-colors">
                                                    <div className="relative overflow-hidden w-full h-full">
                                                        <img src={img.url} alt={img.alt || ''} style={itemStyle} className="block w-full transition-opacity duration-500 opacity-100 group-hover:opacity-90" loading="lazy" />
                                                        {img.credit && (
                                                            <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none">
                                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50 drop-shadow-md font-sans whitespace-pre-wrap leading-tight block">
                                                                    {img.credit}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div>
                            {globalCaption && (
                                <figcaption className="text-left font-display font-bold text-2xl text-white uppercase italic tracking-wide p-4 bg-white/5 whitespace-pre-wrap">
                                    {globalCaption}
                                </figcaption>
                            )}
                        </div>
                    </figure>
                </>
            );
        }

        case 'custom/slider': {
            const sliderImages = (block.attributes?.images || []).map((img: any) => typeof img === 'string' ? { url: img, credit: '', alt: '', crop: true, align: 'center' } : img);
            const { aspectRatio: sliderAspectRatio = '16:9', blockSize: sliderBlockSize = 'medium', align: sliderAlign = 'center' } = block.attributes;
            const sliderWidthClass = { 'small': 'max-w-2xl', 'medium': 'max-w-4xl', 'large': 'max-w-6xl', 'full': 'max-w-full' }[sliderBlockSize as string] || 'max-w-4xl';
            const sliderAlignClass = { 'left': 'mr-auto', 'center': 'mx-auto', 'right': 'ml-auto' }[sliderAlign as string] || 'mx-auto';

            const getSliderAspectRatio = (): React.CSSProperties => {
                if (sliderAspectRatio === 'auto') return { aspectRatio: '16/9' }; 
                return { aspectRatio: sliderAspectRatio.replace(':', ' / ') };
            };

            const currentImage = sliderImages[currentSlide];

            return (
                <>
                    <Lightbox />
                    <div className={`w-full ${sliderWidthClass} ${sliderAlignClass} font-display italic`}>
                        <div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group/slider">
                            <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar bg-slate-900" style={getSliderAspectRatio()} onScroll={handleScroll}>
                                {sliderImages.map((img: any, i: number) => (
                                    <div key={i} className="min-w-full w-full h-full snap-center relative overflow-hidden cursor-zoom-in group" onClick={() => openLightbox(img.url, img.alt, img.credit)}>
                                        <img src={img.url} alt={img.alt || ''} className="w-full h-full block transition-opacity duration-500 opacity-100 group-hover:opacity-90" style={{ objectFit: img.crop !== false ? 'cover' : 'contain' }} />
                                        {img.credit && (
                                            <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 drop-shadow-md font-sans">
                                                    {img.credit}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {sliderImages.length > 1 && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                                    <div className="bg-f1-pink text-white text-[10px] font-black uppercase px-3 py-1 skew-x-[-12deg] shadow-glow tabular-nums">
                                        SLIDE {currentSlide + 1} / {sliderImages.length}
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); scrollSlider('prev', sliderImages.length); }} className="w-10 h-10 bg-black/40 hover:bg-f1-pink backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl transition-all pointer-events-auto border border-white/20"><ChevronLeft size={24} /></button>
                                <button onClick={(e) => { e.stopPropagation(); scrollSlider('next', sliderImages.length); }} className="w-10 h-10 bg-black/40 hover:bg-f1-pink backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl transition-all pointer-events-auto border border-white/20"><ChevronRight size={24} /></button>
                            </div>
                            <div className="relative z-20 h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div>
                            {currentImage && currentImage.alt && (
                                <figcaption key={`caption-${currentSlide}`} className="relative z-20 text-left font-display font-bold text-2xl text-white uppercase italic tracking-wide p-4 bg-white/5 whitespace-pre-wrap animate-in fade-in duration-300">
                                    {currentImage.alt}
                                </figcaption>
                            )}
                        </div>
                    </div>
                </>
            );
        }

        case 'custom/details': {
            const { blockSize = 'full', align = 'left', style = 'card', textSize = 'large' } = block.attributes;
            const isCard = style === 'card';
            const widthClass = isCard ? ({ 'small': 'w-full md:w-1/3', 'medium': 'w-full md:w-2/3', 'large': 'w-full md:w-5/6', 'full': 'w-full' }[blockSize as string] || 'w-full') : 'w-full';
            const alignClass = isCard ? ({ 'left': 'mr-auto', 'center': 'mx-auto', 'right': 'ml-auto' }[align as string] || 'mr-auto') : '';
            const contentTextSize = textSize === 'small' ? 'text-base md:text-lg' : 'text-xl md:text-2xl';
            const contentPadding = textSize === 'small' ? 'px-4 py-4 md:px-6' : 'px-4 py-4 md:p-6';
            if (!isCard) { return (<details className={`group border-l-4 border-f1-pink pl-6 py-3 w-full`} open={block.attributes?.defaultOpen}><summary className="cursor-pointer list-none flex items-center justify-between hover:opacity-70 transition-all select-none"><span className="font-display font-black text-2xl md:text-3xl italic uppercase text-white tracking-tight –leading-none break-words">{block.attributes?.summary}</span><ChevronDown size={24} className="text-slate-500 transition-transform duration-300 group-open:rotate-180" /></summary><div className={`py-4 text-slate-400 leading-relaxed font-display font-bold uppercase tracking-wide break-words ${contentTextSize}`}>{block.attributes?.content}</div></details>); }
            return (<details className={`group bg-f1-card rounded-2xl border border-white/5 shadow-2xl overflow-hidden ${widthClass} ${alignClass}`} open={block.attributes?.defaultOpen}><summary className="cursor-pointer list-none block bg-white/5 transition-colors hover:bg-white/10 select-none p-0"><div className="flex items-center justify-between p-4 md:p-6 pb-2"><span className="flex-1 font-display font-black text-2xl md:text-3xl italic uppercase text-white tracking-tight –leading-none break-words">{block.attributes?.summary}</span><ChevronDown size={28} className="text-white/50 ml-4 transition-transform duration-300 group-open:rotate-180 group-open:text-f1-pink" /></div><div className="h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div></summary><div className={`${contentPadding} bg-f1-card/50 text-white/80 leading-relaxed font-display font-bold uppercase tracking-wide break-words ${contentTextSize}`}>{block.attributes?.content}</div></details>);
        }

        case 'custom/table': {
            const { title, headers = [], rows = [], fixedWidth, blockSize = 'full', align = 'center', style = 'card', textSize = 'small' } = block.attributes;
            const isCard = style === 'card';
            const cellTextSize = textSize === 'large' ? 'text-2xl' : 'text-lg'; 
            const cardPadding = textSize === 'large' ? 'px-6 py-5' : 'px-6 py-3';
            const simplePadding = textSize === 'large' ? 'p-3' : 'p-2';
            const widthClass = isCard ? ({ 'small': 'w-full md:w-1/3', 'medium': 'w-full md:w-2/3', 'large': 'w-full md:w-5/6', 'full': 'w-full' }[blockSize as string] || 'w-full') : 'w-full';
            const alignClass = isCard ? ({ 'left': 'mr-auto', 'center': 'mx-auto', 'right': 'ml-auto' }[align as string] || 'mx-auto') : '';
            if (!isCard) { return (<div className={`overflow-x-auto bg-transparent border-l-4 border-f1-pink pl-4 py-2 w-full`}>{title && (<div className="mb-4"><h3 className="w-full font-display font-black text-3xl uppercase italic tracking-tight text-white">{title}</h3></div>)}<table className={`w-full text-left border-collapse ${fixedWidth ? 'table-fixed' : 'table-auto'}`}><thead><tr className="border-b-2 border-white/20">{headers.map((h: string, i: number) => (<th key={i} className={`${simplePadding} font-display font-black text-2xl uppercase italic tracking-tight text-white`}>{h}</th>))}</tr></thead><tbody className="divide-y divide-white/10">{rows.map((row: string[], ri: number) => (<tr key={ri}>{row.map((cell: string, ci: number) => (<td key={ci} className={`${simplePadding} align-top`}><div className={`w-full font-display font-bold uppercase text-slate-300 ${cellTextSize}`}>{cell}</div></td>))}</tr>))}</tbody></table></div>); }
            return (<div className={`bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 font-display italic tracking-wide ${widthClass} ${alignClass}`}>{title && (<><div className="p-6 pb-2 border-b border-white/5 bg-white/5"><h3 className="w-full text-white font-display font-black text-3xl uppercase italic tracking-tight">{title}</h3></div><div className="h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div></>)}<div className="overflow-x-auto"><table className={`w-full text-left border-collapse ${fixedWidth ? 'table-fixed' : 'table-auto'}`}><thead><tr className="bg-white/5 border-b border-white/5">{headers.map((h: string, i: number) => (<th key={i} className={`${cardPadding} min-w-[120px] border-r border-white/5 last:border-0 font-display font-black text-3xl uppercase italic tracking-tight text-white`}>{h}</th>))}</tr></thead><tbody className="divide-y divide-white/5">{rows.map((row: string[], ri: number) => (<tr key={ri} className="group hover:bg-white/5 transition-colors">{row.map((cell: string, ci: number) => (<td key={ci} className={`${cardPadding} align-top border-r border-white/5 last:border-0`}><div className={`w-full font-display font-bold uppercase text-white/80 ${cellTextSize}`}>{cell}</div></td>))}</tr>))}</tbody></table></div></div>);
        }
        
        case 'custom/separator': {
            const { style = 'tech' } = block.attributes;
            if (style === 'track') { return (<div className="overflow-hidden flex items-center justify-center py-6 select-none"><div className="flex space-x-1 opacity-80">{[...Array(16)].map((_, i) => (<div key={i} className={`w-6 h-3 skew-x-[-30deg] ${i % 2 === 0 ? 'bg-f1-pink shadow-[0_0_10px_rgba(225,0,89,0.4)]' : 'bg-white/10'}`}></div>))}</div></div>); }
            if (style === 'minimal') { return (<div className="flex items-center justify-center w-full max-w-2xl mx-auto py-6 select-none"><div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent w-full"></div><div className="mx-4 w-1.5 h-1.5 rotate-45 bg-white/40"></div><div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent w-full"></div></div>); }
            if (style === 'lights') { return (<div className="flex items-center justify-center w-full py-6 select-none"><div className="bg-black/40 px-6 py-2 rounded-full border border-white/5 flex space-x-4 shadow-lg backdrop-blur-sm">{[...Array(5)].map((_, i) => (<div key={i} className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>))}</div></div>); }
            if (style === 'chequered') { return (<div className="w-full py-6 flex flex-col items-center opacity-60 select-none"><div className="flex w-full max-w-lg">{[...Array(24)].map((_, i) => (<div key={`top-${i}`} className={`h-2 flex-1 ${i % 2 === 0 ? 'bg-white' : 'bg-transparent'}`}></div>))}</div><div className="flex w-full max-w-lg">{[...Array(24)].map((_, i) => (<div key={`bot-${i}`} className={`h-2 flex-1 ${i % 2 !== 0 ? 'bg-white' : 'bg-transparent'}`}></div>))}</div></div>); }
            return (<div className="flex items-center justify-center w-full py-6 select-none group/sep"><div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"></div><div className="mx-6 flex space-x-1 shrink-0"><div className="w-2 h-6 bg-f1-pink -skew-x-[20deg] shadow-glow"></div><div className="w-1 h-6 bg-white/20 -skew-x-[20deg]"></div></div><div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"></div></div>);
        }

        case 'custom/comment': {
            const { blockSize = 'medium', align = 'center', style = 'card', author, content } = block.attributes;
            const isCard = style === 'card';
            const widthClass = isCard ? ({ 'small': 'w-full md:w-1/3', 'medium': 'w-full md:w-2/3', 'large': 'w-full md:w-5/6', 'full': 'w-full' }[blockSize as string] || 'w-full') : 'w-full';
            const alignClass = isCard ? ({ 'left': 'mr-auto', 'center': 'mx-auto', 'right': 'ml-auto' }[align as string] || 'mx-auto') : '';
            if (!isCard) { return (<div className="w-full border-l-4 border-f1-pink pl-6 py-4 font-display italic"><div className="flex items-center mb-2"><div className="bg-f1-pink text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest mr-3 font-sans">{author || 'AUTOR'}</div></div><div className="text-xl md:text-2xl font-bold text-white leading-tight uppercase">{content}</div></div>); }
            return (<div className={`bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 font-display italic ${widthClass} ${alignClass} group/comment`}><div className="p-6 pb-2 border-b border-white/5 bg-white/5 flex items-center justify-between"><div className="flex items-center text-white"><User size={20} className="text-f1-pink mr-3 mb-1 shrink-0 -translate-y-[2px]" /><span className="font-black text-2xl uppercase italic tracking-tight">{author || 'AUTOR'}</span></div></div><div className="h-1 w-full bg-gradient-to-r from-f1-pink to-f1-card"></div><div className="p-6 relative"><div className="relative z-10 w-full text-white/90 font-bold text-xl md:text-2xl uppercase tracking-wide leading-relaxed">{content}</div></div></div>);
        }

        case 'f1/title-watch': {
            const { type = 'drivers', style = 'card', blockSize = 'medium', align = 'center' } = block.attributes;
            const isDrivers = type === 'drivers';
            const remainingRaces = races.filter(r => r.status !== 'completed');
            const maxPoints = isDrivers ? (remainingRaces.length * 26) + (remainingRaces.filter(r => r.format === 'sprint').length * 8) : (remainingRaces.length * 44) + (remainingRaces.filter(r => r.format === 'sprint').length * 15);
            const sorted = isDrivers ? [...drivers].sort((a,b) => (b.points || 0) - (a.points || 0)) : [...teams].sort((a,b) => (b.points || 0) - (a.points || 0));
            const leaderPoints = sorted[0]?.points || 0;
            const contenders = sorted.filter(entry => (entry.points || 0) + maxPoints >= leaderPoints).slice(0, 10);
            const sizeClass = style === 'card' ? ({ 'small': 'max-w-md', 'medium': 'max-w-2xl', 'full': 'w-full' }[blockSize as string] || 'max-w-2xl') : 'w-full';
            const alignClass = style === 'card' ? ({ 'left': 'mr-auto', 'center': 'mx-auto', 'right': 'ml-auto' }[align as string] || 'mx-auto') : '';
            if (style === 'simple') { return (<div className="w-full border-l-4 border-f1-pink pl-6 py-4 bg-white/5 font-display italic"><div className="flex items-center space-x-3 mb-4 not-italic"><Calculator className="text-f1-pink" size={24} /><h4 className="text-2xl font-black text-white uppercase italic leading-none tracking-tight">Title Watch</h4></div><div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">Mathematisch im Rennen ({maxPoints} Pts offen)</div><div className="space-y-2">{contenders.map(c => { const gap = leaderPoints - (c.points || 0); return (<div key={c.id} className="flex justify-between items-center border-b border-white/5 last:border-0 py-1.5 group"><span className="text-2xl font-bold uppercase text-slate-300 group-hover:text-f1-pink transition-colors">{isDrivers ? (c as any).lastName : (c as any).name}</span><span className={`text-xl font-black ${gap === 0 ? 'text-green-500' : 'text-f1-pink'}`}>{gap === 0 ? 'LEADER' : `-${gap} PTS`}</span></div>); })}</div></div>); }
            return (<div className={`w-full ${sizeClass} ${alignClass} font-display italic`}><div className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative"><div className="p-6 bg-white/10 border-b border-white/5 flex justify-between items-center not-italic"><div className="flex items-center space-x-3"><Trophy className="text-f1-pink" size={24} /><h4 className="text-2xl font-black text-white uppercase italic leading-none tracking-tight">{isDrivers ? 'Driver Title Watch' : 'Constructor Title Watch'}</h4></div><div className="text-[10px] font-black uppercase text-f1-pink tracking-widest">{maxPoints} Pts offen</div></div><div className="p-6 space-y-4">{contenders.map(c => { const gap = leaderPoints - (c.points || 0); const t = isDrivers ? teams.find(team => team.id === (c as any).teamId) : (c as any); return (<div key={c.id} className="flex items-center justify-between group/contender"><div className="flex items-center"><div className="w-1.5 h-10 rounded-full mr-4" style={{ backgroundColor: t?.color || '#ccc' }}></div><div className="flex items-center"><div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 mr-4 bg-white/10"><img src={isDrivers ? (c as any).image : (c as any).logo} className="w-full h-full object-cover" alt="" /></div><span className="text-3xl font-black text-white uppercase group-hover/contender:text-f1-pink transition-colors tracking-tighter">{isDrivers ? (c as any).lastName : (c as any).name}</span></div></div><div className={`text-2xl font-black ${gap === 0 ? 'text-green-400' : 'text-f1-pink'} tabular-nums`}>{gap === 0 ? 'LEADER' : `-${gap} PTS`}</div></div>); })}</div></div></div>);
        }

        case 'f1/results': {
            const { id, sessionId = 'race' } = block.attributes;
            const race = races.find(r => r.id === id);
            if (!race) return null;
            const result = getSessionResult(race.id, sessionId);
            const list = result?.entries?.slice(0, 5) || [];
            return (<div className="bg-f1-card rounded-2xl overflow-hidden border border-white/10 font-sans shadow-2xl"><div className="p-3 bg-white/10 flex justify-between items-center"><div className="text-white font-bold text-sm flex items-center"><Trophy size={14} className="mr-2 text-f1-pink"/> {race.country} GP Results</div><div className="text-[10px] uppercase text-white/50">{sessionId}</div></div><div className="divide-y divide-white/5">{list.map((e, i) => (<div key={i} className="p-2 px-4 flex justify-between items-center text-xs text-white"><span className="w-4 font-bold text-white/50">{i+1}</span><span className="font-bold flex-1 ml-2">{drivers.find(dr => dr.id === e.driverId)?.lastName || 'Unknown'}</span><span className="font-mono text-white/50">{e.time}</span></div>))}{list.length === 0 && <div className="p-4 text-center text-white/30 text-xs">Keine Daten verfügbar</div>}</div></div>);
        }

        case 'f1/event': {
            const { id } = block.attributes;
            const race = races.find(r => r.id === id);
            if (!race) return null;

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

            const sessionKeys: string[] = race.format === 'sprint' 
                ? ['fp1', 'sprintQuali', 'sprint', 'qualifying', 'race']
                : ['fp1', 'fp2', 'fp3', 'qualifying', 'race'];

            const accentColor = '#e10059';

            return (
                <div className="w-full font-display italic">
                    <div 
                        className="bg-f1-card rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative cursor-pointer group"
                        onClick={() => goToCalendar()}
                    >
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
                        <div className="h-1 w-full z-20 relative" style={{ background: `linear-gradient(90deg, ${accentColor} 0%, #1b1c20 100%)` }}></div>
                        <div className="flex flex-col @[768px]:flex-row relative">
                            <div className="w-full @[768px]:w-5/12 relative overflow-hidden border-b @[768px]:border-b-0 @[768px]:border-r border-white/5 flex items-center justify-center h-52 @[768px]:h-auto min-h-[250px]" style={{ background: `radial-gradient(circle at 50% 50%, ${accentColor}33 0%, #151619 85%)` }}>
                                {/* Map Hover Area */}
                                <div className="absolute inset-0 group/track z-10">
                                    <DottedGlowBackground color={accentColor} speed={0.3} gap={12} radius={1} className="opacity-60" />
                                    <div className="relative w-full h-full flex items-center justify-center p-8 @[375px]:p-4 @[768px]:p-12 @[768px]:pb-24">
                                        {race.trackMap ? (
                                            <img src={race.trackMap} className="max-w-full max-h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform scale-110 group-hover/track:scale-125 transition-transform duration-700" alt={`${race.circuitName}`} />
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
                                <div className="space-y-2">
                                    {sessionKeys.map((key) => {
                                        const dateStr = race.sessions[key];
                                        const isRace = key === 'race';
                                        return (
                                            <div 
                                                key={key} 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    goToCalendar();
                                                }}
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
        }

        default: {
            return null;
        }
    }
  }

  const content = renderContent();
  if (!content) return null;

  return (
      <div className={spacing}>
          {content}
      </div>
  );
};

export default BlockRenderer;