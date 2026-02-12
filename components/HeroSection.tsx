
import React, { useState } from 'react';
import { usePosts } from '../contexts/PostContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Clock, MessageSquare, Zap, ChevronRight, TrendingUp } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { getPostsBySection } = usePosts();
  const { goToArticle } = useNavigation();
  const [activeTab, setActiveTab] = useState<'aktuell' | 'beliebt' | 'updated'>('aktuell');

  const heroPosts = getPostsBySection('hero');
  const heroPost = heroPosts.length > 0 ? heroPosts[0] : null;
  const recentPosts = getPostsBySection('recent');
  const trendingPosts = getPostsBySection('trending');

  if (!heroPost) return null;

  return (
    <div className="container mx-auto px-4 pt-6 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[550px]">
        
        {/* Left Column: Lists (3 cols) */}
        <div className="lg:col-span-3 flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex p-2 bg-slate-50 gap-1 border-b border-slate-100">
                <button 
                    onClick={() => setActiveTab('aktuell')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center justify-center space-x-1 ${activeTab === 'aktuell' ? 'bg-white text-f1-pink shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                >
                    <Clock size={12} />
                    <span>Aktuell</span>
                </button>
                <button 
                    onClick={() => setActiveTab('beliebt')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center justify-center space-x-1 ${activeTab === 'beliebt' ? 'bg-white text-f1-purple shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                >
                    <Zap size={12} />
                    <span>Beliebt</span>
                </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                {recentPosts.map((post) => (
                    <div key={post.id} onClick={() => goToArticle(post.id)} className="flex space-x-3 group cursor-pointer items-start">
                         <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100">
                            <img src={post.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-f1-pink leading-snug mb-1.5 line-clamp-2 transition-colors">
                                {post.title}
                            </h4>
                            <div className="flex items-center text-[10px] text-slate-500 space-x-3 font-medium">
                                <span className="flex items-center"><Clock size={10} className="mr-1 text-slate-400"/> {post.date.split('.')[0]} Dez</span>
                                <span className="flex items-center"><MessageSquare size={10} className="mr-1 text-slate-400"/> {post.commentCount}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                <button className="text-[10px] font-bold uppercase text-slate-600 hover:text-f1-pink flex items-center justify-center w-full transition-colors py-1">
                    Alle News anzeigen <ChevronRight size={12} className="ml-1" />
                </button>
            </div>
        </div>

        {/* Center Column: Hero Image (6 cols) */}
        <div onClick={() => goToArticle(heroPost.id)} className="lg:col-span-6 relative group cursor-pointer min-h-[400px] lg:h-full rounded-2xl overflow-hidden shadow-md border border-slate-200">
            <img 
                src={heroPost.image} 
                alt={heroPost.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay Gradient with new palette hint - slightly darker for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-f1-dark via-f1-surface/70 to-transparent opacity-95"></div>
            
            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] px-3 py-1.5 flex items-center rounded-full shadow-sm">
                <Clock size={10} className="mr-1.5" />
                <span className="font-medium tracking-wide">{heroPost.readTime.toUpperCase()}</span>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                    {heroPost.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-gradient-to-r from-f1-pink to-f1-berry backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 uppercase rounded shadow-lg border border-white/10">{tag}</span>
                    ))}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white font-display leading-[0.9] mb-4 drop-shadow-xl max-w-xl">
                    {heroPost.title}
                </h2>
                <div className="flex items-center space-x-2 text-f1-silver text-xs font-medium">
                     <span className="text-f1-pink font-bold uppercase tracking-wide">By {heroPost.author}</span>
                     <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                     <span>{heroPost.date}</span>
                </div>
            </div>
        </div>

        {/* Right Column: Trending (3 cols) */}
        <div className="lg:col-span-3 flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center text-f1-purple">
                    <TrendingUp size={16} className="mr-2" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Trending</h3>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
                 {trendingPosts.map((post, index) => (
                    <div key={post.id} onClick={() => goToArticle(post.id)} className="relative flex p-4 border-b border-slate-50 last:border-0 group cursor-pointer hover:bg-slate-50 transition-colors">
                        {/* Gradient strip on hover/active */}
                        <span className="absolute top-4 left-0 w-1 h-8 bg-gradient-to-b from-f1-pink to-f1-purple rounded-r-full transform -translate-x-full group-hover:translate-x-0 transition-transform"></span>
                        
                        {/* Rank Number: Improved Contrast */}
                        <div className="flex-shrink-0 mr-4 font-display font-bold text-2xl text-f1-purple/40 group-hover:text-f1-berry transition-colors w-6 text-center select-none">
                            {index + 1}
                        </div>
                        
                        <div className="flex flex-col justify-center">
                             <h4 className="text-xs font-bold text-slate-800 group-hover:text-f1-pink leading-snug line-clamp-2 transition-colors">
                                {post.title}
                            </h4>
                            <div className="flex items-center text-[10px] text-slate-500 space-x-2 mt-1.5 font-medium">
                                <span className="text-f1-purple">#{post.tags[0] || '1'}</span>
                                <span>Trending</span>
                            </div>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
