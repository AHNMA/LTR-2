import React from 'react';
import { usePosts } from '../contexts/PostContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Clock, MessageSquare, User, ArrowUpRight } from 'lucide-react';

const FeaturedGrid: React.FC = () => {
  const { getPostsBySection } = usePosts();
  const { goToArticle } = useNavigation();
  const gridPosts = getPostsBySection('ausgewählt');

  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gridPosts.map((post) => {
              const sections = Array.isArray(post.section) ? post.section : [post.section];
              return (
              <div key={post.id} onClick={() => goToArticle(post.id)} className="group cursor-pointer bg-f1-card rounded-2xl shadow-xl hover:shadow-glow hover:-translate-y-1 transition-all duration-500 overflow-hidden border border-white/5 flex flex-col">
                  <div className="relative overflow-hidden aspect-video">
                      {post.image && (
                          <img 
                              src={post.image} 
                              alt={post.title} 
                              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-90" 
                          />
                      )}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-f1-dark/80 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="absolute top-3 right-3">
                           <div className="bg-f1-pink text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-glow skew-x-[-12deg]">
                                <ArrowUpRight size={14} className="skew-x-[12deg]" />
                           </div>
                      </div>

                      <div className="absolute bottom-2 left-2">
                          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center border border-white/10 uppercase tracking-widest">
                              <Clock size={10} className="mr-1.5 text-f1-pink" />
                              {post.readTime}
                          </span>
                      </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col font-display">
                      <div className="flex flex-wrap gap-1 mb-2">
                           {sections.slice(0, 2).map(sec => (
                              <span key={sec} className="bg-f1-pink text-white px-2 py-0.5 sm:px-3 sm:py-1 text-[7px] sm:text-[10px] font-bold uppercase tracking-widest rounded shadow-glow">
                                  {sec}
                              </span>
                          ))}
                      </div>

                      <h3 className="text-xl font-bold text-white leading-[1.1] mb-4 group-hover:text-f1-pink transition-colors line-clamp-2 uppercase tracking-tight">
                          {post.title}
                      </h3>
                      
                      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4 font-sans">
                           <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              <User size={10} className="mr-1.5 text-f1-pink" />
                              {post.author.split(' ')[0]}
                          </div>
                          <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              <MessageSquare size={10} className="mr-1.5 text-f1-pink" />
                              {post.commentCount}
                          </div>
                      </div>
                  </div>
                  <div className="h-1 w-0 group-hover:w-full bg-f1-pink transition-all duration-500"></div>
              </div>
          )})}
          {gridPosts.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500 uppercase font-black tracking-widest bg-f1-card rounded-2xl border border-white/5">
                  Keine Artikel in 'Ausgewählt' vorhanden.
              </div>
          )}
      </div>
    </div>
  );
};

export default FeaturedGrid;