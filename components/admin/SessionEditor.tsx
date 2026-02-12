
import React, { useState, useEffect } from 'react';
import { Race, SessionType, SessionResult, ResultEntry, Driver, Team } from '../../types';
import { useData } from '../../contexts/DataContext';
import { parseHTMLTable, findDriverId, calculatePoints } from '../../utils/f1Converter';
import { Save, AlertCircle, CheckCircle, Upload } from 'lucide-react';

interface SessionEditorProps {
    race: Race;
    onClose: () => void;
}

const SessionEditor: React.FC<SessionEditorProps> = ({ race, onClose }) => {
    const { drivers, teams, getSessionResult, updateSessionResult } = useData();
    
    // State
    const [activeSession, setActiveSession] = useState<SessionType>('race');
    const [entries, setEntries] = useState<ResultEntry[]>([]);
    const [distancePct, setDistancePct] = useState<number>(100);
    const [bulkInput, setBulkInput] = useState('');
    const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

    // Define available sessions based on format
    const sessions: SessionType[] = race.format === 'sprint' 
        ? ['fp1', 'sprintQuali', 'sprint', 'qualifying', 'race']
        : ['fp1', 'fp2', 'fp3', 'qualifying', 'race'];

    // Load existing data when session changes
    useEffect(() => {
        const existing = getSessionResult(race.id, activeSession);
        if (existing) {
            setEntries(existing.entries);
            setDistancePct(existing.distancePercentage || 100);
        } else {
            setEntries([]);
            setDistancePct(100);
        }
        setBulkInput('');
        setStatusMsg(null);
    }, [activeSession, race.id]);

    const handleBulkConvert = () => {
        if (!bulkInput) return;
        
        try {
            const parsed = parseHTMLTable(bulkInput);
            if (parsed.length === 0) {
                setStatusMsg({ type: 'error', text: 'Keine Tabelle erkannt. Bitte HTML-Code einfügen.' });
                return;
            }

            const newEntries: ResultEntry[] = parsed.map(row => {
                const driverId = findDriverId(row.driverName, drivers);
                
                // Fallback: try to find team if driver match fails or just to update teamId
                // Note: ideally we strictly link driver to team from DB, but bulk data might vary
                let teamId = '';
                if (driverId) {
                    const d = drivers.find(dr => dr.id === driverId);
                    if (d && d.teamId) teamId = d.teamId;
                }

                // Calculate points automatically if this is a race/sprint
                // Use the row's pts if present, otherwise calc
                let points = 0;
                if ((activeSession === 'race' || activeSession === 'sprint')) {
                    points = calculatePoints(row.pos, activeSession, distancePct);
                }

                return {
                    position: row.pos,
                    driverId: driverId || 'unknown',
                    teamId: teamId,
                    time: row.time,
                    laps: parseInt(row.laps) || 0,
                    points: points,
                    q1: row.q1,
                    q2: row.q2,
                    q3: row.q3
                };
            });

            setEntries(newEntries);
            setStatusMsg({ type: 'success', text: `${newEntries.length} Einträge importiert.` });
        } catch (e) {
            setStatusMsg({ type: 'error', text: 'Fehler beim Parsen.' });
        }
    };

    const handleEntryChange = (index: number, field: keyof ResultEntry, value: any) => {
        const newEntries = [...entries];
        newEntries[index] = { ...newEntries[index], [field]: value };
        setEntries(newEntries);
    };

    const handleSave = () => {
        const result: SessionResult = {
            raceId: race.id,
            sessionType: activeSession,
            entries,
            distancePercentage: (activeSession === 'race' ? distancePct : undefined) as any
        };
        updateSessionResult(result);
        setStatusMsg({ type: 'success', text: 'Gespeichert!' });
        setTimeout(() => onClose(), 800);
    };

    return (
        <div className="fixed inset-0 bg-white z-[70] overflow-y-auto font-sans">
             {/* Header - Light Theme */}
             <div className="bg-white text-slate-900 px-6 py-4 flex justify-between items-center shadow-sm border-b border-slate-200 sticky top-0 z-50">
                <div>
                    <h2 className="text-xl font-bold uppercase italic">{race.country} GP - Results</h2>
                    <div className="text-xs text-slate-500">Round {race.round} • {race.circuitName}</div>
                </div>
                <div className="flex space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold uppercase text-xs">Close</button>
                    <button onClick={handleSave} className="bg-f1-pink hover:bg-pink-700 text-white px-6 py-2 rounded font-bold uppercase flex items-center shadow-sm">
                        <Save size={16} className="mr-2" /> Save Results
                    </button>
                </div>
             </div>

             <div className="container mx-auto px-4 py-8">
                 
                 {/* Session Tabs */}
                 <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
                     {sessions.map(s => (
                         <button 
                            key={s} 
                            onClick={() => setActiveSession(s)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeSession === s ? 'bg-f1-pink text-white shadow-glow' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {s === 'sprintQuali' ? 'Sprint Quali' : s}
                         </button>
                     ))}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     
                     {/* Left: Bulk Import */}
                     <div className="lg:col-span-1 bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
                         <h3 className="font-bold uppercase text-slate-700 mb-4 flex items-center">
                             <Upload size={16} className="mr-2" /> Bulk Import
                         </h3>
                         <p className="text-xs text-slate-500 mb-4">
                             Kopiere die HTML-Tabelle von formula1.com oder anderen Quellen hier hinein. 
                             Der Converter erkennt Pos, Fahrer, Zeiten und Punkte automatisch.
                         </p>
                         <textarea 
                            value={bulkInput}
                            onChange={(e) => setBulkInput(e.target.value)}
                            className="w-full h-40 border border-slate-300 rounded p-2 text-xs font-mono mb-4 focus:border-f1-pink focus:outline-none bg-white"
                            placeholder="<table>...</table>"
                         />
                         
                         {/* Race Specific Settings */}
                         {activeSession === 'race' && (
                             <div className="mb-4">
                                 <label className="block text-xs font-bold mb-1">Race Distance (Points Scale)</label>
                                 <select 
                                    value={distancePct} 
                                    onChange={(e) => setDistancePct(Number(e.target.value))}
                                    className="w-full border p-2 rounded text-sm bg-white"
                                >
                                     <option value={100}>Full Distance (100%)</option>
                                     <option value={75}>Reduced (75%)</option>
                                     <option value={50}>Half Points (50%)</option>
                                     <option value={25}>Minimal (25%)</option>
                                 </select>
                             </div>
                         )}

                         <button 
                            onClick={handleBulkConvert}
                            className="w-full bg-slate-800 text-white py-2 rounded text-xs font-bold uppercase hover:bg-slate-700"
                        >
                            Convert & Fill Table
                         </button>

                         {statusMsg && (
                             <div className={`mt-4 p-3 rounded flex items-center text-xs font-bold ${statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 {statusMsg.type === 'success' ? <CheckCircle size={14} className="mr-2" /> : <AlertCircle size={14} className="mr-2" />}
                                 {statusMsg.text}
                             </div>
                         )}
                     </div>

                     {/* Right: Data Table */}
                     <div className="lg:col-span-2">
                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                             <table className="w-full text-left text-sm">
                                 <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-500">
                                     <tr>
                                         <th className="p-3 w-16">Pos</th>
                                         <th className="p-3">Driver</th>
                                         <th className="p-3">Time/Gap</th>
                                         {(activeSession === 'race' || activeSession === 'sprint') && <th className="p-3 w-20">Pts</th>}
                                         <th className="p-3 w-10"></th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                     {entries.map((entry, idx) => (
                                         <tr key={idx} className={!entry.driverId ? 'bg-red-50' : ''}>
                                             <td className="p-2">
                                                 <input 
                                                    value={entry.position} 
                                                    onChange={(e) => handleEntryChange(idx, 'position', e.target.value)}
                                                    className="w-full bg-transparent border-b border-transparent focus:border-f1-pink focus:outline-none text-center font-bold"
                                                />
                                             </td>
                                             <td className="p-2">
                                                 <select 
                                                    value={entry.driverId} 
                                                    onChange={(e) => handleEntryChange(idx, 'driverId', e.target.value)}
                                                    className={`w-full p-1 rounded bg-transparent ${!entry.driverId || entry.driverId === 'unknown' ? 'border border-red-300 text-red-600' : 'border-transparent'}`}
                                                >
                                                    <option value="unknown">-- Select Driver --</option>
                                                    {drivers.map(d => (
                                                        <option key={d.id} value={d.id}>{d.lastName}, {d.firstName}</option>
                                                    ))}
                                                 </select>
                                             </td>
                                             <td className="p-2">
                                                 <input 
                                                    value={entry.time} 
                                                    onChange={(e) => handleEntryChange(idx, 'time', e.target.value)}
                                                    className="w-full bg-transparent border-b border-transparent focus:border-f1-pink focus:outline-none"
                                                />
                                             </td>
                                             {(activeSession === 'race' || activeSession === 'sprint') && (
                                                <td className="p-2">
                                                    <input 
                                                        type="number"
                                                        value={entry.points} 
                                                        onChange={(e) => handleEntryChange(idx, 'points', Number(e.target.value))}
                                                        className="w-full bg-transparent border-b border-transparent focus:border-f1-pink focus:outline-none font-bold text-f1-pink"
                                                    />
                                                </td>
                                             )}
                                             <td className="p-2 text-center">
                                                 <button onClick={() => {
                                                     const newE = [...entries];
                                                     newE.splice(idx, 1);
                                                     setEntries(newE);
                                                 }} className="text-slate-300 hover:text-red-500">×</button>
                                             </td>
                                         </tr>
                                     ))}
                                     {entries.length === 0 && (
                                         <tr>
                                             <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                                 No results yet. Use Bulk Import or add manually.
                                             </td>
                                         </tr>
                                     )}
                                 </tbody>
                             </table>
                             <div className="p-3 bg-slate-50 border-t border-slate-200">
                                 <button 
                                    onClick={() => setEntries([...entries, { driverId: '', teamId: '', position: '', time: '', laps: 0, points: 0 }])}
                                    className="text-xs font-bold uppercase text-slate-500 hover:text-f1-pink"
                                >
                                    + Add Row
                                </button>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default SessionEditor;
