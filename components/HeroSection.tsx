import React, { useState } from 'react';
import { usePosts } from '../contexts/PostContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Clock, MessageSquare, Zap, ChevronRight, TrendingUp, RefreshCw } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { getPostsBySection } = usePosts();
  const { goToArticle } = useNavigation();
  const [activeTab, setActiveTab] = useState<'aktuell' | 'updated'>('aktuell');

  const highlightPosts = getPostsBySection('highlight');
  const highlightPost = highlightPosts.length > 0 ? highlightPosts[0] : null;
  
  const aktuellPosts = getPostsBySection('aktuell');
  const updatedPosts = getPostsBySection('updated');
  const trendingPosts = getPostsBySection('trending');

  if (!highlightPost) return null;

  const listPosts = activeTab === 'aktuell' ? aktuellPosts : updatedPosts;
  
  // Helper to ensure section is array
  const highlightSections = Array.isArray(highlightPost.section) ? highlightPost.section : [highlightPost.section];

  return (
    <div className="container mx-auto px-4 pt-6 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Lists (3 cols) - Styled as f1-card */}
        <div className="lg:col-span-3 flex flex-col bg-f1-card rounded-2xl shadow-2xl border border-white/5 overflow-hidden h-full">
            {/* Tabs - Fixed height (~50px) */}
            <div className="flex p-2 bg-white/5 gap-1 border-b border-white/5 h-[50px] shrink-0">
                <button 
                    onClick={() => setActiveTab('aktuell')}
                    className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center justify-center space-x-1 ${activeTab === 'aktuell' ? 'bg-f1-pink text-white shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Clock size={12} />
                    <span>Aktuell</span>
                </button>
                <button 
                    onClick={() => setActiveTab('updated')}
                    className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center justify-center space-x-1 ${activeTab === 'updated' ? 'bg-f1-pink text-white shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <RefreshCw size={12} />
                    <span>Updated</span>
                </button>
            </div>

            {/* List Content - Fixed height for exactly 5 items (5 * 92px = 460px) */}
            <div className="h-[460px] overflow-y-auto custom-scrollbar-dark font-display">
                {listPosts.length > 0 ? listPosts.map((post) => (
                    <div 
                        key={post.id} 
                        onClick={() => goToArticle(post.id)} 
                        className="flex space-x-3 group cursor-pointer items-center px-4 border-b border-white/5 h-[92px] hover:bg-white/5 transition-colors"
                    >
                         <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-800">
                            {post.image && <img src={post.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" />}
                         </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <h4 className="text-lg font-bold text-white group-hover:text-f1-pink leading-tight mb-1 line-clamp-2 transition-colors uppercase tracking-tight">
                                {post.title}
                            </h4>
                            <div className="flex items-center text-[10px] text-slate-500 space-x-3 font-bold uppercase tracking-widest mt-1">
                                <span className="flex items-center text-f1-pink">NEW</span>
                                <span className="flex items-center"><Clock size={10} className="mr-1 text-slate-500"/> {post.date?.split('.')?.[0] || '--'} Dez</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="h-full flex items-center justify-center text-center text-slate-500 italic text-xs uppercase font-bold tracking-widest p-10">
                        Keine Artikel verfügbar.
                    </div>
                )}
            </div>
            <div className="p-3 border-t border-white/5 bg-white/5 text-center h-[50px] shrink-0">
                <button className="text-[10px] font-bold uppercase text-slate-400 hover:text-f1-pink flex items-center justify-center w-full transition-colors py-1 tracking-widest">
                    Alle News anzeigen <ChevronRight size={12} className="ml-1" />
                </button>
            </div>
        </div>

        {/* Center Column: Highlight Image (6 cols) */}
        <div onClick={() => goToArticle(highlightPost.id)} className="lg:col-span-6 relative group cursor-pointer min-h-[400px] lg:h-[560px] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            {highlightPost.image && (
                <img 
                    src={highlightPost.image} 
                    alt={highlightPost.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            )}
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-f1-dark via-f1-dark/40 to-transparent opacity-95"></div>
            
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {highlightSections.map((sec, idx) => (
                    <span key={idx} className="bg-f1-pink text-white px-2 py-0.5 sm:px-3 sm:py-1 text-[7px] sm:text-[10px] font-bold uppercase tracking-widest rounded shadow-glow">
                        {sec}
                    </span>
                ))}
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                <div className="flex flex-wrap gap-2 mb-4">
                    {highlightPost.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-white/10 text-white text-[10px] font-black px-2 py-1 uppercase rounded-md shadow-lg border border-white/10 font-display">{tag}</span>
                    ))}
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-white font-display leading-[0.85] mb-6 drop-shadow-2xl max-w-2xl uppercase tracking-tighter">
                    {highlightPost.title}
                </h2>
                <div className="flex items-center space-x-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                     <div className="flex items-center"><div className="w-1.5 h-1.5 bg-f1-pink rounded-full mr-2"></div> {highlightPost.author}</div>
                     <div className="w-px h-3 bg-white/10"></div>
                     <span>{highlightPost.date}</span>
                </div>
            </div>
        </div>

        {/* Right Column: Trending (3 cols) - Styled as f1-card */}
        <div className="lg:col-span-3 flex flex-col bg-f1-card rounded-2xl shadow-2xl border border-white/5 overflow-hidden h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5 h-[50px] shrink-0">
                <div className="flex items-center text-f1-pink">
                    <TrendingUp size={16} className="mr-2" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white font-display">Trending Now</h3>
                </div>
            </div>
            
            {/* List Content - Fixed height for exactly 5 items (5 * 92px = 460px) */}
            <div className="h-[460px] overflow-y-auto custom-scrollbar-dark font-display">
                 {trendingPosts.length > 0 ? trendingPosts.map((post, index) => (
                    <div 
                        key={post.id} 
                        onClick={() => goToArticle(post.id)} 
                        className="relative flex items-center px-4 border-b border-white/5 group cursor-pointer hover:bg-white/5 transition-colors h-[92px]"
                    >
                        <span className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-12 bg-gradient-to-b from-f1-pink to-f1-pink/50 rounded-r-full transform -translate-x-full group-hover:translate-x-0 transition-transform shadow-glow"></span>
                        
                        <div className="flex-shrink-0 mr-4 font-display font-bold text-3xl text-white/10 group-hover:text-f1-pink/50 transition-colors w-6 text-center select-none leading-none">
                            {index + 1}
                        </div>
                        
                        <div className="flex flex-col justify-center min-w-0">
                             <h4 className="text-lg font-bold text-white group-hover:text-f1-pink leading-tight line-clamp-2 transition-colors uppercase tracking-tight">
                                {post.title}
                            </h4>
                            <div className="flex items-center text-[10px] text-slate-500 space-x-2 mt-1 font-bold uppercase tracking-widest">
                                <span className="text-f1-pink">#{post.tags[0] || 'F1'}</span>
                                <span className="opacity-50 text-[8px]">TRENDING</span>
                            </div>
                        </div>
                    </div>
                 )) : (
                    <div className="h-full flex items-center justify-center text-center text-slate-500 italic text-xs uppercase font-bold tracking-widest p-10">
                        Updates folgen...
                    </div>
                 )}
            </div>

            {/* Spacer for bottom consistency */}
            <div className="h-[50px] bg-white/5 border-t border-white/5 shrink-0 flex items-center justify-center">
                <span className="text-[8px] font-black uppercase text-slate-600 tracking-[0.3em]">Live Data Stream</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;