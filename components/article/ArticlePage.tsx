import React from 'react';
import { usePosts } from '../../contexts/PostContext';
import { useNavigation } from '../../contexts/NavigationContext';
import BlockRenderer from './BlockRenderer';
import { Clock, Calendar, User, Share2, MessageSquare, ChevronRight, Facebook, Twitter, Linkedin, Copy, Camera } from 'lucide-react';

const ArticlePage: React.FC = () => {
  const { getPost } = usePosts();
  const { currentArticleId, goToHome } = useNavigation();
  
  const post = currentArticleId ? getPost(currentArticleId) : null;

  if (!post) return <div className="p-20 text-center">Article not found</div>;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "image": [post.image],
    "datePublished": post.date, // In real app, convert to ISO 8601
    "dateModified": post.date,
    "author": [{
      "@type": "Person",
      "name": post.author,
      "url": "https://example.com/author/" + post.author.replace(' ', '-').toLowerCase()
    }],
    "description": post.excerpt
  };

  return (
    <article className="bg-white min-h-screen pb-20 font-sans">
      {/* SEO Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Progress Bar (simulated) */}
      <div className="fixed top-0 left-0 h-1 bg-f1-pink z-[60] w-full origin-left animate-[grow_1s_ease-out]"></div>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4 flex items-center text-xs text-gray-500 uppercase font-bold tracking-wider">
        <button onClick={goToHome} className="hover:text-f1-pink transition-colors">Home</button>
        <ChevronRight size={12} className="mx-2" />
        <span className="text-f1-pink">News</span>
        <ChevronRight size={12} className="mx-2" />
        <span className="truncate max-w-[200px] text-gray-400">{post.title}</span>
      </div>

      {/* --- HERO SECTION --- */}
      <header className="container mx-auto px-4 lg:max-w-4xl xl:max-w-5xl text-center mb-8">
        
        {/* Tags */}
        <div className="flex justify-center gap-2 mb-6">
            {post.tags.slice(0,3).map(tag => (
                <span key={tag} className="bg-f1-pink/10 text-f1-pink px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {tag}
                </span>
            ))}
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-slate-900 leading-[0.9] mb-8 uppercase tracking-tight">
          {post.title}
        </h1>

        {/* Meta / Byline */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-500 border-y border-slate-100 py-4 mb-8">
            <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden mr-3">
                    <img src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} alt={post.author} />
                </div>
                <div className="text-left">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Written by</div>
                    <div className="font-bold text-slate-900">{post.author}</div>
                </div>
            </div>
            
            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-f1-pink" />
                    <span>{post.date}</span>
                </div>
                <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-f1-pink" />
                    <span>{post.readTime}</span>
                </div>
            </div>
        </div>
      </header>

      {/* Hero Media */}
      <div className="container mx-auto px-0 md:px-4 lg:max-w-6xl mb-12">
        <div className="relative aspect-video md:rounded-2xl overflow-hidden shadow-2xl group bg-slate-900">
            <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                fetchPriority="high"
            />
            {/* Credits & Caption Overlay */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 md:p-8 pt-20 flex justify-between items-end">
                <p className="text-white/90 text-xs md:text-sm font-medium max-w-2xl leading-snug">
                    {post.heroCaption || post.title}
                </p>
                {post.heroCredits && (
                    <div className="flex items-center text-white/60 text-[10px] uppercase font-bold tracking-wider ml-4 shrink-0 bg-black/30 backdrop-blur px-2 py-1 rounded">
                        <Camera size={12} className="mr-1.5" />
                        {post.heroCredits}
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:max-w-6xl flex flex-col lg:flex-row gap-12">
        
        {/* --- LEFT SIDEBAR (Desktop: Share) --- */}
        <aside className="hidden lg:flex flex-col w-20 sticky top-24 h-fit items-center space-y-6">
            <div className="text-[10px] font-bold uppercase -rotate-90 mb-4 text-slate-400 tracking-widest whitespace-nowrap">Share Article</div>
            <button className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm transform hover:scale-110">
                <Facebook size={20} />
            </button>
            <button className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm transform hover:scale-110">
                <Twitter size={20} />
            </button>
             <button className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-[#0A66C2] hover:text-white transition-all shadow-sm transform hover:scale-110">
                <Linkedin size={20} />
            </button>
             <button className="p-3 rounded-full bg-slate-50 text-slate-600 hover:bg-f1-pink hover:text-white transition-all shadow-sm transform hover:scale-110">
                <Copy size={20} />
            </button>

            <div className="w-px h-20 bg-slate-200 my-4"></div>

            <div className="flex flex-col items-center">
                <MessageSquare size={20} className="text-slate-400 mb-1" />
                <span className="text-xs font-bold">{post.commentCount}</span>
            </div>
        </aside>


        {/* --- MAIN BODY --- */}
        <div className="flex-1 max-w-3xl mx-auto">
            
            {/* Lead / Teaser */}
            {post.excerpt && (
                <div className="text-xl md:text-2xl font-serif leading-relaxed text-slate-900 mb-10 border-b border-slate-100 pb-10 first-letter:text-5xl first-letter:font-bold first-letter:text-f1-pink first-letter:mr-2 first-letter:float-left">
                    {post.excerpt}
                </div>
            )}

            {/* Blocks Content */}
            <div className="article-body">
                {post.blocks && post.blocks.length > 0 ? (
                    post.blocks.map(block => <BlockRenderer key={block.id} block={block} />)
                ) : (
                   /* Fallback for legacy text-only posts */
                   <div className="whitespace-pre-wrap text-lg leading-relaxed text-slate-700 font-sans font-light">
                       {post.content}
                   </div>
                )}
            </div>

            {/* Tags Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">Related Topics</h4>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                        <button key={tag} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-f1-pink hover:text-white transition-colors">
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Author Box */}
            <div className="mt-12 bg-slate-50 p-8 rounded-2xl flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${post.author}&size=200`} alt={post.author} className="w-full h-full object-cover" />
                </div>
                <div>
                    <div className="text-xs font-bold uppercase text-f1-pink tracking-widest mb-1">About the Author</div>
                    <h3 className="text-xl font-display font-bold text-slate-900 mb-2">{post.author}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Senior Formula 1 Editor covering the paddock since 2018. Expert in technical regulations and driver market analysis.
                    </p>
                    <button className="mt-4 text-xs font-bold uppercase text-slate-900 hover:text-f1-pink underline decoration-2 underline-offset-4">
                        View all articles
                    </button>
                </div>
            </div>

            {/* Comments Teaser */}
            <div className="mt-12 p-8 border border-slate-200 rounded-2xl text-center">
                 <MessageSquare size={32} className="mx-auto text-slate-300 mb-4" />
                 <h3 className="text-xl font-display font-bold text-slate-900">Join the Conversation</h3>
                 <p className="text-slate-500 mb-6 text-sm">Be the first to comment on this story.</p>
                 <button className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-f1-pink transition-colors shadow-glow">
                    Write a Comment
                 </button>
            </div>

        </div>

        {/* --- RIGHT SIDEBAR (Desktop: Trending) --- */}
        <aside className="hidden xl:block w-72 shrink-0">
             <div className="sticky top-24">
                <div className="flex items-center mb-6">
                    <div className="w-1 h-4 bg-f1-pink rounded-full mr-3"></div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Latest News</h3>
                </div>
                <div className="space-y-6">
                    {/* Placeholder for "Related" logic - reusing some logic would be ideal but mocking for layout */}
                    {[1,2,3].map(i => (
                        <div key={i} className="group cursor-pointer">
                            <div className="text-[10px] text-gray-400 mb-1 flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-f1-pink mr-2"></span>
                                {i * 15} MIN AGO
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-f1-pink transition-colors">
                                Toto Wolff warns about 2026 regulations loopholes
                            </h4>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-f1-dark rounded-xl text-white text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-xs font-bold text-f1-pink uppercase tracking-widest mb-2">Next Race</div>
                        <div className="text-2xl font-display font-bold mb-1">Bahrain GP</div>
                        <div className="text-sm text-gray-400">11.02.2026</div>
                        <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-bold uppercase transition-colors">
                            Race Center
                        </button>
                    </div>
                </div>
             </div>
        </aside>

      </div>

      {/* Mobile Sticky Share Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 flex justify-around items-center z-50 md:justify-center md:gap-8 pb-8 md:pb-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <button className="flex flex-col items-center text-slate-500 hover:text-f1-pink">
                <Share2 size={20} />
                <span className="text-[10px] font-bold mt-1 uppercase">Share</span>
            </button>
            <div className="w-px h-8 bg-slate-100"></div>
            <button className="flex flex-col items-center text-slate-500 hover:text-f1-pink">
                <MessageSquare size={20} />
                <span className="text-[10px] font-bold mt-1 uppercase">{post.commentCount}</span>
            </button>
      </div>

    </article>
  );
};

export default ArticlePage;