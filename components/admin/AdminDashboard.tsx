
import React, { useState, useEffect } from 'react';
import { usePosts } from '../../contexts/PostContext';
import { useData } from '../../contexts/DataContext';
import { Post, Team, Driver, Race } from '../../types';
import PostEditor from './PostEditor';
import TeamEditor from './TeamEditor';
import DriverEditor from './DriverEditor';
import RaceEditor from './RaceEditor';
import SessionEditor from './SessionEditor';
import UserManagement from './UserManagement';
import PredictionManager from './PredictionManager'; 
import MediaLibrary from './MediaLibrary'; 
import { Plus, Edit2, Trash2, Search, LayoutDashboard, Flag, User, Users, FileText, Calendar, Trophy, BarChart2, Shield, BrainCircuit, Image as ImageIcon, GripVertical, ChevronUp, ChevronDown, AlertTriangle, X } from 'lucide-react';
import { getFlagUrl } from '../../constants';

interface AdminDashboardProps {
  onExit: () => void;
}

type TabType = 'articles' | 'teams' | 'drivers' | 'calendar' | 'results' | 'users' | 'prediction' | 'media';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const { posts, addPost, updatePost, deletePost } = usePosts();
  const { teams, drivers, races, addTeam, updateTeam, deleteTeam, addDriver, updateDriver, deleteDriver, addRace, updateRace, deleteRace, reorderEntities } = useData();
  
  const [activeTab, setActiveTab] = useState<TabType>('articles');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor States
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [editingSession, setEditingSession] = useState<Race | null>(null); // For results
  const [isCreating, setIsCreating] = useState(false);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'article' | 'team' | 'driver' | 'race', name: string} | null>(null);

  // Sorting State
  const [localList, setLocalList] = useState<any[]>([]); // For immediate drag feedback

  // Sync local list when data changes or tab changes
  useEffect(() => {
      if (activeTab === 'teams') setLocalList(teams);
      else if (activeTab === 'drivers') setLocalList(drivers);
      else if (activeTab === 'calendar') setLocalList(races);
      else setLocalList([]); // Reset for other tabs
  }, [activeTab, teams, drivers, races]);

  // --- Handlers ---
  const handleSavePost = async (post: Post) => {
    try {
        if (isCreating) {
            await addPost(post);
        } else {
            await updatePost(post);
        }
        closeEditor();
    } catch (e) {
        alert('Fehler beim Speichern des Artikels.');
        console.error(e);
    }
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
      e.preventDefault(); // Necessary to allow dropping
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

  // Filter local list for display (only for searching, reorder works on full list, so disable reorder when searching)
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
      
      {/* Delete Confirmation Modal */}
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

      {/* Admin Header - Light Theme */}
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
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-slate-200 overflow-x-auto">
            <button onClick={() => { setActiveTab('articles'); setSearchTerm(''); }} className={`px-6 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'articles' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <FileText size={16} /> <span>Articles</span>
            </button>
            <button onClick={() => { setActiveTab('teams'); setSearchTerm(''); }} className={`px-6 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'teams' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Users size={16} /> <span>Teams</span>
            </button>
            <button onClick={() => { setActiveTab('drivers'); setSearchTerm(''); }} className={`px-6 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'drivers' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <User size={16} /> <span>Drivers</span>
            </button>
            <button onClick={() => { setActiveTab('calendar'); setSearchTerm(''); }} className={`px-6 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'calendar' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Calendar size={16} /> <span>Calendar</span>
            </button>
             <button onClick={() => setActiveTab('results')} className={`px-6 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'results' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Trophy size={16} /> <span>Results</span>
            </button>
            <button onClick={() => setActiveTab('prediction')} className={`px-6 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'prediction' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <BrainCircuit size={16} /> <span>Tippspiel</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Shield size={16} /> <span>Users</span>
            </button>
            <button onClick={() => setActiveTab('media')} className={`px-6 py-3 font-bold uppercase text-sm flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'media' ? 'border-f1-pink text-f1-pink' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <ImageIcon size={16} /> <span>Media</span>
            </button>
        </div>

        {/* --- Content Areas --- */}

        {activeTab === 'users' ? (
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

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                            {activeTab === 'articles' && (
                                <tr><th className="p-4">Article</th><th className="p-4">Section</th><th className="p-4">Date</th><th className="p-4 text-right">Actions</th></tr>
                            )}
                            {/* Sortable Headers */}
                            {activeTab === 'teams' && (
                                <tr><th className="p-4 w-16">Order</th><th className="p-4">Team</th><th className="p-4">Principal</th><th className="p-4">Points</th><th className="p-4 text-right">Actions</th></tr>
                            )}
                            {activeTab === 'drivers' && (
                                <tr><th className="p-4 w-16">Order</th><th className="p-4">Driver</th><th className="p-4">Team</th><th className="p-4">Points</th><th className="p-4 text-right">Actions</th></tr>
                            )}
                            {activeTab === 'calendar' && (
                                <tr><th className="p-4 w-16">Round</th><th className="p-4">Grand Prix</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
                            )}
                            {activeTab === 'results' && (
                                <tr><th className="p-4">Round</th><th className="p-4">Grand Prix</th><th className="p-4">Format</th><th className="p-4 text-right">Manage Results</th></tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            
                            {/* ARTICLES */}
                            {activeTab === 'articles' && posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(post => (
                                <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <img src={post.image} alt="" className="w-10 h-10 rounded-md object-cover" />
                                            <div className="font-bold text-slate-900 line-clamp-1">{post.title}</div>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase">{post.section}</span></td>
                                    <td className="p-4 text-sm text-slate-600">{post.date}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => setEditingPost(post)} className="p-2 text-slate-400 hover:text-f1-pink"><Edit2 size={16} /></button>
                                            <button onClick={() => requestDelete(post.id, 'article', post.title)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* TEAMS */}
                            {activeTab === 'teams' && displayList.map((team: Team, index: number) => (
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
                                            <div className="flex items-center space-x-2 text-slate-400">
                                                <GripVertical size={16} className="opacity-50 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                                                <div className="flex flex-col">
                                                    <button onClick={() => moveItem(index, 'up')} className="hover:text-f1-pink"><ChevronUp size={12} /></button>
                                                    <button onClick={() => moveItem(index, 'down')} className="hover:text-f1-pink"><ChevronDown size={12} /></button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center p-1 bg-white border border-slate-200">
                                                <img src={team.logo} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{team.name}</div>
                                                <div className="text-xs text-slate-500">{team.base}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">{team.teamPrincipal}</td>
                                    <td className="p-4 font-bold font-display text-lg">{team.points}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => setEditingTeam(team)} className="p-2 text-slate-400 hover:text-f1-pink"><Edit2 size={16} /></button>
                                            <button onClick={() => requestDelete(team.id, 'team', team.name)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* DRIVERS */}
                            {activeTab === 'drivers' && displayList.map((driver: Driver, index: number) => {
                                const team = teams.find(t => t.id === driver.teamId);
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
                                                <div className="flex items-center space-x-2 text-slate-400">
                                                    <GripVertical size={16} className="opacity-50 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                                                    <div className="flex flex-col">
                                                        <button onClick={() => moveItem(index, 'up')} className="hover:text-f1-pink"><ChevronUp size={12} /></button>
                                                        <button onClick={() => moveItem(index, 'down')} className="hover:text-f1-pink"><ChevronDown size={12} /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-4">
                                                <img src={driver.image} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                                                <div>
                                                    <div className="font-bold text-slate-900">{driver.firstName} {driver.lastName}</div>
                                                    <div className="text-xs text-slate-500 flex items-center">
                                                        <img src={getFlagUrl(driver.nationalityFlag)} alt="" className="h-3 w-auto border border-black/50 mr-1" />
                                                        #{driver.raceNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {team ? (
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: team.color}}></div>
                                                    {team.name}
                                                </div>
                                            ) : <span className="text-slate-400 italic">Free Agent</span>}
                                        </td>
                                        <td className="p-4 font-bold font-display text-lg">{driver.points}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => setEditingDriver(driver)} className="p-2 text-slate-400 hover:text-f1-pink"><Edit2 size={16} /></button>
                                                <button onClick={() => requestDelete(driver.id, 'driver', `${driver.firstName} ${driver.lastName}`)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* RACES */}
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
                                                <div className="text-xs text-slate-500">{race.circuitName}</div>
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

                            {/* RESULTS (No sorting needed) */}
                            {activeTab === 'results' && races.map(race => (
                                <tr key={race.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4 font-display font-bold text-lg text-slate-400">#{race.round}</td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <img src={getFlagUrl(race.flag)} className="w-8 h-auto border border-black/50" alt="" />
                                            <div>
                                                <div className="font-bold text-slate-900">{race.country}</div>
                                                <div className="text-xs text-slate-500">{race.circuitName}</div>
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
