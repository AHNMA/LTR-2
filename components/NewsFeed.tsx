import React, { useState } from 'react';
import { usePosts } from '../contexts/PostContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Clock, MessageSquare, ChevronRight, RefreshCw, Plus } from 'lucide-react';

const NewsFeed: React.FC = () => {
  const { getPostsBySection } = usePosts();
  const { goToArticle } = useNavigation();
  const feedPosts = getPostsBySection('feed');
  
  // State for pagination
  const [visibleCount, setVisibleCount] = useState(5);

  const postsToShow = feedPosts.slice(0, visibleCount);
  const hasMore = feedPosts.length > visibleCount;

  const loadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col space-y-8">
            {postsToShow.map((post) => {
                const sections = Array.isArray(post.section) ? post.section : [post.section];
                
                return (
                <div key={post.id} onClick={() => goToArticle(post.id)} className="bg-f1-card rounded-2xl shadow-sm hover:shadow-glow transition-all duration-300 border border-white/5 overflow-hidden flex flex-col md:flex-row group cursor-pointer">
                    
                    {/* Image Column */}
                    <div className="w-full md:w-5/12 relative overflow-hidden h-56 md:h-auto">
                        {post.image && (
                            <img 
                                src={post.image} 
                                alt={post.title} 
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                            />
                        )}
                         <div className="absolute inset-0 bg-f1-dark/10 group-hover:bg-transparent transition-colors"></div>
                         
                         {/* Modern Section Badge */}
                         <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
                             {sections.map(sec => (
                                <span key={sec} className="bg-f1-pink text-white px-2 py-0.5 sm:px-3 sm:py-1 text-[7px] sm:text-[10px] font-bold uppercase tracking-widest rounded shadow-glow">
                                    {sec}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center font-display">
                        <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wide font-sans">
                            <span className="text-f1-pink">{post.author}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span>{post.date}</span>
                            {post.isUpdated && (
                                <>
                                    <span className="w-px h-3 bg-slate-700"></span>
                                    <span className="flex items-center text-f1-pink"><RefreshCw size={10} className="mr-1"/> Updated</span>
                                </>
                            )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-f1-pink leading-[0.9] transition-colors uppercase italic tracking-tight">
                            {post.title}
                        </h2>

                        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 md:line-clamp-3 font-normal font-sans">
                            {post.excerpt}
                        </p>

                        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4 font-sans">
                             <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium uppercase tracking-widest">
                                <div className="flex items-center hover:text-white transition-colors">
                                    <MessageSquare size={14} className="mr-1.5 text-f1-pink" />
                                    <span>{post.commentCount}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock size={14} className="mr-1.5 text-f1-pink" />
                                    <span>{post.readTime}</span>
                                </div>
                             </div>

                            <button className="text-white text-xs font-black uppercase flex items-center group-hover:translate-x-1 transition-transform group-hover:text-f1-pink tracking-widest">
                                Story lesen <ChevronRight size={14} className="ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            )})}
        </div>
        
        {hasMore && (
            <div className="flex justify-center mt-12">
                <button 
                    onClick={loadMore}
                    className="bg-f1-card border border-white/10 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-f1-pink hover:text-white hover:border-f1-pink transition-all shadow-sm hover:shadow-glow flex items-center group"
                >
                    <Plus size={14} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Mehr Artikel laden
                </button>
            </div>
        )}

        {!hasMore && feedPosts.length > 5 && (
            <div className="text-center mt-12 text-slate-500 text-xs font-bold uppercase tracking-widest italic font-display">
                Alle Artikel geladen
            </div>
        )}
    </div>
  );
};

export default NewsFeed;