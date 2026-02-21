
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { MediaItem } from '../../types';
import { syncService } from '../../services/sync';
import { Upload, Trash2, Search, X, Check, FileImage, Plus, Loader2, RefreshCw, Globe, AlertCircle, AlertTriangle } from 'lucide-react';

interface MediaLibraryProps {
    onSelect?: (item: MediaItem) => void;
    onClose?: () => void;
    selectLabel?: string;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, onClose, selectLabel }) => {
    const [version, setVersion] = useState(0);
    
    const mediaItems = useLiveQuery(
        () => db.media.orderBy('uploadedAt').reverse().toArray(), 
        [version]
    ) || [];
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>(''); 
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const config = syncService.getConfig();
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredItems = mediaItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const refreshData = useCallback(() => {
        setVersion(v => v + 1);
    }, []);

    const handleScanServer = useCallback(async (silent = false) => {
        if (isScanning) return;
        setIsScanning(true);
        setErrorMessage(null);
        if (!silent) setStatusMessage('Synchronisiere...');

        try {
            const remoteFiles = await syncService.fetchRemoteMediaList();
            
            if (!Array.isArray(remoteFiles)) {
                if (!silent) setStatusMessage(`Fehler`);
                return;
            }

            const localItems = await db.media.toArray();
            const localUrls = new Set(localItems.map(m => m.url));
            const remoteUrls = new Set(remoteFiles.map(f => f.url));

            const newItems: MediaItem[] = [];
            const urlsToDelete: string[] = [];

            for (const file of remoteFiles) {
                if (!localUrls.has(file.url)) {
                    newItems.push({
                        id: Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: file.url,
                        uploadedAt: file.date || new Date().toISOString()
                    });
                }
            }

            for (const local of localItems) {
                if (!remoteUrls.has(local.url)) {
                    urlsToDelete.push(local.id);
                }
            }

            if (newItems.length > 0 || urlsToDelete.length > 0) {
                await db.transaction('rw', db.media, async () => {
                    if (newItems.length > 0) await db.media.bulkAdd(newItems);
                    if (urlsToDelete.length > 0) {
                        for (const id of urlsToDelete) await db.media.delete(id);
                    }
                });
                refreshData();
            }

            if (!silent) {
                if (newItems.length > 0 || urlsToDelete.length > 0) {
                    setStatusMessage(`Sync OK (+${newItems.length} / -${urlsToDelete.length})`);
                } else {
                    setStatusMessage('Alles aktuell.');
                }
            }
        } catch (e: any) {
            console.error("Scan-Fehler:", e);
            if (!silent) setStatusMessage(`Fehler`);
            setErrorMessage(`Sync fehlgeschlagen: ${e.message}`);
        } finally {
            setIsScanning(false);
            if (!silent) setTimeout(() => setStatusMessage(''), 10000);
        }
    }, [isScanning, refreshData]);

    useEffect(() => {
        handleScanServer(true);
    }, []); 

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        if (isUploading) return;
        setErrorMessage(null);

        const uploadUrl = config.uploadUrl;
        const apiKey = config.key;

        if (!uploadUrl || !apiKey) {
            setErrorMessage("Konfiguration fehlt! Bitte unter System prüfen.");
            return;
        }

        setIsUploading(true);
        setStatusMessage('Übertrage...');
        
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith('image/')) continue;

                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: { 'X-API-KEY': apiKey },
                    body: formData
                });

                if (response.ok) {
                    await handleScanServer(true);
                }
            }
            setStatusMessage('Upload abgeschlossen!');
        } catch (error) {
            setStatusMessage('Fehler beim Upload.');
        } finally {
            setIsUploading(false);
            setTimeout(() => setStatusMessage(''), 10000);
        }
    };

    const handleDelete = async () => {
        if (isDeleting || !selectedItem) return;

        setIsDeleting(true);
        setStatusMessage('Lösche vom Server...');
        setErrorMessage(null);

        try {
            await syncService.deleteRemoteMedia(selectedItem.name);
            await db.media.delete(selectedItem.id);
            setSelectedItem(null); 
            setShowDeleteConfirm(false);
            refreshData();
            setStatusMessage('Gelöscht.');
        } catch (e: any) {
            console.error("Delete Error:", e);
            setErrorMessage(`LÖSCHFEHLER: ${e.message}`);
            setStatusMessage(`Fehler beim Löschen`);
            setShowDeleteConfirm(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans relative">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center space-x-2">
                    {onClose && (
                        <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg transition-colors mr-2">
                            <X size={16} />
                        </button>
                    )}
                    <button 
                        onClick={() => { setErrorMessage(null); inputRef.current?.click(); }}
                        disabled={isUploading || isDeleting}
                        className="bg-f1-pink text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase flex items-center shadow-sm hover:bg-pink-700 disabled:opacity-50"
                    >
                        {isUploading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Plus size={14} className="mr-2" />} 
                        Upload
                    </button>

                    <button 
                        onClick={() => handleScanServer(false)}
                        disabled={isScanning || isDeleting}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase flex items-center shadow-sm hover:bg-slate-700 disabled:opacity-50"
                    >
                        {isScanning ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Globe size={14} className="mr-2" />} 
                        Sync Server
                    </button>

                    <input type="file" min-h-screen ref={inputRef} className="hidden" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
                </div>
                <div className="flex items-center space-x-4">
                    {statusMessage && <span className="text-[10px] font-bold text-f1-pink animate-pulse bg-pink-50 px-3 py-1 rounded-full border border-pink-100 max-w-[200px] truncate md:max-w-none">{statusMessage}</span>}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Suchen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-f1-pink w-40" />
                    </div>
                </div>
            </div>

            {errorMessage && (
                <div className="bg-red-600 text-white p-3 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top duration-300">
                    <div className="flex items-center">
                        <AlertCircle size={16} className="mr-2 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button onClick={() => setErrorMessage(null)} className="hover:bg-white/10 p-1 rounded"><X size={14} /></button>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden relative">
                {dragActive && (
                    <div className="absolute inset-0 bg-f1-pink/5 border-4 border-f1-pink border-dashed z-50 flex items-center justify-center backdrop-blur-sm" onDragLeave={() => setDragActive(false)} onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}>
                        <div className="text-f1-pink font-bold text-lg flex flex-col items-center"><Upload size={40} className="mb-2" />Dateien hier ablegen</div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 bg-slate-50" onDragEnter={() => setDragActive(true)} onDragOver={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {filteredItems.map(item => (
                            <div key={item.id} onClick={() => { setSelectedItem(item); setShowDeleteConfirm(false); }} className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedItem?.id === item.id ? 'border-f1-pink shadow-lg' : 'border-transparent hover:border-slate-300'}`}>
                                {item.url && <img src={item.url} className="w-full h-full object-cover bg-slate-200" loading="lazy" />}
                                {selectedItem?.id === item.id && <div className="absolute top-1 right-1 bg-f1-pink text-white rounded-full p-1"><Check size={10} /></div>}
                            </div>
                        ))}
                    </div>
                    {filteredItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <FileImage size={48} className="mb-2 opacity-20" />
                            <p className="text-sm italic">Keine Medien gefunden.</p>
                        </div>
                    )}
                </div>

                {selectedItem && (
                    <div className="w-72 bg-white border-l border-slate-200 overflow-y-auto p-5 flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Vorschau</h3>
                            <button onClick={() => { setSelectedItem(null); setShowDeleteConfirm(false); }} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </div>
                        {selectedItem.url && <img src={selectedItem.url} className="w-full rounded-lg mb-4 border border-slate-200 shadow-sm" alt="" />}
                        <div className="space-y-3 text-xs flex-1">
                            {onSelect && (
                                <button onClick={() => onSelect(selectedItem)} className="w-full bg-f1-pink text-white py-2.5 rounded-lg font-bold uppercase shadow-glow hover:bg-pink-700 transition-colors flex items-center justify-center mb-2">
                                    <Check size={14} className="mr-2" /> {selectLabel || 'Verwenden'}
                                </button>
                            )}
                            <div><label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Name</label><div className="font-bold truncate">{selectedItem.name}</div></div>
                            <div><label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">URL</label><input readOnly value={selectedItem.url} className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] truncate" /></div>
                        </div>

                        <div className="mt-6 border-t border-slate-100 pt-4">
                            {!showDeleteConfirm ? (
                                <button 
                                    type="button" 
                                    disabled={isDeleting}
                                    onClick={() => setShowDeleteConfirm(true)} 
                                    className="w-full text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={14} className="mr-2" />
                                    Vom Server löschen
                                </button>
                            ) : (
                                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                                    <p className="text-[10px] font-bold text-red-600 uppercase text-center flex items-center justify-center mb-2">
                                        <AlertTriangle size={12} className="mr-1" /> Wirklich löschen?
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleDelete}
                                            className="flex-1 bg-red-600 text-white py-2 rounded text-[10px] font-bold uppercase hover:bg-red-700"
                                        >
                                            Ja
                                        </button>
                                        <button 
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 bg-slate-200 text-slate-700 py-2 rounded text-[10px] font-bold uppercase hover:bg-slate-300"
                                        >
                                            Nein
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibrary;
