
import React, { useState } from 'react';
import { Team, MediaItem } from '../../types';
import { Save, X, Trash2, Plus, Image as ImageIcon, Facebook, Twitter, Instagram, Video, Flag } from 'lucide-react';
import { COUNTRIES, getFlagUrl } from '../../constants';
import MediaLibrary from './MediaLibrary';

interface TeamEditorProps {
    team?: Team;
    onSave: (team: Team) => void;
    onCancel: () => void;
}

const TeamEditor: React.FC<TeamEditorProps> = ({ team, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Team>>(team || {
        name: '', slug: '', color: '#000000', logo: '', carImage: '',
        nationalityFlag: 'gb', nationalityText: 'United Kingdom', entryYear: new Date().getFullYear(),
        teamPrincipal: '', base: '', chassis: '', powerUnit: '',
        socials: {}, bio: '', gallery: [], points: 0, rank: 99, trend: 'same'
    });

    // Media Picker State
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<{ field: keyof Team | 'gallery', index?: number } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFlagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = COUNTRIES.find(c => c.code === e.target.value);
        setFormData(prev => ({ 
            ...prev, 
            nationalityFlag: selected?.code || '',
            nationalityText: selected?.name || ''
        }));
    };

    const handleSocialChange = (network: 'facebook' | 'twitter' | 'instagram' | 'tiktok', value: string) => {
        setFormData(prev => ({
            ...prev,
            socials: { ...prev.socials, [network]: value }
        }));
    };

    // Media Handling
    const openMediaPicker = (field: keyof Team | 'gallery') => {
        setMediaPickerTarget({ field });
        setMediaPickerOpen(true);
    };

    const handleMediaSelect = (item: MediaItem) => {
        if (!mediaPickerTarget) return;

        if (mediaPickerTarget.field === 'gallery') {
            setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), item.url] }));
        } else {
            setFormData(prev => ({ ...prev, [mediaPickerTarget.field]: item.url }));
        }
        setMediaPickerOpen(false);
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalTeam: Team = {
            id: team?.id || Date.now().toString(),
            name: formData.name!,
            slug: formData.slug || formData.name!.toLowerCase().replace(/ /g, '-'),
            color: formData.color!,
            logo: formData.logo || '',
            carImage: formData.carImage || '',
            nationalityFlag: formData.nationalityFlag || 'un',
            nationalityText: formData.nationalityText || '',
            entryYear: Number(formData.entryYear),
            teamPrincipal: formData.teamPrincipal || '',
            base: formData.base || '',
            chassis: formData.chassis || '',
            powerUnit: formData.powerUnit || '',
            socials: formData.socials || {},
            bio: formData.bio || '',
            gallery: formData.gallery || [],
            // Keep stats from existing object if available, otherwise defaults (they are recalculated anyway)
            points: team?.points || 0,
            rank: team?.rank || 99,
            trend: team?.trend || 'same',
            // Preserve order
            order: team?.order
        };
        onSave(finalTeam);
    };

    const inputClass = "w-full border border-slate-300 bg-white text-slate-900 p-2 rounded focus:outline-none focus:ring-1 focus:ring-f1-pink focus:border-f1-pink";

    return (
        <div className="fixed inset-0 bg-white z-[60] overflow-y-auto">
            {/* Modal for Media Picker */}
            {mediaPickerOpen && (
                <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        <MediaLibrary 
                            onSelect={handleMediaSelect} 
                            onClose={() => setMediaPickerOpen(false)}
                            selectLabel="Bild verwenden"
                        />
                    </div>
                </div>
            )}

            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-display font-bold text-slate-900">{team ? 'Edit Team' : 'New Team'}</h2>
                    <div className="flex space-x-2">
                        <button onClick={onCancel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                        <button onClick={handleSubmit} className="px-6 py-2 bg-f1-pink text-white rounded font-bold uppercase hover:bg-pink-700 flex items-center shadow-sm">
                            <Save size={16} className="mr-2" /> Save
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* Visual Identity Section (Top) */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                        <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-200 pb-2 mb-4">Visual Assets</h3>
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Logo Picker */}
                            <div className="flex-1">
                                <label className="block text-xs font-bold mb-2 text-slate-700">Team Logo</label>
                                <div className="flex items-start space-x-4">
                                    <div className="w-24 h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 p-2">
                                        {formData.logo ? (
                                            <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <ImageIcon className="text-slate-300" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <button type="button" onClick={() => openMediaPicker('logo')} className="text-xs bg-white border border-slate-300 hover:border-f1-pink hover:text-f1-pink px-3 py-2 rounded font-bold text-slate-600 transition-colors mb-1">
                                            Change Logo
                                        </button>
                                        <p className="text-[10px] text-slate-400 leading-tight">Official vector or PNG logo.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Car Picker */}
                            <div className="flex-1">
                                <label className="block text-xs font-bold mb-2 text-slate-700">Car Image</label>
                                <div className="flex items-start space-x-4">
                                    <div className="w-40 h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 p-1">
                                        {formData.carImage ? (
                                            <img src={formData.carImage} alt="Car" className="w-full h-full object-contain" />
                                        ) : (
                                            <ImageIcon className="text-slate-300" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <button type="button" onClick={() => openMediaPicker('carImage')} className="text-xs bg-white border border-slate-300 hover:border-f1-pink hover:text-f1-pink px-3 py-2 rounded font-bold text-slate-600 transition-colors mb-1">
                                            Change Car
                                        </button>
                                        <p className="text-[10px] text-slate-400 leading-tight">Side profile or 3/4 view.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-100 pb-2">Identity</h3>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">Team Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">Slug (URL)</label>
                                <input name="slug" value={formData.slug} onChange={handleChange} className={inputClass} />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Team Color</label>
                                    <div className="flex items-center space-x-2">
                                        <input type="color" name="color" value={formData.color} onChange={handleChange} className="h-10 w-20 border border-slate-300 rounded cursor-pointer bg-white p-1" />
                                        <span className="text-xs text-slate-500">{formData.color}</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Entry Year</label>
                                    <input type="number" name="entryYear" value={formData.entryYear} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Technical & Personnel */}
                        <div className="space-y-4">
                            <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-100 pb-2">Details</h3>
                            
                            {/* Country Selector */}
                            <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">Nationality</label>
                                <div className="relative">
                                    {formData.nationalityFlag && (
                                        <div className="absolute left-3 top-2.5 z-10 pointer-events-none">
                                            <img 
                                                src={getFlagUrl(formData.nationalityFlag)} 
                                                className="w-5 h-auto border border-black/50" 
                                                alt="" 
                                            />
                                        </div>
                                    )}
                                    <select 
                                        name="nationalityFlag" 
                                        value={formData.nationalityFlag} 
                                        onChange={handleFlagChange} 
                                        className={`${inputClass} pl-10`}
                                    >
                                        {COUNTRIES.map(c => (
                                            <option key={c.code} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">Team Principal</label>
                                <input name="teamPrincipal" value={formData.teamPrincipal} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">Base Location</label>
                                <input name="base" value={formData.base} onChange={handleChange} className={inputClass} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Chassis</label>
                                    <input name="chassis" value={formData.chassis} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Power Unit</label>
                                    <input name="powerUnit" value={formData.powerUnit} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="space-y-4">
                            <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-100 pb-2">Social Media</h3>
                            <div className="space-y-3">
                                <div className="relative">
                                    <Facebook size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input placeholder="Facebook" value={formData.socials?.facebook || ''} onChange={e => handleSocialChange('facebook', e.target.value)} className={`${inputClass} pl-10`} />
                                </div>
                                <div className="relative">
                                    <Twitter size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input placeholder="Twitter / X" value={formData.socials?.twitter || ''} onChange={e => handleSocialChange('twitter', e.target.value)} className={`${inputClass} pl-10`} />
                                </div>
                                <div className="relative">
                                    <Instagram size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input placeholder="Instagram" value={formData.socials?.instagram || ''} onChange={e => handleSocialChange('instagram', e.target.value)} className={`${inputClass} pl-10`} />
                                </div>
                                <div className="relative">
                                    <Video size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input placeholder="TikTok" value={formData.socials?.tiktok || ''} onChange={e => handleSocialChange('tiktok', e.target.value)} className={`${inputClass} pl-10`} />
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="md:col-span-2 space-y-2">
                            <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-100 pb-2">Biography</h3>
                            <textarea name="bio" value={formData.bio} onChange={handleChange} className={`${inputClass} h-40`} maxLength={1500} placeholder="Markdown supported..." />
                            <div className="text-right text-xs text-slate-400">{formData.bio?.length || 0}/1500</div>
                        </div>

                        {/* Gallery Visual Editor */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider">Gallery</h3>
                                <button type="button" onClick={() => openMediaPicker('gallery')} className="text-xs font-bold text-f1-pink hover:bg-f1-pink/10 px-2 py-1 rounded flex items-center">
                                    <Plus size={14} className="mr-1" /> Add Image
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                {formData.gallery?.map((url, idx) => (
                                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button 
                                            type="button" 
                                            onClick={() => removeGalleryImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => openMediaPicker('gallery')} className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-f1-pink hover:text-f1-pink transition-colors">
                                    <ImageIcon size={24} className="mb-2" />
                                    <span className="text-xs font-bold">Add</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamEditor;
