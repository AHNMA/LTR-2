import React, { useState, useEffect, useRef } from 'react';
import { Post, PostSection, ContentBlock, BlockType } from '../../types';
import { X, Save, Image as ImageIcon, Tag, Clock, Layout, User, Plus, MoveUp, MoveDown, Trash2, Type, Quote, Heading, AlignLeft, ListChecks, Video, Layers, Code, Copyright } from 'lucide-react';

interface PostEditorProps {
  post?: Post;
  onSave: (post: Post) => void;
  onCancel: () => void;
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const PostEditor: React.FC<PostEditorProps> = ({ post, onSave, onCancel }) => {
  // --- Global Metadata State ---
  const [metadata, setMetadata] = useState<Partial<Post>>({
    title: '',
    excerpt: '',
    author: 'Sascha Riefe',
    date: new Date().toLocaleDateString('de-DE'),
    image: 'https://picsum.photos/800/600',
    heroCaption: '',
    heroCredits: '',
    tags: [],
    readTime: '3 min read',
    section: 'feed',
    commentCount: 0
  });

  // --- Blocks State (The "Gutenberg" Content) ---
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setMetadata({
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        date: post.date,
        image: post.image,
        heroCaption: post.heroCaption || '',
        heroCredits: post.heroCredits || '',
        tags: post.tags,
        readTime: post.readTime,
        section: post.section,
        commentCount: post.commentCount
      });
      // Load blocks or create a default paragraph if none exist
      if (post.blocks && post.blocks.length > 0) {
        setBlocks(post.blocks);
      } else if (post.content) {
          // Legacy support: convert string content to paragraph block
          setBlocks([{ id: generateId(), type: 'paragraph', content: post.content }]);
      } else {
        setBlocks([{ id: generateId(), type: 'paragraph', content: '' }]);
      }
    } else {
       // New Post defaults
       setBlocks([{ id: generateId(), type: 'paragraph', content: '' }]);
    }
  }, [post]);

  // --- Handlers ---

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  // Tag Management
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setMetadata(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };
  const removeTag = (indexToRemove: number) => {
    setMetadata(prev => ({ ...prev, tags: prev.tags?.filter((_, i) => i !== indexToRemove) }));
  };

  // Block Management
  const addBlock = (type: BlockType, index?: number) => {
    const newBlock: ContentBlock = { id: generateId(), type, content: '', items: [] };
    if (index !== undefined) {
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks(prev => [...prev, newBlock]);
    }
    setFocusedBlockId(newBlock.id);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };
  
  const updateBlockItems = (id: string, itemsString: string) => {
      // Split by newline for simple editing of lists/galleries
      const items = itemsString.split('\n').filter(i => i.trim() !== '');
      setBlocks(prev => prev.map(b => b.id === id ? { ...b, items, content: itemsString } : b));
  };

  const removeBlock = (id: string) => {
    if (blocks.length === 1) return; // Don't delete the last block
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadata.title || !metadata.section) return;
    
    // Generate legacy text content for excerpts/search
    const plainTextContent = blocks.map(b => b.content).join(' ');

    const newPost: Post = {
      id: post?.id || Date.now().toString(),
      title: metadata.title!,
      excerpt: metadata.excerpt || '',
      content: plainTextContent, // Legacy fallback
      blocks: blocks, // New structured content
      author: metadata.author || 'Redaktion',
      date: metadata.date || new Date().toLocaleDateString('de-DE'),
      image: metadata.image || '',
      heroCaption: metadata.heroCaption,
      heroCredits: metadata.heroCredits,
      tags: metadata.tags || [],
      commentCount: metadata.commentCount || 0,
      readTime: metadata.readTime || '',
      section: metadata.section as PostSection
    };
    
    onSave(newPost);
  };

  // --- Subcomponents for the Editor ---

  const BlockControls = ({ index, id }: { index: number, id: string }) => (
    <div className="absolute -left-12 top-0 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={() => moveBlock(index, 'up')} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="Move Up">
            <MoveUp size={14} />
        </button>
        <button type="button" onClick={() => moveBlock(index, 'down')} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="Move Down">
            <MoveDown size={14} />
        </button>
        <button type="button" onClick={() => removeBlock(id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete Block">
            <Trash2 size={14} />
        </button>
    </div>
  );

  const AddBlockMenu = ({ index }: { index: number }) => {
     const [isOpen, setIsOpen] = useState(false);
     
     return (
        <div className="relative group/add my-2 flex justify-center h-4 hover:h-8 transition-all items-center z-10">
            <div className="absolute w-full h-[1px] bg-f1-pink/20 opacity-0 group-hover/add:opacity-100 transition-opacity"></div>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white border border-slate-200 text-slate-500 rounded-full p-1 shadow-sm hover:border-f1-pink hover:text-f1-pink z-20 relative opacity-0 group-hover/add:opacity-100 transition-opacity transform hover:scale-110"
            >
                <Plus size={16} />
            </button>

            {isOpen && (
                <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                <div className="absolute top-8 bg-white border border-slate-200 shadow-xl rounded-lg p-2 flex space-x-2 z-30 animate-in slide-in-from-top-2 duration-150 overflow-x-auto max-w-[90vw]">
                    <button type="button" onClick={() => { addBlock('paragraph', index); setIsOpen(false); }} className="flex flex-col items-center p-2 hover:bg-slate-50 rounded-md text-xs text-slate-600 w-16">
                        <AlignLeft size={20} className="mb-1" /> Text
                    </button>
                    <button type="button" onClick={() => { addBlock('heading-h2', index); setIsOpen(false); }} className="flex flex-col items-center p-2 hover:bg-slate-50 rounded-md text-xs text-slate-600 w-16">
                        <Heading size={20} className="mb-1" /> H2
                    </button>
                    <button type="button" onClick={() => { addBlock('key-facts', index); setIsOpen(false); }} className="flex flex-col items-center p-2 hover:bg-slate-50 rounded-md text-xs text-slate-600 w-16">
                        <ListChecks size={20} className="mb-1" /> Facts
                    </button>
                    <button type="button" onClick={() => { addBlock('image', index); setIsOpen(false); }} className="flex flex-col items-center p-2 hover:bg-slate-50 rounded-md text-xs text-slate-600 w-16">
                        <ImageIcon size={20} className="mb-1" /> Image
                    </button>
                    <button type="button" onClick={() => { addBlock('video', index); setIsOpen(false); }} className="flex flex-col items-center p-2 hover:bg-slate-50 rounded-md text-xs text-slate-600 w-16">
                        <Video size={20} className="mb-1" /> Video
                    </button>
                    <button type="button" onClick={() => { addBlock('gallery', index); setIsOpen(false); }} className="flex flex-col items-center p-2 hover:bg-slate-50 rounded-md text-xs text-slate-600 w-16">
                        <Layers size={20} className="mb-1" /> Gallery
                    </button>
                    <button type="button" onClick={() => { addBlock('quote', index); setIsOpen(false); }} className="flex flex-col items-center p-2 hover:bg-slate-50 rounded-md text-xs text-slate-600 w-16">
                        <Quote size={20} className="mb-1" /> Quote
                    </button>
                    <button type="button" onClick={() => { addBlock('embed', index); setIsOpen(false); }} className="flex flex-col items-center p-2 hover:bg-slate-50 rounded-md text-xs text-slate-600 w-16">
                        <Code size={20} className="mb-1" /> Embed
                    </button>
                </div>
                </>
            )}
        </div>
     )
  }

  // --- Auto-resizing Textarea Component ---
  const AutoTextarea = ({ value, onChange, className, placeholder, autoFocus, onBlur }: any) => {
    const ref = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = ref.current.scrollHeight + 'px';
        }
    }, [value]);

    useEffect(() => {
        if (autoFocus && ref.current) {
            ref.current.focus();
        }
    }, [autoFocus]);

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={className}
            placeholder={placeholder}
            rows={1}
        />
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-100 z-[60] overflow-hidden flex flex-col">
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-slate-200 h-16 px-6 flex justify-between items-center shadow-sm z-40 shrink-0">
           <div className="flex items-center space-x-4">
               <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                   <X size={24} />
               </button>
               <div className="border-l border-slate-200 pl-4">
                   <h2 className="font-sans font-semibold text-slate-900">{post ? 'Edit Post' : 'New Post'}</h2>
                   <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{metadata.section} section</span>
               </div>
           </div>
           
           <div className="flex items-center space-x-3">
               <div className="text-xs text-slate-400 mr-4">
                   {blocks.length} blocks • {metadata.readTime || '0 min read'}
               </div>
               <button type="submit" className="px-6 py-2 bg-f1-pink text-white rounded-md text-sm font-bold uppercase tracking-wide hover:bg-pink-700 shadow-sm flex items-center transition-all">
                   <Save size={16} className="mr-2" />
                   Publish
               </button>
           </div>
        </div>

        {/* Main Editor Layout */}
        <div className="flex-grow flex overflow-hidden">
            
            {/* Left Sidebar: Document Settings (WP Style) */}
            <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto shrink-0 p-6 hidden lg:block">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest">Article Settings</h3>
                
                <div className="space-y-6">
                    {/* Placement */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Section Placement</label>
                        <select 
                            name="section" 
                            value={metadata.section} 
                            onChange={handleMetadataChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-f1-pink"
                        >
                            <option value="hero">Hero (Main Story)</option>
                            <option value="recent">Recent News List</option>
                            <option value="trending">Trending Sidebar</option>
                            <option value="grid">Featured Grid</option>
                            <option value="feed">Main Feed</option>
                        </select>
                    </div>

                    {/* Meta */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Author</label>
                        <div className="relative">
                            <User size={14} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="text" 
                                name="author" 
                                value={metadata.author} 
                                onChange={handleMetadataChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-f1-pink"
                            />
                        </div>
                    </div>

                     {/* Image */}
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Featured Media (Hero)</label>
                        <div className="relative mb-2">
                            <ImageIcon size={14} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="text" 
                                name="image" 
                                value={metadata.image} 
                                onChange={handleMetadataChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-f1-pink"
                                placeholder="Image URL..."
                            />
                        </div>
                         <div className="relative mb-2">
                            <Type size={14} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="text" 
                                name="heroCaption" 
                                value={metadata.heroCaption} 
                                onChange={handleMetadataChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-f1-pink"
                                placeholder="Caption / Description"
                            />
                        </div>
                        <div className="relative">
                            <Copyright size={14} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="text" 
                                name="heroCredits" 
                                value={metadata.heroCredits} 
                                onChange={handleMetadataChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-f1-pink"
                                placeholder="Photo Credits"
                            />
                        </div>

                        {metadata.image && (
                            <div className="mt-2 rounded-md overflow-hidden aspect-video border border-slate-200 relative group">
                                <img src={metadata.image} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-700">Tags</label>
                         <div className="flex flex-wrap gap-2 mb-2">
                            {metadata.tags?.map((tag, index) => (
                                <span key={index} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-md flex items-center border border-slate-200">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(index)} className="ml-1 hover:text-red-500"><X size={10} /></button>
                                </span>
                            ))}
                        </div>
                        <input 
                            type="text" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-f1-pink"
                            placeholder="Add tag..."
                        />
                    </div>
                </div>
            </div>

            {/* Central Canvas (Gutenberg Style) */}
            <div className="flex-1 overflow-y-auto bg-[#f0f0f0] p-4 md:p-8 flex justify-center cursor-text" onClick={() => {
                // Focus logic could go here
            }}>
                <div className="w-full max-w-3xl bg-white min-h-[100vh] shadow-sm p-8 md:p-16 rounded-sm">
                    
                    {/* Header Area */}
                    <div className="mb-8 space-y-4">
                        <AutoTextarea 
                            name="title" 
                            value={metadata.title} 
                            onChange={handleMetadataChange}
                            className="w-full text-4xl md:text-5xl font-display font-bold text-slate-900 placeholder-slate-300 focus:outline-none bg-transparent resize-none overflow-hidden"
                            placeholder="Headline"
                        />
                        <AutoTextarea 
                            name="excerpt" 
                            value={metadata.excerpt} 
                            onChange={handleMetadataChange}
                            className="w-full text-xl text-slate-500 font-serif leading-relaxed focus:outline-none bg-transparent resize-none overflow-hidden"
                            placeholder="Lead Teaser Paragraph..."
                        />
                    </div>

                    <hr className="border-slate-100 mb-8" />

                    {/* Blocks Area */}
                    <div className="space-y-1">
                        {blocks.map((block, index) => (
                            <div key={block.id} className="relative group pl-2 md:pl-0">
                                {/* Block Controls appear on hover */}
                                <div className="hidden md:block">
                                    <BlockControls index={index} id={block.id} />
                                </div>
                                
                                {/* Block Content Renderers */}
                                <div className="relative">
                                    
                                    {block.type === 'paragraph' && (
                                        <AutoTextarea
                                            value={block.content}
                                            onChange={(e: any) => updateBlockContent(block.id, e.target.value)}
                                            className="w-full text-lg leading-relaxed text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent resize-none"
                                            placeholder="Type / to choose a block"
                                            autoFocus={focusedBlockId === block.id}
                                        />
                                    )}

                                    {block.type === 'heading-h2' && (
                                        <AutoTextarea
                                            value={block.content}
                                            onChange={(e: any) => updateBlockContent(block.id, e.target.value)}
                                            className="w-full text-2xl font-display font-bold text-slate-900 placeholder-slate-300 focus:outline-none bg-transparent resize-none mt-8 mb-2"
                                            placeholder="Heading 2"
                                            autoFocus={focusedBlockId === block.id}
                                        />
                                    )}

                                    {block.type === 'heading-h3' && (
                                        <AutoTextarea
                                            value={block.content}
                                            onChange={(e: any) => updateBlockContent(block.id, e.target.value)}
                                            className="w-full text-xl font-display font-bold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent resize-none mt-6 mb-2"
                                            placeholder="Heading 3"
                                            autoFocus={focusedBlockId === block.id}
                                        />
                                    )}

                                    {block.type === 'quote' && (
                                        <div className="flex border-l-4 border-f1-pink pl-4 my-6 bg-slate-50 p-6 rounded-r-lg">
                                            <Quote size={20} className="text-f1-pink mr-3 shrink-0 mt-1" />
                                            <AutoTextarea
                                                value={block.content}
                                                onChange={(e: any) => updateBlockContent(block.id, e.target.value)}
                                                className="w-full text-xl italic font-serif text-slate-700 placeholder-slate-300 focus:outline-none bg-transparent resize-none"
                                                placeholder="Enter quote..."
                                                autoFocus={focusedBlockId === block.id}
                                            />
                                        </div>
                                    )}

                                    {block.type === 'key-facts' && (
                                        <div className="my-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                                            <div className="flex items-center text-f1-pink mb-3 font-bold uppercase text-xs tracking-widest">
                                                <ListChecks size={16} className="mr-2" />
                                                Key Facts & Takeaways
                                            </div>
                                            <AutoTextarea
                                                value={block.content}
                                                onChange={(e: any) => updateBlockItems(block.id, e.target.value)}
                                                className="w-full text-base leading-relaxed text-slate-700 placeholder-slate-300 focus:outline-none bg-transparent resize-none font-medium"
                                                placeholder="Enter one fact per line..."
                                                autoFocus={focusedBlockId === block.id}
                                            />
                                        </div>
                                    )}

                                    {block.type === 'image' && (
                                        <div className="my-6 bg-slate-50 p-4 rounded-lg border border-slate-200 border-dashed">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <ImageIcon size={16} className="text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={block.content}
                                                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-f1-pink"
                                                    placeholder="Paste image URL..."
                                                    autoFocus={focusedBlockId === block.id}
                                                />
                                            </div>
                                            {block.content && (
                                                <div className="rounded overflow-hidden shadow-sm">
                                                    <img src={block.content} alt="Block content" className="w-full h-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {block.type === 'video' && (
                                        <div className="my-6 bg-slate-50 p-4 rounded-lg border border-slate-200 border-dashed">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Video size={16} className="text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={block.content}
                                                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-f1-pink"
                                                    placeholder="Paste Video URL (YouTube, Vimeo, MP4)..."
                                                    autoFocus={focusedBlockId === block.id}
                                                />
                                            </div>
                                            <div className="text-[10px] text-slate-400">Renders as embedded video player</div>
                                        </div>
                                    )}

                                    {block.type === 'gallery' && (
                                        <div className="my-6 bg-slate-50 p-4 rounded-lg border border-slate-200 border-dashed">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Layers size={16} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-500 uppercase">Gallery Images</span>
                                            </div>
                                            <AutoTextarea
                                                value={block.content}
                                                onChange={(e: any) => updateBlockItems(block.id, e.target.value)}
                                                className="w-full text-sm leading-relaxed text-slate-600 placeholder-slate-300 focus:outline-none bg-white border border-slate-200 rounded p-2 resize-none font-mono"
                                                placeholder="Paste image URLs (one per line)..."
                                                autoFocus={focusedBlockId === block.id}
                                            />
                                        </div>
                                    )}

                                    {block.type === 'embed' && (
                                        <div className="my-6 bg-slate-50 p-4 rounded-lg border border-slate-200 border-dashed">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Code size={16} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-500 uppercase">HTML Embed Code</span>
                                            </div>
                                            <AutoTextarea
                                                value={block.content}
                                                onChange={(e: any) => updateBlockContent(block.id, e.target.value)}
                                                className="w-full text-xs leading-relaxed text-slate-600 placeholder-slate-300 focus:outline-none bg-white border border-slate-200 rounded p-2 resize-none font-mono"
                                                placeholder="<iframe ...></iframe>"
                                                autoFocus={focusedBlockId === block.id}
                                            />
                                        </div>
                                    )}

                                </div>

                                {/* Inserter between blocks */}
                                <AddBlockMenu index={index} />
                            </div>
                        ))}

                        {/* Fallback empty add area at bottom */}
                        {blocks.length === 0 && (
                             <button type="button" onClick={() => addBlock('paragraph')} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-f1-pink hover:text-f1-pink transition-colors flex flex-col items-center justify-center">
                                <Plus size={24} className="mb-2" />
                                <span>Start writing or type / to choose a block</span>
                             </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
      </form>
    </div>
  );
};

export default PostEditor;