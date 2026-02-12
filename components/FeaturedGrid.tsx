
import React from 'react';
import { usePosts } from '../contexts/PostContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Clock, MessageSquare, User, ArrowUpRight } from 'lucide-react';

const FeaturedGrid: React.FC = () => {
  const { getPostsBySection } = usePosts();
  const { goToArticle } = useNavigation();
  const gridPosts = getPostsBySection('grid');

  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gridPosts.map((post) => (
              <div key={post.id} onClick={() => goToArticle(post.id)} className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-200">
                  <div className="relative overflow-hidden aspect-video">
                      <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-f1-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="absolute top-2 right-2">
                           <div className="bg-white/90 backdrop-blur text-slate-900 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-sm">
                                <ArrowUpRight size={14} />
                           </div>
                      </div>

                      <div className="absolute top-2 left-2">
                          <span className="bg-f1-dark/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center border border-white/10 shadow-sm">
                              <Clock size={9} className="mr-1" />
                              {post.readTime}
                          </span>
                      </div>
                  </div>
                  
                  <div className="p-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                           {post.tags.slice(0, 1).map(tag => (
                              <span key={tag} className="text-f1-pink text-[9px] font-bold uppercase tracking-wider bg-f1-pink/5 px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 leading-snug mb-3 group-hover:text-f1-pink transition-colors line-clamp-2">
                          {post.title}
                      </h3>
                      
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                           <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                              <User size={10} className="mr-1" />
                              {post.author.split(' ')[0]}
                          </div>
                          <div className="flex items-center text-[10px] text-slate-400 font-medium">
                              <MessageSquare size={10} className="mr-1" />
                              {post.commentCount}
                          </div>
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default FeaturedGrid;
