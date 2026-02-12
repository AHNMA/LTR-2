
import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { User, Shield, Key, Trash2, Save, Camera, Mail, Globe, Facebook, Twitter, Instagram, Youtube, Video } from 'lucide-react';

const UserProfilePage: React.FC = () => {
    const { currentUser, updateUserProfile, deleteUser, logout } = useAuth();
    const { goToHome } = useNavigation();
    
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Edit States
    const [formData, setFormData] = useState({
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        username: currentUser?.username || '',
        website: currentUser?.website || '',
        bio: currentUser?.bio || '',
        avatar: currentUser?.avatar || '',
        socials: { ...currentUser?.socials }
    });

    if (!currentUser) {
        goToHome();
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (network: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socials: { ...prev.socials, [network]: value }
        }));
    };

    // Handle File Upload via FileReader
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSave = () => {
        updateUserProfile(currentUser.id, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            website: formData.website,
            bio: formData.bio,
            avatar: formData.avatar,
            socials: formData.socials
        });
        alert('Profil aktualisiert!');
    };

    const handleDeleteAccount = () => {
        if (confirm('Sind Sie sicher? Dieser Vorgang kann nicht rückgängig gemacht werden.')) {
            deleteUser(currentUser.id);
            goToHome();
        }
    };

    const inputClasses = "w-full bg-white border border-slate-300 text-slate-900 p-2.5 rounded-lg text-sm focus:border-f1-pink focus:ring-1 focus:ring-f1-pink focus:outline-none placeholder-slate-400";

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-8">
            <div className="container mx-auto px-4 max-w-4xl">
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    {/* Header / Cover */}
                    <div className="h-32 bg-slate-900 relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="absolute bottom-4 right-4 text-white/20 text-xs font-mono">User ID: {currentUser.id}</div>
                    </div>
                    
                    <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-12">
                        <div className="relative group cursor-pointer shrink-0" onClick={triggerFileInput}>
                            <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-md relative">
                                <img src={formData.avatar || `https://ui-avatars.com/api/?name=${currentUser.username}`} alt="Avatar" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                            <h1 className="text-2xl font-bold text-slate-900 mb-1">{formData.username || currentUser.username}</h1>
                            <div className="flex items-center space-x-2 text-sm text-slate-500">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    currentUser.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                    currentUser.role === 'editor' ? 'bg-f1-pink/10 text-f1-pink' : 
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    {currentUser.role}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex space-x-2">
                             <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>Profil</button>
                             <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'security' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>Sicherheit</button>
                        </div>
                    </div>
                </div>

                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 gap-8">
                        {/* Editable Data - No duplication of ID/Email/Role here */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider mb-6 border-b border-slate-100 pb-2">Persönliche Daten</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Vorname</label>
                                    <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Nachname</label>
                                    <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputClasses} />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold mb-1 text-slate-700">Anzeigename (Nutzername)</label>
                                <input name="username" value={formData.username} onChange={handleChange} className={inputClasses} />
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold mb-1 text-slate-700">Website</label>
                                <div className="flex items-center">
                                    <div className="absolute pl-3 pointer-events-none text-slate-400">
                                        <Globe size={16} />
                                    </div>
                                    <input name="website" value={formData.website} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="https://..." />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold mb-1 text-slate-700">Biographie</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} className={`${inputClasses} h-32 resize-none`} />
                            </div>

                            <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider mb-4 border-b border-slate-100 pb-2">Social Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Facebook size={16} />
                                        </div>
                                        <input value={formData.socials.facebook || ''} onChange={(e) => handleSocialChange('facebook', e.target.value)} className={`${inputClasses} pl-10`} placeholder="Facebook URL" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Twitter size={16} />
                                        </div>
                                        <input value={formData.socials.twitter || ''} onChange={(e) => handleSocialChange('twitter', e.target.value)} className={`${inputClasses} pl-10`} placeholder="Twitter URL" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Instagram size={16} />
                                        </div>
                                        <input value={formData.socials.instagram || ''} onChange={(e) => handleSocialChange('instagram', e.target.value)} className={`${inputClasses} pl-10`} placeholder="Instagram URL" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Video size={16} />
                                        </div>
                                        <input value={formData.socials.tiktok || ''} onChange={(e) => handleSocialChange('tiktok', e.target.value)} className={`${inputClasses} pl-10`} placeholder="TikTok URL" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Youtube size={16} />
                                        </div>
                                        <input value={formData.socials.youtube || ''} onChange={(e) => handleSocialChange('youtube', e.target.value)} className={`${inputClasses} pl-10`} placeholder="YouTube URL" />
                                    </div>
                            </div>

                            <div className="flex justify-end">
                                <button onClick={handleSave} className="bg-f1-pink text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-wide flex items-center shadow-glow hover:bg-pink-700 transition-all">
                                    <Save size={16} className="mr-2" /> Speichern
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center">
                                <Shield className="mr-2 text-f1-pink" size={20} /> Sicherheitscenter
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">Account Identifikation (ID)</div>
                                        <div className="text-xs text-slate-500 font-mono mt-1 bg-white inline-block px-2 py-0.5 rounded border border-slate-200">{currentUser.id}</div>
                                    </div>
                                    <div className="text-xs text-slate-400 italic">Nicht änderbar</div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">Email Adresse</div>
                                        <div className="text-xs text-slate-500 mt-1">{currentUser.email}</div>
                                    </div>
                                    <button className="text-xs font-bold uppercase text-slate-600 hover:text-f1-pink border border-slate-300 px-3 py-1.5 rounded transition-colors bg-white">Ändern</button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">Passwort</div>
                                        <div className="text-xs text-slate-500 mt-1">Zuletzt geändert: Unbekannt</div>
                                    </div>
                                    <button className="text-xs font-bold uppercase text-slate-600 hover:text-f1-pink border border-slate-300 px-3 py-1.5 rounded transition-colors bg-white">Reset Link</button>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">Personenbezogene Daten</div>
                                        <div className="text-xs text-slate-500 mt-1">DSGVO Export anfordern</div>
                                    </div>
                                    <button className="text-xs font-bold uppercase text-slate-600 hover:text-f1-pink border border-slate-300 px-3 py-1.5 rounded transition-colors bg-white">Anfordern</button>
                                </div>
                            </div>
                         </div>

                         <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                            <h3 className="font-bold text-red-700 text-sm uppercase mb-2">Gefahrenzone</h3>
                            <p className="text-xs text-red-600 mb-4">
                                Wenn Sie Ihren Account löschen, werden alle persönlichen Daten dauerhaft entfernt. 
                                Dieser Schritt kann nicht rückgängig gemacht werden.
                            </p>
                            <button onClick={handleDeleteAccount} className="bg-red-600 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-red-700 flex items-center transition-colors shadow-sm">
                                <Trash2 size={14} className="mr-2" /> Profil endgültig löschen
                            </button>
                         </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default UserProfilePage;
