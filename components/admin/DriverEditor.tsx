

import React, { useState } from 'react';
import { Driver, MediaItem } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Save, Image as ImageIcon, Flag, Facebook, Twitter, Instagram, Video, Plus, X } from 'lucide-react';
import { COUNTRIES, getFlagUrl } from '../../constants';
import MediaLibrary from './MediaLibrary';

interface DriverEditorProps {
    driver?: Driver;
    onSave: (driver: Driver) => void;
    onCancel: () => void;
}

const DriverEditor: React.FC<DriverEditorProps> = ({ driver, onSave, onCancel }) => {
    const { teams } = useData();
    const [formData, setFormData] = useState<Partial<Driver>>(driver || {
        firstName: '', lastName: '', raceNumber: 0, teamId: '', slug: '',
        image: '', nationalityFlag: 'gb', nationalityText: 'United Kingdom',
        dob: '', birthplace: '', height: 175, weight: 70, maritalStatus: '',
        socials: {}, bio: '', gallery: [], rank: 99, points: 0, trend: 'same'
    });

    // Media Picker State
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState<{ field: keyof Driver | 'gallery', index?: number } | null>(null);

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
    const openMediaPicker = (field: keyof Driver | 'gallery') => {
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
        const finalDriver: Driver = {
            id: driver?.id || Date.now().toString(),
            firstName: formData.firstName!,
            lastName: formData.lastName!,
            slug: formData.slug || `${formData.firstName}-${formData.lastName}`.toLowerCase(),
            raceNumber: Number(formData.raceNumber),
            teamId: formData.teamId || null,
            image: formData.image || '',
            nationalityFlag: formData.nationalityFlag || 'un',
            nationalityText: formData.nationalityText || '',
            dob: formData.dob!,
            birthplace: formData.birthplace || '',
            height: Number(formData.height),
            weight: Number(formData.weight),
            maritalStatus: formData.maritalStatus || '',
            socials: formData.socials || {},
            bio: formData.bio || '',
            gallery: formData.gallery || [],
            // Keep existing stats or default
            rank: driver?.rank || 99,
            points: driver?.points || 0,
            trend: driver?.trend || 'same',
            // Preserve order
            order: driver?.order
        };
        onSave(finalDriver);
    };

    // Calculate Age helper
    const calculateAge = (dob: string) => {
        if (!dob) return '';
        const ageDifMs = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

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
                    <h2 className="text-2xl font-display font-bold text-slate-900">{driver ? 'Edit Driver' : 'New Driver'}</h2>
                    <div className="flex space-x-2">
                        <button onClick={onCancel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                        <button onClick={handleSubmit} className="px-6 py-2 bg-f1-pink text-white rounded font-bold uppercase hover:bg-pink-700 flex items-center shadow-sm">
                            <Save size={16} className="mr-2" /> Save
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* Portrait Section (Top) */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                        <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-200 pb-2 mb-4">Driver Profile</h3>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div>
                                <label className="block text-xs font-bold mb-2 text-slate-700">Driver Portrait</label>
                                <div className="flex items-start space-x-4">
                                    <div className="w-24 h-24 bg-white border border-slate-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Portrait" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-slate-300" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <button type="button" onClick={() => openMediaPicker('image')} className="text-xs bg-white border border-slate-300 hover:border-f1-pink hover:text-f1-pink px-3 py-2 rounded font-bold text-slate-600 transition-colors mb-1">
                                            Change Image
                                        </button>
                                        <p className="text-[10px] text-slate-400 leading-tight max-w-[200px]">Official headshot. Transparent background preferred.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">First Name</label>
                                    <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Last Name</label>
                                    <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Race Number</label>
                                    <input type="number" name="raceNumber" value={formData.raceNumber} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Team</label>
                                    <select name="teamId" value={formData.teamId || ''} onChange={handleChange} className={inputClass}>
                                        <option value="">-- No Team / Free Agent --</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Personal Data */}
                        <div className="space-y-4">
                            <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-100 pb-2">Personal Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Date of Birth</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} required />
                                    {formData.dob && <span className="text-xs text-slate-400">Age: {calculateAge(formData.dob)}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Birthplace</label>
                                    <input name="birthplace" value={formData.birthplace} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">Slug (URL)</label>
                                <input name="slug" value={formData.slug} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>

                        {/* Physical & Origins */}
                        <div className="space-y-4">
                             <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-100 pb-2">Physical Attributes</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Height (cm)</label>
                                    <input type="number" name="height" value={formData.height} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Weight (kg)</label>
                                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className={inputClass} />
                                </div>
                             </div>
                             
                             {/* Country Selector */}
                             <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">Nationality</label>
                                <div className="relative">
                                    {formData.nationalityFlag && (
                                        <div className="absolute left-3 top-2.5 z-10 pointer-events-none">
                                            {getFlagUrl(formData.nationalityFlag) && (
                                                <img 
                                                    src={getFlagUrl(formData.nationalityFlag)} 
                                                    className="w-5 h-auto border border-black/50" 
                                                    alt="" 
                                                />
                                            )}
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

                        {/* Bio & Gallery */}
                         <div className="md:col-span-2 space-y-4">
                            <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-100 pb-2">Biography</h3>
                            <textarea name="bio" value={formData.bio} onChange={handleChange} className={`${inputClass} h-40`} maxLength={1500} placeholder="Markdown supported..." />
                            
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2 pt-4">
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

export default DriverEditor;