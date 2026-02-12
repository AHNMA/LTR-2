import React from 'react';
import { ContentBlock } from '../../types';
import { Quote, CheckCircle2, Play } from 'lucide-react';

interface BlockRendererProps {
  block: ContentBlock;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  switch (block.type) {
    case 'heading-h2':
      return (
        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mt-12 mb-6 leading-tight">
          {block.content}
        </h2>
      );
    case 'heading-h3':
      return (
        <h3 className="text-xl md:text-2xl font-display font-bold text-slate-800 mt-8 mb-4">
          {block.content}
        </h3>
      );
    case 'paragraph':
      return (
        <p className="text-lg leading-relaxed text-slate-700 mb-6 font-sans font-light">
          {block.content}
        </p>
      );
    case 'quote':
      return (
        <blockquote className="relative my-10 p-6 md:p-8 bg-slate-50 border-l-4 border-f1-pink rounded-r-xl">
          <Quote className="absolute top-4 left-4 text-f1-pink/20" size={48} />
          <p className="relative text-xl md:text-2xl italic font-serif text-slate-800 z-10">
            "{block.content}"
          </p>
        </blockquote>
      );
    case 'image':
      return (
        <figure className="my-10">
          <img 
            src={block.content} 
            alt={block.caption || "Article content"} 
            className="w-full h-auto rounded-xl shadow-md"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="mt-3 text-sm text-slate-500 text-center border-l-2 border-f1-pink pl-3 inline-block">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'video':
      // Simple logic to detect Youtube/Vimeo or render generic video tag
      // For this demo, assuming generic or direct link
      return (
        <div className="my-10 rounded-xl overflow-hidden shadow-lg bg-black relative aspect-video group">
            <video controls className="w-full h-full" poster={block.caption /* abuse caption for poster? */}>
                <source src={block.content} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {/* Fallback visual if it's not a real URL in demo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:bg-black/20 transition-colors">
                 <Play size={64} className="text-white opacity-50" />
            </div>
        </div>
      );
    case 'key-facts':
       return (
         <div className="my-10 bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8">
            <h4 className="text-xs font-bold uppercase text-f1-pink tracking-widest mb-4 flex items-center">
                <span className="w-2 h-2 bg-f1-pink rounded-full mr-2"></span>
                Key Facts & Takeaways
            </h4>
            <ul className="space-y-3">
                {block.items && block.items.length > 0 ? (
                    block.items.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                            <CheckCircle2 size={20} className="text-slate-400 mr-3 shrink-0 mt-0.5" />
                            <span className="text-slate-800 font-medium leading-snug">{item}</span>
                        </li>
                    ))
                ) : (
                    // Fallback if items not parsed but content exists
                     block.content.split('\n').map((item, idx) => (
                        <li key={idx} className="flex items-start">
                            <CheckCircle2 size={20} className="text-slate-400 mr-3 shrink-0 mt-0.5" />
                            <span className="text-slate-800 font-medium leading-snug">{item}</span>
                        </li>
                    ))
                )}
            </ul>
         </div>
       );
    case 'gallery':
        const images = block.items && block.items.length > 0 ? block.items : block.content.split('\n').filter(s => s.trim());
        return (
            <div className="my-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                        </div>
                    ))}
                </div>
                <div className="text-center text-xs text-slate-400 mt-2 italic">Image Gallery ({images.length} items)</div>
            </div>
        );
    case 'embed':
        return (
            <div className="my-10 flex justify-center" dangerouslySetInnerHTML={{ __html: block.content }} />
        );
    default:
      return null;
  }
};

export default BlockRenderer;