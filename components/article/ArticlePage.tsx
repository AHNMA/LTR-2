import React from 'react';
import { usePosts } from '../../contexts/PostContext';
import { useNavigation } from '../../contexts/NavigationContext';
import BlockRenderer from './BlockRenderer';
import { Clock, Calendar, Share2, MessageSquare, ChevronRight, Facebook, Twitter, Linkedin, Copy, Camera, RefreshCw } from 'lucide-react';

const ArticlePage: React.FC = () => {
  const { getPost } = usePosts();
  const { currentArticleId, goToHome } = useNavigation();
  
  const post = currentArticleId ? getPost(currentArticleId) : null;

  if (!post) return <div className="p-20 text-center text-white">Article not found</div>;

  const showLatestNews = post.layoutOptions?.showLatestNews !== false;
  const showNextRace = post.layoutOptions?.showNextRace !== false;
  const enableComments = post.layoutOptions?.enableComments !== false;
  const showRightSidebar = showLatestNews || showNextRace;

  // Normalize sections
  const activeSections = Array.isArray(post.section) ? post.section : [post.section];

  return (
    <article className="bg-f1-dark min-h-screen pb-20 font-sans text-slate-300">
      <div className="fixed top-0 left-0 h-1 bg-f1-pink z-[60] w-full origin-left animate-[grow_1s_ease-out] shadow-glow"></div>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4 flex items-center text-[10px] text-slate-500 uppercase font-bold tracking-widest">
        <button onClick={goToHome} className="hover:text-f1-pink transition-colors">Home</button>
        <ChevronRight size={10} className="mx-2" />
        <span className="text-f1-pink">News</span>
        <ChevronRight size={10} className="mx-2" />
        <span className="truncate max-w-[200px] text-slate-400">{post.title}</span>
      </div>

      <header className="container mx-auto px-4 lg:max-w-4xl xl:max-w-5xl text-center mb-12">
        {/* Pills / Sections */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-6">
            {activeSections.map(sec => (
                <span key={sec} className="bg-f1-pink text-white px-2 py-0.5 sm:px-3 sm:py-1 text-[7px] sm:text-[10px] font-bold uppercase tracking-widest rounded shadow-glow">
                    {sec}
                </span>
            ))}
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[0.85] mb-8 uppercase tracking-tighter break-words hyphens-auto italic">
          {post.title}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-6 text-[10px] text-slate-500 border-y border-white/5 py-6 mb-8 uppercase font-bold tracking-widest">
            <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden mr-3 border border-white/10">
                    <img src={`https://ui-avatars.com/api/?name=${post.author}&background=e10059&color=fff`} alt={post.author} />
                </div>
                <div className="text-left">
                    <div className="text-slate-500">Written by</div>
                    <div className="text-white text-xs">{post.author}</div>
                </div>
            </div>
            
            <div className="w-px h-8 bg-white/5 hidden sm:block"></div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center">
                    <Calendar size={14} className="mr-2 text-f1-pink" />
                    <span>{post.date}</span>
                </div>
                {post.isUpdated && (
                    <div className="flex items-center text-f1-pink">
                        <RefreshCw size={14} className="mr-1.5" />
                        Updated
                    </div>
                )}
                <div className="flex items-center">
                    <Clock size={14} className="mr-2 text-f1-pink" />
                    <span>{post.readTime}</span>
                </div>
            </div>
        </div>
      </header>

      {/* Hero Media */}
      <div className="container mx-auto px-0 md:px-4 lg:max-w-6xl mb-12">
        <div className="relative aspect-video md:rounded-2xl overflow-hidden shadow-2xl group bg-f1-card border border-white/5">
            {post.image && (
                <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-f1-dark via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 pt-20 z-10 flex flex-col justify-end items-start">
                <div className="flex flex-col space-y-2 w-full max-w-2xl font-display">
                    {post.heroCredits && (
                        <div className="flex items-center space-x-2">
                            <Camera size={12} className="text-f1-pink" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 font-sans">
                                {post.heroCredits}
                            </span>
                        </div>
                    )}
                    <p className="text-2xl font-bold text-white leading-none italic uppercase tracking-tight">
                        {post.heroCaption || post.title}
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:max-w-6xl flex flex-col lg:flex-row gap-12">
        <aside className="hidden lg:flex flex-col w-20 sticky top-32 h-fit items-center space-y-6 pt-12">
            <div className="text-[10px] font-bold uppercase -rotate-90 mb-10 text-slate-600 tracking-widest whitespace-nowrap">Share Article</div>
            <button className="p-3 rounded-full bg-white/5 text-slate-400 hover:text-white transition-all shadow-sm border border-white/5"><Facebook size={20} /></button>
            <button className="p-3 rounded-full bg-white/5 text-slate-400 hover:text-white transition-all shadow-sm border border-white/5"><Twitter size={20} /></button>
            <button className="p-3 rounded-full bg-white/5 text-slate-400 hover:text-white transition-all shadow-sm border border-white/5"><Copy size={20} /></button>
            <div className="w-px h-20 bg-white/5 my-4"></div>
            <div className="flex flex-col items-center">
                <MessageSquare size={20} className="text-f1-pink mb-1" />
                <span className="text-xs font-bold text-white">{post.commentCount}</span>
            </div>
        </aside>

        <div className="flex-1 min-w-0 max-w-3xl mx-auto w-full @container">
            {post.excerpt && (
                <div className="text-xl md:text-2xl font-serif italic leading-relaxed text-slate-200 mb-10 border-b border-white/5 pb-10 first-letter:text-6xl first-letter:font-black first-letter:text-f1-pink first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                    {post.excerpt}
                </div>
            )}

            <div className="article-body">
                {post.blocks && post.blocks.length > 0 ? (
                    post.blocks.map(block => <BlockRenderer key={block.clientId} block={block} />)
                ) : (
                   <div className="whitespace-pre-wrap text-lg leading-relaxed text-slate-300 font-sans font-light break-words">
                       {post.content}
                   </div>
                )}
            </div>

            <div className="mt-16 pt-8 border-t border-white/5">
                <h4 className="text-[10px] font-bold uppercase text-slate-600 mb-6 tracking-widest">Related Topics (Tags)</h4>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                        <button key={tag} className="px-3 py-1 sm:px-4 sm:py-2 bg-white/5 text-slate-400 rounded-lg text-[9px] sm:text-xs font-bold uppercase tracking-wider hover:bg-f1-pink hover:text-white transition-colors border border-white/5">
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Author Box */}
            <div className="mt-12 bg-f1-card p-8 rounded-2xl flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 border border-white/5">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-f1-pink/20 shadow-md flex-shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${post.author}&background=e10059&color=fff&size=200`} alt={post.author} className="w-full h-full object-cover" />
                </div>
                <div>
                    <div className="text-[10px] font-bold uppercase text-f1-pink tracking-widest mb-1">About the Author</div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2 italic">{post.author}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-sans">
                        Senior Formula 1 Editor covering the paddock since 2018. Expert in technical regulations and driver market analysis.
                    </p>
                </div>
            </div>

            {/* Comments Teaser */}
            {enableComments && (
                <div className="mt-12 p-8 border border-white/5 bg-f1-card rounded-2xl text-center shadow-2xl">
                     <MessageSquare size={32} className="mx-auto text-f1-pink mb-4 animate-pulse" />
                     <h3 className="text-xl font-display font-bold text-white uppercase italic tracking-widest">Join the Conversation</h3>
                     <p className="text-slate-500 mb-6 text-sm">Be the first to comment on this story.</p>
                     <button className="bg-f1-pink text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-pink-700 transition-colors shadow-glow">
                        Write a Comment
                     </button>
                </div>
            )}
        </div>

        {showRightSidebar && (
            <aside className="hidden xl:block w-72 shrink-0">
                <div className="sticky top-24 space-y-12">
                    {showLatestNews && (
                        <div>
                            <div className="flex items-center mb-6">
                                <div className="w-1 h-4 bg-f1-pink rounded-full mr-3 shadow-glow"></div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Latest News</h3>
                            </div>
                            <div className="space-y-6">
                                {[1,2,3].map(i => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="text-[9px] text-f1-pink mb-1 flex items-center font-bold tracking-widest">
                                            <span className="w-1.5 h-1.5 rounded-full bg-f1-pink mr-2"></span>
                                            {i * 15} MIN AGO
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-100 leading-snug group-hover:text-f1-pink transition-colors uppercase italic font-display">
                                            Toto Wolff warns about 2026 regulations loopholes
                                        </h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {showNextRace && (
                        <div className="p-6 bg-f1-card border border-white/5 rounded-2xl text-white text-center relative overflow-hidden group hover:border-f1-pink/30 transition-colors">
                            <div className="relative z-10">
                                <div className="text-[10px] font-black text-f1-pink uppercase tracking-[0.2em] mb-3">Next Race</div>
                                <div className="text-3xl font-display font-bold mb-1 italic uppercase leading-none">Bahrain GP</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">11.02.2026</div>
                                <button className="w-full py-2.5 bg-f1-pink text-white rounded text-[10px] font-black uppercase tracking-widest transition-all hover:bg-pink-700 shadow-glow">
                                    Race Center
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        )}
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-f1-card/90 backdrop-blur-md border-t border-white/10 p-4 flex justify-around items-center z-50 pb-8 shadow-2xl">
            <button className="flex flex-col items-center text-slate-400 hover:text-f1-pink">
                <Share2 size={20} />
                <span className="text-[10px] font-bold mt-1 uppercase">Share</span>
            </button>
            <div className="w-px h-8 bg-white/10"></div>
            <button className="flex flex-col items-center text-slate-400 hover:text-f1-pink">
                <MessageSquare size={20} />
                <span className="text-[10px] font-bold mt-1 uppercase">{post.commentCount}</span>
            </button>
      </div>
    </article>
  );
};

export default ArticlePage;