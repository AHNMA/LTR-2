
import React from 'react';
import { usePosts } from '../contexts/PostContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Clock, MessageSquare, ChevronRight } from 'lucide-react';

const NewsFeed: React.FC = () => {
  const { getPostsBySection } = usePosts();
  const { goToArticle } = useNavigation();
  const feedPosts = getPostsBySection('feed');

  return (
    <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col space-y-8">
            {feedPosts.map((post) => (
                <div key={post.id} onClick={() => goToArticle(post.id)} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-slate-200 overflow-hidden flex flex-col md:flex-row group cursor-pointer">
                    
                    {/* Image Column */}
                    <div className="w-full md:w-5/12 relative overflow-hidden h-56 md:h-auto">
                        <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                        />
                         <div className="absolute inset-0 bg-f1-dark/10 group-hover:bg-transparent transition-colors"></div>
                         
                         {/* Modern Tag Badge */}
                         <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
                             {post.tags.slice(0,2).map(tag => (
                                <span key={tag} className="bg-white/95 backdrop-blur-sm text-f1-dark text-[10px] font-bold px-2 py-1 uppercase rounded-md shadow-sm border border-slate-100">{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center">
                        <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wide">
                            <span className="text-f1-pink">{post.author}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>{post.date}</span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold font-display text-slate-900 mb-3 group-hover:text-f1-pink leading-none transition-colors">
                            {post.title}
                        </h2>

                        <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2 md:line-clamp-3 font-normal">
                            {post.excerpt}
                        </p>

                        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                             <div className="flex items-center space-x-4 text-xs text-slate-400 font-medium">
                                <div className="flex items-center hover:text-slate-600 transition-colors">
                                    <MessageSquare size={14} className="mr-1.5" />
                                    <span>{post.commentCount} Comments</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock size={14} className="mr-1.5" />
                                    <span>{post.readTime}</span>
                                </div>
                             </div>

                            <button className="text-slate-900 text-xs font-black uppercase flex items-center group-hover:translate-x-1 transition-transform group-hover:text-f1-pink">
                                Read Story <ChevronRight size={14} className="ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="flex justify-center mt-12">
            <button className="bg-white border border-slate-200 text-slate-900 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-f1-pink hover:text-white hover:border-f1-pink transition-all shadow-sm hover:shadow-glow">
                Mehr Artikel laden
            </button>
        </div>
    </div>
  );
};

export default NewsFeed;
