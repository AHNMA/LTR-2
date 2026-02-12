
import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { MediaItem } from '../../types';
import { Upload, Trash2, Search, X, Check, Copy, FileImage, Plus } from 'lucide-react';

interface MediaLibraryProps {
    onSelect?: (item: MediaItem) => void;
    onClose?: () => void;
    selectLabel?: string;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, onClose, selectLabel }) => {
    // Manual version trigger to ensure UI updates instantly when DB changes
    const [version, setVersion] = useState(0);
    
    // Add version to dependency array to force refresh
    const mediaItems = useLiveQuery(
        () => db.media.orderBy('uploadedAt').reverse().toArray(), 
        [version]
    ) || [];
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filtering
    const filteredItems = mediaItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const refreshData = () => {
        setVersion(v => v + 1);
    };

    // --- UPLOAD LOGIC ---
    const handleFiles = async (files: FileList) => {
        if (isUploading) return; // Prevent double execution
        setIsUploading(true);
        
        try {
            const newItems: MediaItem[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith('image/')) continue;

                const reader = new FileReader();
                
                const promise = new Promise<void>((resolve) => {
                    reader.onload = async (e) => {
                        const result = e.target?.result as string;
                        
                        // Basic dimension check
                        const img = new Image();
                        img.src = result;
                        await new Promise(r => img.onload = r);

                        newItems.push({
                            id: Math.random().toString(36).substr(2, 9),
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            url: result,
                            uploadedAt: new Date().toISOString(),
                            dimensions: { width: img.width, height: img.height }
                        });
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
                await promise;
            }

            if (newItems.length > 0) {
                await db.media.bulkAdd(newItems);
                refreshData(); // Force visual update
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Fehler beim Upload.");
        } finally {
            setIsUploading(false);
            // Clear input so same file can be selected again if needed
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Dieses Bild wirklich löschen? Es könnte in Artikeln verwendet werden.')) {
            try {
                await db.media.delete(id);
                setSelectedItem(null); // Deselect immediately
                refreshData(); // Force visual update
            } catch (e) {
                console.error("Delete failed", e);
                alert("Löschen fehlgeschlagen.");
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('URL in Zwischenablage kopiert!');
    };

    const handleConfirmSelection = () => {
        if (onSelect && selectedItem) {
            onSelect(selectedItem);
        }
    };

    // Format Bytes
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans relative">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center space-x-4">
                    {onClose && (
                        <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg transition-colors">
                            <X size={16} />
                        </button>
                    )}
                    <button 
                        onClick={() => inputRef.current?.click()}
                        disabled={isUploading}
                        className={`bg-f1-pink text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center shadow-sm transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700'}`}
                    >
                        <Plus size={16} className="mr-2" /> {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <input 
                        type="file" 
                        ref={inputRef} 
                        className="hidden" 
                        multiple 
                        accept="image/*" 
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                handleFiles(e.target.files);
                            }
                        }} 
                    />
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Suche..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-f1-pink focus:ring-1 focus:ring-f1-pink bg-white w-64"
                        />
                    </div>
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase">
                    {filteredItems.length} Elemente
                </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 overflow-hidden relative">
                
                {/* Drop Zone Overlay */}
                {dragActive && (
                    <div 
                        className="absolute inset-0 bg-f1-pink/10 border-4 border-f1-pink border-dashed z-50 flex items-center justify-center backdrop-blur-sm"
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                    >
                        <div className="text-f1-pink font-bold text-xl flex flex-col items-center">
                            <Upload size={48} className="mb-4" />
                            Dateien hier ablegen
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div 
                    className="flex-1 overflow-y-auto p-6 bg-slate-50"
                    onDragEnter={() => setDragActive(true)}
                    onDragOver={(e) => e.preventDefault()} // Essential to allow drop
                >
                    {filteredItems.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <FileImage size={48} className="mb-4 opacity-50" />
                            <p>Keine Medien gefunden.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredItems.map(item => (
                            <div 
                                key={item.id} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem(item);
                                }}
                                className={`relative aspect-square group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedItem?.id === item.id ? 'border-f1-pink shadow-lg scale-[1.02]' : 'border-transparent hover:border-slate-300'}`}
                            >
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover bg-slate-200" loading="lazy" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                {selectedItem?.id === item.id && (
                                    <div className="absolute top-2 right-2 bg-f1-pink text-white rounded-full p-1 shadow-sm">
                                        <Check size={12} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Details */}
                {selectedItem && (
                    <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto p-6 flex flex-col shrink-0">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Details</h3>
                            <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </div>

                        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mb-6 flex items-center justify-center relative">
                             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/checkerboard-cross-hatch.png')]"></div>
                             <img src={selectedItem.url} className="max-w-full max-h-full object-contain relative z-10" alt="" />
                        </div>

                        <div className="space-y-4 text-sm flex-1">
                            {onSelect && (
                                <button 
                                    onClick={handleConfirmSelection}
                                    className="w-full bg-f1-pink text-white py-3 rounded-lg font-bold uppercase shadow-glow hover:bg-pink-700 transition-colors flex items-center justify-center mb-4"
                                >
                                    <Check size={18} className="mr-2" />
                                    {selectLabel || 'Bild auswählen'}
                                </button>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dateiname</label>
                                <div className="text-slate-900 font-medium break-all">{selectedItem.name}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Typ</label>
                                    <div className="text-slate-900">{selectedItem.type.split('/')[1]?.toUpperCase()}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Größe</label>
                                    <div className="text-slate-900">{formatBytes(selectedItem.size)}</div>
                                </div>
                            </div>
                            {selectedItem.dimensions && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dimensionen</label>
                                    <div className="text-slate-900">{selectedItem.dimensions.width} x {selectedItem.dimensions.height} px</div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hochgeladen am</label>
                                <div className="text-slate-900">{new Date(selectedItem.uploadedAt).toLocaleDateString()}</div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL</label>
                                <div className="flex space-x-2">
                                    <input 
                                        readOnly 
                                        value={selectedItem.url} 
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 truncate focus:outline-none"
                                    />
                                    <button 
                                        onClick={() => copyToClipboard(selectedItem.url)}
                                        className="bg-slate-100 hover:bg-slate-200 p-2 rounded text-slate-600 border border-slate-200"
                                        title="Copy URL"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <button 
                                type="button"
                                onClick={() => handleDelete(selectedItem.id)}
                                className="w-full text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center transition-colors"
                            >
                                <Trash2 size={16} className="mr-2" /> Endgültig Löschen
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibrary;
