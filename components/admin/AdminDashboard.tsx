
import React, { useState, useEffect } from 'react';
import { usePosts } from '../../contexts/PostContext';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Post, Team, Driver, Race, User, PostSection } from '../../types';
import PostEditor from './PostEditor';
import TeamEditor from './TeamEditor';
import DriverEditor from './DriverEditor';
import RaceEditor from './RaceEditor';
import SessionEditor from './SessionEditor';
import UserManagement from './UserManagement';
import PredictionManager from './PredictionManager'; 
import MediaLibrary from './MediaLibrary'; 
import SystemSettings from './SystemSettings';
import { Plus, Edit2, Trash2, Search, LayoutDashboard, Flag, User as UserIcon, Users, FileText, Calendar, Trophy, BarChart2, Shield, BrainCircuit, Image as ImageIcon, GripVertical, ChevronUp, ChevronDown, AlertTriangle, X, Settings as SettingsIcon, MapPin, Zap, Ruler, Weight, Circle } from 'lucide-react';
import { getFlagUrl } from '../../constants';

interface AdminDashboardProps {
  onExit: () => void;
}

type TabType = 'articles' | 'teams' | 'drivers' | 'calendar' | 'results' | 'users' | 'prediction' | 'media' | 'system';

const ALL_SECTIONS: PostSection[] = ['highlight', 'aktuell', 'updated', 'trending', 'ausgewählt', 'feed'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const { posts, addPost, updatePost, deletePost } = usePosts();
  const { teams, drivers, races, addTeam, updateTeam, deleteTeam, addDriver, updateDriver, deleteDriver, addRace, updateRace, deleteRace, reorderEntities } = useData();
  const { users } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('articles');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor States
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [editingSession, setEditingSession] = useState<Race | null>(null); // For results
  const [isCreating, setIsCreating] = useState(false);

  // Author Edit State
  const [editingAuthorPostId, setEditingAuthorPostId] = useState<string | null>(null);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'article' | 'team' | 'driver' | 'race', name: string} | null>(null);

  // Sorting State
  const [localList, setLocalList] = useState<any[]>([]); // For immediate drag feedback

  // Helpers for Authors
  const eligibleAuthors = users.filter(u => ['admin', 'editor', 'it', 'author'].includes(u.role));
  const getAuthorName = (u: User) => (u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}` : u.username;

  // Sync local list when data changes or tab changes
  useEffect(() => {
      if (activeTab === 'teams') setLocalList(teams);
      else if (activeTab === 'drivers') setLocalList(drivers);
      else if (activeTab === 'calendar') setLocalList(races);
      else setLocalList([]); // Reset for other tabs
  }, [activeTab, teams, drivers, races]);

  // --- Validation Helpers ---
  const checkTeamIncomplete = (t: Team) => {
      const missing = [];
      if (!t.logo) missing.push('Logo');
      if (!t.name) missing.push('Name');
      if (!t.nationalityFlag) missing.push('Nationalität');
      if (!t.color) missing.push('Farbe');
      if (!t.base) missing.push('Standort');
      if (!t.teamPrincipal) missing.push('Principal');
      if (!t.chassis) missing.push('Chassis');
      if (!t.powerUnit) missing.push('Power Unit');
      if (!t.slug) missing.push('Slug');
      return missing;
  };

  const checkDriverIncomplete = (d: Driver) => {
      const missing = [];
      if (!d.image) missing.push('Bild');
      if (!d.firstName || !d.lastName) missing.push('Name');
      if (d.raceNumber === undefined || d.raceNumber === 0) missing.push('Startnummer');
      if (!d.nationalityFlag) missing.push('Nationalität');
      if (!d.teamId) missing.push('Team-Zugehörigkeit');
      if (!d.dob) missing.push('Geburtsdatum');
      if (!d.birthplace) missing.push('Geburtsort');
      if (!d.height) missing.push('Größe');
      if (!d.weight) missing.push('Gewicht');
      if (!d.slug) missing.push('Slug');
      return missing;
  };

  // --- Handlers ---
  const handleSavePost = async (post: Post) => {
    try {
        if (isCreating) {
            const newPost = { ...post, id: post.id || Date.now().toString() };
            await addPost(newPost);
            setIsCreating(false);
            setEditingPost(newPost);
        } else {
            await updatePost(post);
        }
    } catch (e) {
        alert('Fehler beim Speichern des Artikels.');
        console.error(e);
    }
  };

  const togglePostStatus = async (post: Post) => {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      try {
          await updatePost({ ...post, status: newStatus });
      } catch (e) {
          console.error("Status update failed", e);
      }
  };

  const togglePostSection = async (post: Post, section: PostSection) => {
      const currentSections = Array.isArray(post.section) ? [...post.section] : [post.section as any];
      let newSections: PostSection[];
      
      if (currentSections.includes(section)) {
          newSections = currentSections.filter(s => s !== section);
      } else {
          newSections = [...currentSections, section];
      }
      
      // Minimal validation: must have at least one section
      if (newSections.length === 0) newSections = ['feed'];
      
      try {
          await updatePost({ ...post, section: newSections });
      } catch (e) {
          console.error("Section update failed", e);
      }
  };

  const handlePostAuthorChange = async (post: Post, userId: string) => {
      if (!userId) return;
      const user = users.find(u => u.id === userId);
      if (user) {
          const authorName = getAuthorName(user);
          await updatePost({ ...post, author: authorName, authorId: user.id });
      }
      setEditingAuthorPostId(null);
  };

  const handleSaveTeam = async (team: Team) => {
      try {
          if (isCreating) {
              await addTeam(team);
          } else {
              await updateTeam(team); 
          }
          closeEditor();
      } catch (e) {
          alert('Fehler beim Speichern des Teams.');
          console.error(e);
      }
  };

  const handleSaveDriver = async (driver: Driver) => {
      try {
          if (isCreating) {
              await addDriver(driver);
          } else {
              await updateDriver(driver); 
          }
          closeEditor();
      } catch (e) {
          alert('Fehler beim Speichern des Fahrers.');
          console.error(e);
      }
  }

  const handleSaveRace = async (race: Race) => {
      try {
          if (isCreating) {
              await addRace(race);
          } else {
              await updateRace(race); 
          }
          closeEditor();
      } catch (e) {
          alert('Fehler beim Speichern des Rennens.');
          console.error(e);
      }
  }

  const requestDelete = (id: string, type: 'article' | 'team' | 'driver' | 'race', name: string) => {
      setItemToDelete({ id, type, name });
  };

  const confirmDelete = async () => {
      if (!itemToDelete) return;
      
      try {
          if (itemToDelete.type === 'article') await deletePost(itemToDelete.id);
          else if (itemToDelete.type === 'team') await deleteTeam(itemToDelete.id);
          else if (itemToDelete.type === 'driver') await deleteDriver(itemToDelete.id);
          else if (itemToDelete.type === 'race') await deleteRace(itemToDelete.id);
      } catch (e) {
          console.error("Delete failed", e);
          alert("Löschen fehlgeschlagen.");
      } finally {
          setItemToDelete(null);
      }
  };

  const closeEditor = () => {
      setEditingPost(null);
      setEditingTeam(null);
      setEditingDriver(null);
      setEditingRace(null);
      setEditingSession(null);
      setIsCreating(false);
  }

  // --- Sorting Logic ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData('dragIndex', index.toString());
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const dragIndex = Number(e.dataTransfer.getData('dragIndex'));
      if (dragIndex === dropIndex) return;

      const newList = [...localList];
      const [movedItem] = newList.splice(dragIndex, 1);
      newList.splice(dropIndex, 0, movedItem);

      setLocalList(newList);
      saveOrder(newList);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === localList.length - 1) return;

      const newList = [...localList];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
      
      setLocalList(newList);
      saveOrder(newList);
  };

  const saveOrder = async (orderedList: any[]) => {
      if (activeTab === 'teams') {
          await reorderEntities('teams', orderedList);
      } else if (activeTab === 'drivers') {
          await reorderEntities('drivers', orderedList);
      } else if (activeTab === 'calendar') {
          await reorderEntities('races', orderedList);
      }
  };

  // --- Render Editors ---
  if (editingPost || (isCreating && activeTab === 'articles')) {
    return <PostEditor post={editingPost || undefined} onSave={handleSavePost} onCancel={closeEditor} />;
  }
  if (editingTeam || (isCreating && activeTab === 'teams')) {
      return <TeamEditor team={editingTeam || undefined} onSave={handleSaveTeam} onCancel={closeEditor} />;
  }
  if (editingDriver || (isCreating && activeTab === 'drivers')) {
      return <DriverEditor driver={editingDriver || undefined} onSave={handleSaveDriver} onCancel={closeEditor} />;
  }
  if (editingRace || (isCreating && activeTab === 'calendar')) {
      return <RaceEditor race={editingRace || undefined} onSave={handleSaveRace} onCancel={closeEditor} />;
  }
  if (editingSession) {
      return <SessionEditor race={editingSession} onClose={closeEditor} />;
  }

  const isFiltering = searchTerm.length > 0;
  const displayList = isFiltering 
    ? localList.filter(item => {
        if (activeTab === 'teams') return (item as Team).name.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeTab === 'drivers') return (item as Driver).lastName.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeTab === 'calendar') return (item as Race).country.toLowerCase().includes(searchTerm.toLowerCase());
        return true;
    }) 
    : localList;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-red-600">
                          <div className="bg-red-100 p-2 rounded-full mr-3">
                              <AlertTriangle size={24} />
                          </div>
                          <h3 className="font-bold text-lg">Eintrag löschen?</h3>
                      </div>
                      <button onClick={() => setItemToDelete(null)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <p className="text-slate-600 mb-6 leading-relaxed">
                      Bist du sicher, dass du <strong>{itemToDelete.name}</strong> unwiderruflich löschen möchtest? 
                      {itemToDelete.type === 'team' && " Dies entfernt auch die Verknüpfung zu den Fahrern."}
                  </p>
                  
                  <div className="flex space-x-3 justify-end">
                      <button 
                          onClick={() => setItemToDelete(null)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 font-bold uppercase text-xs rounded hover:bg-slate-200 transition-colors"
                      >
                          Abbrechen
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="px-4 py-2 bg-red-600 text-white font-bold uppercase text-xs rounded hover:bg-red-700 transition-colors shadow-sm flex items-center"
                      >
                          <Trash2 size={14} className="mr-2" /> Löschen
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="bg-white text-slate-900 px-6 py-4 flex justify-between items-center shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
            <LayoutDashboard size={24} className="text-f1-pink" />
            <h1 className="font-display text-2xl font-bold tracking-wide">CMS Dashboard</h1>
        </div>
        <button onClick={onExit} className="text-sm font-bold uppercase hover:text-f1-pink transition-colors text-slate-500">
            Exit to Site
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        <div className="flex space-x-2 mb-8 border-b border-slate-200 overflow-x-auto">
            <button onClick={() => { setActiveTab('articles'); setSearchTerm(''); }} className={`px-4 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'articles' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <FileText size={16} /> <span className="hidden md:inline">Articles</span>
            </button>
            <button onClick={() => { setActiveTab('teams'); setSearchTerm(''); }} className={`px-4 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'teams' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Users size={16} /> <span className="hidden md:inline">Teams</span>
            </button>
            <button onClick={() => { setActiveTab('drivers'); setSearchTerm(''); }} className={`px-4 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'drivers' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <UserIcon size={16} /> <span className="hidden md:inline">Drivers</span>
            </button>
            <button onClick={() => { setActiveTab('calendar'); setSearchTerm(''); }} className={`px-4 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'calendar' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Calendar size={16} /> <span className="hidden md:inline">Calendar</span>
            </button>
             <button onClick={() => setActiveTab('results')} className={`px-4 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'results' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Trophy size={16} /> <span className="hidden md:inline">Results</span>
            </button>
            <button onClick={() => setActiveTab('prediction')} className={`px-4 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'prediction' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <BrainCircuit size={16} /> <span className="hidden md:inline">Tippspiel</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Shield size={16} /> <span className="hidden md:inline">Users</span>
            </button>
            <button onClick={() => setActiveTab('media')} className={`px-4 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'media' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <ImageIcon size={16} /> <span className="hidden md:inline">Media</span>
            </button>
            <button onClick={() => setActiveTab('system')} className={`px-4 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'system' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <SettingsIcon size={16} /> <span className="hidden md:inline">System</span>
            </button>
        </div>

        {activeTab === 'system' ? (
            <div className="mb-8">
                <SystemSettings />
            </div>
        ) : activeTab === 'users' ? (
             <div className="mb-8">
                 <UserManagement />
             </div>
        ) : activeTab === 'prediction' ? (
            <div className="mb-8">
                <PredictionManager />
            </div>
        ) : activeTab === 'media' ? (
            <div className="mb-8">
                <MediaLibrary />
            </div>
        ) : (
            <>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab}...`} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-f1-pink focus:ring-1 focus:ring-f1-pink shadow-sm bg-white"
                        />
                    </div>
                    {activeTab !== 'results' && (
                        <button 
                            onClick={() => { setIsCreating(true); }}
                            className="bg-f1-pink text-white px-6 py-2 rounded-lg font-bold uppercase tracking-wider flex items-center shadow-glow hover:bg-pink-700 transition-colors"
                        >
                            <Plus size={18} className="mr-2" />
                            Add New
                        </button>
                    )}
                </div>

                {isFiltering && (activeTab === 'teams' || activeTab === 'drivers' || activeTab === 'calendar') && (
                    <div className="bg-yellow-50 text-yellow-800 text-xs font-bold p-2 rounded mb-4 text-center">
                        Sorting is disabled while searching. Clear search to reorder.
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            {activeTab === 'articles' && (
                                <tr>
                                    <th className="p-4">Article</th>
                                    <th className="p-4 w-48">Author</th>
                                    <th className="p-4 w-32">Status</th>
                                    <th className="p-4">Sections (Quick Edit)</th>
                                    <th className="p-4 w-32">Date</th>
                                    <th className="p-4 text-right w-24">Actions</th>
                                </tr>
                            )}
                            {activeTab === 'teams' && (
                                <tr>
                                    <th className="p-4 w-16">Order</th>
                                    <th className="p-4 w-12">Logo</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Nationalität</th>
                                    <th className="p-4">Color</th>
                                    <th className="p-4">Base</th>
                                    <th className="p-4">Principal</th>
                                    <th className="p-4">Chassis</th>
                                    <th className="p-4">Power Unit</th>
                                    <th className="p-4">Slug</th>
                                    <th className="p-4">Points</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            )}
                            {activeTab === 'drivers' && (
                                <tr>
                                    <th className="p-4 w-16">Order</th>
                                    <th className="p-4 w-12">Bild</th>
                                    <th className="p-4 w-12">No.</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Nat.</th>
                                    <th className="p-4">Team</th>
                                    <th className="p-4">D.O.B.</th>
                                    <th className="p-4">Birthplace</th>
                                    <th className="p-4">H/W</th>
                                    <th className="p-4">Slug</th>
                                    <th className="p-4">Points</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            )}
                            {activeTab === 'calendar' && (
                                <tr><th className="p-4 w-16">Round</th><th className="p-4">Grand Prix</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
                            )}
                            {activeTab === 'results' && (
                                <tr><th className="p-4">Round</th><th className="p-4">Grand Prix</th><th className="p-4">Format</th><th className="p-4 text-right">Manage Results</th></tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                            
                            {activeTab === 'articles' && posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(post => {
                                const currentAuthorId = post.authorId || eligibleAuthors.find(u => getAuthorName(u) === post.author)?.id;
                                const postSections = Array.isArray(post.section) ? post.section : [post.section as any];

                                return (
                                <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <img src={post.image} alt="" className="w-10 h-10 rounded-md object-cover" />
                                            <div className="font-bold text-slate-900 line-clamp-1">{post.title}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {editingAuthorPostId === post.id ? (
                                            <div className="relative w-full">
                                                <select 
                                                    className="w-full text-xs border border-f1-pink rounded p-1.5 focus:outline-none bg-white text-slate-900 shadow-sm"
                                                    value={currentAuthorId || ''}
                                                    onChange={(e) => handlePostAuthorChange(post, e.target.value)}
                                                    onBlur={() => setEditingAuthorPostId(null)}
                                                    autoFocus
                                                >
                                                    <option value="" disabled>Select Author...</option>
                                                    {eligibleAuthors.map(u => (
                                                        <option key={u.id} value={u.id}>{getAuthorName(u)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div 
                                                onClick={() => setEditingAuthorPostId(post.id)}
                                                className="text-xs font-medium text-slate-600 cursor-pointer hover:text-f1-pink flex items-center group/author w-full truncate"
                                                title="Click to change author"
                                            >
                                                <span className="truncate">{post.author}</span>
                                                <Edit2 size={10} className="ml-1.5 opacity-0 group-hover/author:opacity-100 transition-opacity text-slate-400 shrink-0" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => togglePostStatus(post)}
                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-f1-pink focus:ring-offset-1 ${
                                                    post.status === 'published' ? 'bg-green-500' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        post.status === 'published' ? 'translate-x-4' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                            <span className={`text-[9px] font-bold uppercase w-8 ${post.status === 'published' ? 'text-green-600' : 'text-slate-400'}`}>
                                                {post.status === 'published' ? 'Live' : 'Draft'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {ALL_SECTIONS.map(s => {
                                                const isActive = postSections.includes(s);
                                                return (
                                                    <button 
                                                        key={s}
                                                        onClick={() => togglePostSection(post, s)}
                                                        className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${isActive ? 'bg-f1-pink text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
                                                        title={`Bereich '${s}' an/aus`}
                                                    >
                                                        {s}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{post.date}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => setEditingPost(post)} className="p-2 text-slate-400 hover:text-f1-pink"><Edit2 size={16} /></button>
                                            <button onClick={() => requestDelete(post.id, 'article', post.title)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}

                            {activeTab === 'teams' && displayList.map((team: Team, index: number) => {
                                const missing = checkTeamIncomplete(team);
                                const isIncomplete = missing.length > 0;
                                return (
                                <tr 
                                    key={team.id} 
                                    className={`hover:bg-slate-50 transition-colors group ${!isFiltering ? 'cursor-move' : ''}`}
                                    draggable={!isFiltering}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    <td className="p-4">
                                        {!isFiltering && (
                                            <div className="flex items-center space-x-2 text-slate-300">
                                                <GripVertical size={14} className="opacity-50 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                                                <div className="flex flex-col">
                                                    <button onClick={() => moveItem(index, 'up')} className="hover:text-f1-pink"><ChevronUp size={10} /></button>
                                                    <button onClick={() => moveItem(index, 'down')} className="hover:text-f1-pink"><ChevronDown size={10} /></button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="w-10 h-10 rounded-md bg-white border border-slate-100 p-1 flex items-center justify-center">
                                            {team.logo ? <img src={team.logo} className="max-w-full max-h-full object-contain" /> : <ImageIcon size={14} className="text-slate-200" />}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <div className="font-black text-slate-900 uppercase flex items-center">
                                                {team.name}
                                                {isIncomplete && (
                                                    <div className="ml-2 group/tip relative">
                                                        <AlertTriangle size={12} className="text-red-500 animate-pulse" />
                                                        <div className="absolute bottom-full left-0 mb-2 bg-slate-900 text-white text-[9px] p-2 rounded shadow-xl hidden group-hover/tip:block z-50 whitespace-nowrap">
                                                            Fehlend: {missing.join(', ')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <img src={getFlagUrl(team.nationalityFlag)} className="w-4 h-auto mr-2 border border-black/20" />
                                            <span className="text-slate-500 font-medium">{team.nationalityText}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full border border-slate-200" style={{backgroundColor: team.color}}></div>
                                            <span className="font-mono text-slate-400">{team.color}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 font-medium">{team.base}</td>
                                    <td className="p-4 text-slate-600">{team.teamPrincipal}</td>
                                    <td className="p-4"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">{team.chassis}</span></td>
                                    <td className="p-4"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">{team.powerUnit}</span></td>
                                    <td className="p-4 text-slate-400 font-mono italic">{team.slug}</td>
                                    <td className="p-4 font-display font-bold text-lg text-slate-900">{team.points}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => setEditingTeam(team)} className="p-2 text-slate-300 hover:text-f1-pink"><Edit2 size={14} /></button>
                                            <button onClick={() => requestDelete(team.id, 'team', team.name)} className="p-2 text-slate-300 hover:text-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}

                            {activeTab === 'drivers' && displayList.map((driver: Driver, index: number) => {
                                const team = teams.find(t => t.id === driver.teamId);
                                const missing = checkDriverIncomplete(driver);
                                const isIncomplete = missing.length > 0;
                                return (
                                    <tr 
                                        key={driver.id} 
                                        className={`hover:bg-slate-50 transition-colors group ${!isFiltering ? 'cursor-move' : ''}`}
                                        draggable={!isFiltering}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index)}
                                    >
                                        <td className="p-4">
                                            {!isFiltering && (
                                                <div className="flex items-center space-x-2 text-slate-300">
                                                    <GripVertical size={14} className="opacity-50 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                                                    <div className="flex flex-col">
                                                        <button onClick={() => moveItem(index, 'up')} className="hover:text-f1-pink"><ChevronUp size={10} /></button>
                                                        <button onClick={() => moveItem(index, 'down')} className="hover:text-f1-pink"><ChevronDown size={10} /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 bg-slate-50">
                                                {driver.image ? <img src={driver.image} className="w-full h-full object-cover" /> : <UserIcon size={14} className="m-auto text-slate-200 mt-3" />}
                                            </div>
                                        </td>
                                        <td className="p-4 font-display font-bold text-2xl text-slate-300 italic">#{driver.raceNumber}</td>
                                        <td className="p-4">
                                            <div className="font-black text-slate-900 uppercase flex items-center">
                                                {driver.firstName} {driver.lastName}
                                                {isIncomplete && (
                                                    <div className="ml-2 group/tip relative">
                                                        <AlertTriangle size={12} className="text-red-500 animate-pulse" />
                                                        <div className="absolute bottom-full left-0 mb-2 bg-slate-900 text-white text-[9px] p-2 rounded shadow-xl hidden group-hover/tip:block z-50 whitespace-nowrap">
                                                            Fehlend: {missing.join(', ')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <img src={getFlagUrl(driver.nationalityFlag)} className="w-5 h-auto border border-black/20" />
                                        </td>
                                        <td className="p-4">
                                            {team ? (
                                                <div className="flex items-center space-x-2">
                                                    <img src={team.logo} className="h-4 w-auto object-contain" />
                                                    <span className="font-bold text-slate-600">{team.name}</span>
                                                </div>
                                            ) : <span className="text-slate-300 italic">Free Agent</span>}
                                        </td>
                                        <td className="p-4 text-slate-500 whitespace-nowrap">{driver.dob}</td>
                                        <td className="p-4 text-slate-500">{driver.birthplace}</td>
                                        <td className="p-4 text-slate-600 font-bold whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{driver.height} cm</span>
                                                <span className="text-slate-400 font-medium">{driver.weight} kg</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-400 font-mono italic">{driver.slug}</td>
                                        <td className="p-4 font-display font-bold text-lg text-slate-900">{driver.points}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => setEditingDriver(driver)} className="p-2 text-slate-300 hover:text-f1-pink"><Edit2 size={14} /></button>
                                                <button onClick={() => requestDelete(driver.id, 'driver', `${driver.firstName} ${driver.lastName}`)} className="p-2 text-slate-300 hover:text-red-600"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {activeTab === 'calendar' && displayList.map((race: Race, index: number) => (
                                <tr 
                                    key={race.id} 
                                    className={`hover:bg-slate-50 transition-colors group ${!isFiltering ? 'cursor-move' : ''}`}
                                    draggable={!isFiltering}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    <td className="p-4 font-display font-bold text-lg text-slate-400">
                                        {!isFiltering ? (
                                            <div className="flex items-center space-x-2 text-slate-400">
                                                <GripVertical size={16} className="opacity-50 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                                                <div className="flex flex-col">
                                                    <button onClick={() => moveItem(index, 'up')} className="hover:text-f1-pink"><ChevronUp size={12} /></button>
                                                    <button onClick={() => moveItem(index, 'down')} className="hover:text-f1-pink"><ChevronDown size={12} /></button>
                                                </div>
                                                <span className="ml-2">#{race.round}</span>
                                            </div>
                                        ) : (
                                            `#${race.round}`
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <img src={getFlagUrl(race.flag)} className="w-8 h-auto border border-black/50" alt="" />
                                            <div>
                                                <div className="font-bold text-slate-900">{race.country}</div>
                                                <div className="text-xs text-slate-500 mb-1">{race.circuitName}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1 rounded">Rd {race.round}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1 rounded">{race.city}</span>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1 rounded ${race.format === 'sprint' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {race.format === 'sprint' ? 'Sprint' : 'Standard'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium">
                                        {new Date(race.sessions?.race || '').toLocaleDateString()}
                                        {race.format === 'sprint' && <span className="ml-2 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-bold uppercase rounded">Sprint</span>}
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            race.status === 'completed' ? 'bg-slate-100 text-slate-500' :
                                            race.status === 'next' ? 'bg-f1-pink text-white' :
                                            race.status === 'live' ? 'bg-red-600 text-white animate-pulse' :
                                            race.status === 'cancelled' ? 'bg-red-100 text-red-600 line-through' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {race.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => setEditingRace(race)} className="p-2 text-slate-400 hover:text-f1-pink"><Edit2 size={16} /></button>
                                            <button onClick={() => requestDelete(race.id, 'race', race.country)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {activeTab === 'results' && races.map(race => (
                                <tr key={race.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4 font-display font-bold text-lg text-slate-400">#{race.round}</td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <img src={getFlagUrl(race.flag)} className="w-8 h-auto border border-black/50" alt="" />
                                            <div>
                                                <div className="font-bold text-slate-900">{race.country}</div>
                                                <div className="text-xs text-slate-500 mb-1">{race.circuitName}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1 rounded">Rd {race.round}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1 rounded">{race.city}</span>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1 rounded ${race.format === 'sprint' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {race.format === 'sprint' ? 'Sprint' : 'Standard'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {race.format === 'sprint' ? (
                                            <span className="px-2 py-1 bg-orange-100 text-orange-600 text-[9px] font-bold uppercase rounded">Sprint Format</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase rounded">Standard</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => setEditingSession(race)}
                                            className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-f1-pink transition-colors flex items-center ml-auto"
                                        >
                                            <BarChart2 size={14} className="mr-2" /> Enter Results
                                        </button>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
