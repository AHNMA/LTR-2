
import React, { useState } from 'react';
import { Race, RaceFormat, RaceStatus, MediaItem } from '../../types';
import { Save, Calendar, Image as ImageIcon, Flag } from 'lucide-react';
import { COUNTRIES, getFlagUrl } from '../../constants';
import MediaLibrary from './MediaLibrary';

interface RaceEditorProps {
    race?: Race;
    onSave: (race: Race) => void;
    onCancel: () => void;
}

const RaceEditor: React.FC<RaceEditorProps> = ({ race, onSave, onCancel }) => {
    // Helper to get formatted date string for input type="datetime-local"
    const getSafeDate = (isoString?: string) => isoString ? isoString : '';

    const [formData, setFormData] = useState<Partial<Race>>(race || {
        round: 1,
        country: '',
        city: '',
        circuitName: '',
        flag: 'bh', // Default to first race usually
        format: 'standard',
        status: 'upcoming',
        trackMap: '',
        sessions: {
            fp1: '', fp2: '', fp3: '', qualifying: '', race: '', sprint: '', sprintQuali: ''
        }
    });

    // Media Picker State
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFlagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = COUNTRIES.find(c => c.code === e.target.value);
        if (selected) {
            setFormData(prev => ({ 
                ...prev, 
                flag: selected.code,
                country: selected.name // Auto-fill country name
            }));
        } else {
             setFormData(prev => ({ ...prev, flag: e.target.value }));
        }
    };

    const handleSessionChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            sessions: { ...prev.sessions!, [key]: value }
        }));
    };

    const handleMediaSelect = (item: MediaItem) => {
        setFormData(prev => ({ ...prev, trackMap: item.url }));
        setMediaPickerOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clean sessions based on format
        const cleanSessions = { ...formData.sessions };
        if (formData.format === 'standard') {
            delete cleanSessions.sprint;
            delete cleanSessions.sprintQuali;
        } else {
            delete cleanSessions.fp2;
            delete cleanSessions.fp3;
        }

        const finalRace: Race = {
            id: race?.id || Date.now().toString(),
            round: Number(formData.round),
            country: formData.country!,
            city: formData.city!,
            circuitName: formData.circuitName || '',
            flag: formData.flag || 'un',
            format: formData.format as RaceFormat,
            status: formData.status as RaceStatus,
            trackMap: formData.trackMap || '',
            sessions: cleanSessions as any
        };
        onSave(finalRace);
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
                            selectLabel="Streckenkarte wählen"
                        />
                    </div>
                </div>
            )}

            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-display font-bold text-slate-900">{race ? 'Edit Grand Prix' : 'New Grand Prix'}</h2>
                    <div className="flex space-x-2">
                        <button onClick={onCancel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                        <button onClick={handleSubmit} className="px-6 py-2 bg-f1-pink text-white rounded font-bold uppercase hover:bg-pink-700 flex items-center shadow-sm">
                            <Save size={16} className="mr-2" /> Save
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* General Info */}
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-100 pb-2">Event Details</h3>
                        
                        {/* Track Map Area - Re-positioned to full width */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-2">
                            <label className="block text-xs font-bold mb-2 text-slate-700">Track Layout</label>
                            <div className="flex items-start space-x-4">
                                <div className="w-32 h-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                    {formData.trackMap ? (
                                        <img src={formData.trackMap} alt="Track Map" className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <ImageIcon className="text-slate-300" size={24} />
                                    )}
                                </div>
                                <div>
                                    <button type="button" onClick={() => setMediaPickerOpen(true)} className="text-xs bg-white border border-slate-300 hover:border-f1-pink hover:text-f1-pink px-3 py-2 rounded font-bold text-slate-600 transition-colors mb-1">
                                        Select Image
                                    </button>
                                    <p className="text-[10px] text-slate-400 leading-tight">Upload the circuit layout image. Best format: PNG/SVG transparent.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                             <div className="col-span-1">
                                <label className="block text-xs font-bold mb-1 text-slate-700">Round</label>
                                <input type="number" name="round" value={formData.round} onChange={handleChange} className={inputClass} required />
                             </div>
                             <div className="col-span-3">
                                <label className="block text-xs font-bold mb-1 text-slate-700">Circuit Name</label>
                                <input name="circuitName" value={formData.circuitName} onChange={handleChange} className={inputClass} />
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Country Flag Dropdown */}
                            <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">Flag / Country</label>
                                <div className="relative">
                                    {formData.flag && (
                                        <div className="absolute left-3 top-2.5 z-10 pointer-events-none">
                                            {getFlagUrl(formData.flag) && (
                                                <img 
                                                    src={getFlagUrl(formData.flag)} 
                                                    className="w-5 h-auto border border-black/50" 
                                                    alt="" 
                                                />
                                            )}
                                        </div>
                                    )}
                                    <select 
                                        name="flag" 
                                        value={formData.flag} 
                                        onChange={handleFlagChange} 
                                        className={`${inputClass} pl-10`}
                                    >
                                        <option value="">-- Select Country --</option>
                                        {COUNTRIES.map(c => (
                                            <option key={c.code} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">Country Name</label>
                                <input name="country" value={formData.country} onChange={handleChange} className={inputClass} required />
                            </div>
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">City</label>
                                <input name="city" value={formData.city} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-slate-700">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                    <option value="upcoming">Normal (Upcoming)</option>
                                    <option value="next">Next Up</option>
                                    <option value="live">Live Now</option>
                                    <option value="completed">Abgeschlossen</option>
                                    <option value="cancelled">Abgesagt</option>
                                </select>
                            </div>
                        </div>

                         <div>
                            <label className="block text-xs font-bold mb-1 text-slate-700">Format</label>
                            <select name="format" value={formData.format} onChange={handleChange} className={inputClass}>
                                <option value="standard">Standard Weekend</option>
                                <option value="sprint">Sprint Weekend</option>
                            </select>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase text-slate-400 text-xs tracking-wider border-b border-slate-100 pb-2">
                            Session Schedule {formData.format === 'sprint' ? '(Sprint)' : '(Standard)'}
                        </h3>
                        
                        {/* Always show FP1 */}
                        <div>
                            <label className="block text-xs font-bold mb-1 text-slate-700">1. Freies Training</label>
                            <input 
                                type="datetime-local" 
                                value={getSafeDate(formData.sessions?.fp1)} 
                                onChange={(e) => handleSessionChange('fp1', e.target.value)} 
                                className={inputClass} 
                            />
                        </div>

                        {/* Standard Format Fields */}
                        {formData.format === 'standard' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">2. Freies Training</label>
                                    <input 
                                        type="datetime-local" 
                                        value={getSafeDate(formData.sessions?.fp2)} 
                                        onChange={(e) => handleSessionChange('fp2', e.target.value)} 
                                        className={inputClass} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">3. Freies Training</label>
                                    <input 
                                        type="datetime-local" 
                                        value={getSafeDate(formData.sessions?.fp3)} 
                                        onChange={(e) => handleSessionChange('fp3', e.target.value)} 
                                        className={inputClass} 
                                    />
                                </div>
                            </>
                        )}

                        {/* Sprint Format Fields */}
                        {formData.format === 'sprint' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Sprint Qualifying</label>
                                    <input 
                                        type="datetime-local" 
                                        value={getSafeDate(formData.sessions?.sprintQuali)} 
                                        onChange={(e) => handleSessionChange('sprintQuali', e.target.value)} 
                                        className={`${inputClass} border-orange-200`} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-slate-700">Sprint</label>
                                    <input 
                                        type="datetime-local" 
                                        value={getSafeDate(formData.sessions?.sprint)} 
                                        onChange={(e) => handleSessionChange('sprint', e.target.value)} 
                                        className={`${inputClass} border-orange-200`} 
                                    />
                                </div>
                            </>
                        )}

                        {/* Always show Quali and Race */}
                        <div>
                            <label className="block text-xs font-bold mb-1 text-slate-700">Das Qualifying</label>
                            <input 
                                type="datetime-local" 
                                value={getSafeDate(formData.sessions?.qualifying)} 
                                onChange={(e) => handleSessionChange('qualifying', e.target.value)} 
                                className={inputClass} 
                            />
                        </div>
                        
                        <div className="bg-f1-pink/5 p-3 rounded-lg border border-f1-pink/20">
                            <label className="block text-xs font-bold mb-1 text-f1-pink uppercase">Das Rennen</label>
                            <input 
                                type="datetime-local" 
                                value={getSafeDate(formData.sessions?.race)} 
                                onChange={(e) => handleSessionChange('race', e.target.value)} 
                                className={`${inputClass} border-f1-pink`}
                                required
                            />
                        </div>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default RaceEditor;
