
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { usePrediction } from '../../contexts/PredictionContext';
import { Race, SessionType, BonusQuestion } from '../../types';
import { Lock, Unlock, CheckCircle, Clock, Trash2, Save, Plus, HelpCircle, Trophy, AlertTriangle, Settings, Edit3 } from 'lucide-react';
import SessionEditor from './SessionEditor';

const PredictionManager: React.FC = () => {
    const { races, getSessionResult } = useData();
    const { 
        getRoundStatus, setRoundStatus, bonusQuestions, 
        addBonusQuestion, updateBonusQuestion, deleteBonusQuestion,
        settings, updateSettings
    } = usePrediction();

    const [activeTab, setActiveTab] = useState<'rounds' | 'bonus' | 'settings'>('rounds');
    const [editingResultSession, setEditingResultSession] = useState<{race: Race, session: SessionType} | null>(null);

    // Bonus Question Form State
    const [editingBQ, setEditingBQ] = useState<Partial<BonusQuestion>>({
        question: '', points: 10, deadline: '', correctAnswer: ''
    });
    const [isEditingBQId, setIsEditingBQId] = useState<string | null>(null);

    // Settings Form State
    const [localSettings, setLocalSettings] = useState(settings);

    // --- Helpers ---
    const hasResults = (raceId: string, session: SessionType) => {
        const res = getSessionResult(raceId, session);
        return res && res.entries && res.entries.length > 0;
    };

    const isRoundUnlockable = (raceIndex: number) => {
        if (raceIndex === 0) return true;
        const prevRace = races[raceIndex - 1];
        const prevStatus = getRoundStatus(prevRace.id, 'race'); // Check main race status
        return prevStatus === 'settled';
    };

    // --- Rounds Logic ---
    const handleStatusChange = async (raceId: string, session: SessionType, status: 'open' | 'locked' | 'settled') => {
        await setRoundStatus(raceId, session, status);
    };

    const getStatusBadge = (raceId: string, session: SessionType, deadline: string) => {
        const manualStatus = getRoundStatus(raceId, session);
        const timeClosed = new Date() > new Date(deadline);

        if (manualStatus === 'settled') return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-200">Abgerechnet</span>;
        if (manualStatus === 'locked') return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-red-200">Gesperrt</span>;
        if (manualStatus === 'open') return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-blue-200">Offen</span>;
        
        return timeClosed 
            ? <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Geschlossen (Zeit)</span>
            : <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Offen (Zeit)</span>;
    };

    // --- Bonus Question Logic ---
    const handleSaveBQ = async () => {
        if (!editingBQ.question || !editingBQ.deadline) return;

        const bq: BonusQuestion = {
            id: isEditingBQId || Date.now().toString(),
            season: settings.currentSeason,
            question: editingBQ.question!,
            points: Number(editingBQ.points),
            deadline: editingBQ.deadline!,
            correctAnswer: editingBQ.correctAnswer || ''
        };

        if (isEditingBQId) {
            await updateBonusQuestion(bq);
        } else {
            await addBonusQuestion(bq);
        }

        // Reset
        setEditingBQ({ question: '', points: 10, deadline: '', correctAnswer: '' });
        setIsEditingBQId(null);
    };

    const handleEditBQ = (bq: BonusQuestion) => {
        setEditingBQ(bq);
        setIsEditingBQId(bq.id);
    };

    const handleDeleteBQ = async (id: string) => {
        if(confirm('Delete?')) {
            await deleteBonusQuestion(id);
        }
    }

    // --- Settings Logic ---
    const saveSettings = async () => {
        await updateSettings(localSettings);
        alert('Einstellungen gespeichert. Wenn das Jahr geändert wurde, hat eine neue Saison begonnen.');
    };

    const inputClass = "w-full border border-slate-300 bg-white text-slate-900 p-2 rounded text-sm focus:outline-none focus:border-f1-pink focus:ring-1 focus:ring-f1-pink";

    // --- Result Editing ---
    if (editingResultSession) {
        // Mocking close - usually SessionEditor takes onClose
        return (
            <div className="fixed inset-0 z-[100] bg-white">
                <SessionEditor 
                    race={editingResultSession.race} 
                    onClose={() => setEditingResultSession(null)} 
                />
            </div>
        )
    }

    return (
        <div>
             {/* Sub Tabs */}
             <div className="flex space-x-2 mb-6">
                <button 
                    onClick={() => setActiveTab('rounds')} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors flex items-center ${activeTab === 'rounds' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                    <Clock size={14} className="mr-2" /> Runden Status
                </button>
                <button 
                    onClick={() => setActiveTab('bonus')} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors flex items-center ${activeTab === 'bonus' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                    <HelpCircle size={14} className="mr-2" /> Bonusfragen
                </button>
                <button 
                    onClick={() => setActiveTab('settings')} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors flex items-center ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                    <Settings size={14} className="mr-2" /> Einstellungen
                </button>
             </div>

             {/* --- ROUNDS MANAGEMENT --- */}
             {activeTab === 'rounds' && (
                 <div className="space-y-6">
                     {races.map((race, idx) => {
                         const unlockable = isRoundUnlockable(idx);
                         
                         return (
                            <div key={race.id} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${!unlockable ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xl">{race.flag}</span>
                                        <span className="font-bold text-slate-800">{race.country} GP</span>
                                        <span className="text-xs text-slate-500">Runde {race.round}</span>
                                    </div>
                                    {!unlockable && <span className="text-xs text-orange-600 font-bold bg-orange-100 px-2 py-1 rounded">Wartet auf vorheriges Rennen</span>}
                                </div>
                                
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Qualifying Control */}
                                    <div className="border border-slate-100 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center">
                                                <div className={`w-2 h-2 rounded-full mr-2 ${hasResults(race.id, race.format === 'sprint' ? 'sprintQuali' : 'qualifying') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <h4 className="font-bold text-sm uppercase text-slate-600">Qualifying / Sprint</h4>
                                            </div>
                                            {getStatusBadge(race.id, race.format === 'sprint' ? 'sprintQuali' : 'qualifying', race.sessions?.qualifying || '')}
                                        </div>
                                        <div className="flex space-x-2 mb-2">
                                            <button 
                                                onClick={() => handleStatusChange(race.id, race.format === 'sprint' ? 'sprintQuali' : 'qualifying', 'open')}
                                                disabled={!unlockable}
                                                className="flex-1 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-bold uppercase flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Unlock size={14} className="mr-1" /> Open
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(race.id, race.format === 'sprint' ? 'sprintQuali' : 'qualifying', 'locked')}
                                                className="flex-1 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-bold uppercase flex justify-center items-center"
                                            >
                                                <Lock size={14} className="mr-1" /> Lock
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(race.id, race.format === 'sprint' ? 'sprintQuali' : 'qualifying', 'settled')}
                                                disabled={!hasResults(race.id, race.format === 'sprint' ? 'sprintQuali' : 'qualifying')}
                                                title={!hasResults(race.id, race.format === 'sprint' ? 'sprintQuali' : 'qualifying') ? 'Keine Ergebnisse vorhanden' : ''}
                                                className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-bold uppercase flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <CheckCircle size={14} className="mr-1" /> Settle
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => setEditingResultSession({ race, session: race.format === 'sprint' ? 'sprintQuali' : 'qualifying' })}
                                            className="w-full text-xs text-slate-400 hover:text-f1-pink flex justify-center items-center mt-2 py-1"
                                        >
                                            <Edit3 size={12} className="mr-1" /> Ergebnis korrigieren
                                        </button>
                                    </div>

                                    {/* Race Control */}
                                    <div className="border border-slate-100 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center">
                                                <div className={`w-2 h-2 rounded-full mr-2 ${hasResults(race.id, 'race') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <h4 className="font-bold text-sm uppercase text-slate-600">Das Rennen</h4>
                                            </div>
                                            {getStatusBadge(race.id, 'race', race.sessions?.race || '')}
                                        </div>
                                        <div className="flex space-x-2 mb-2">
                                            <button 
                                                onClick={() => handleStatusChange(race.id, 'race', 'open')}
                                                disabled={!unlockable}
                                                className="flex-1 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-bold uppercase flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Unlock size={14} className="mr-1" /> Open
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(race.id, 'race', 'locked')}
                                                className="flex-1 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-bold uppercase flex justify-center items-center"
                                            >
                                                <Lock size={14} className="mr-1" /> Lock
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(race.id, 'race', 'settled')}
                                                disabled={!hasResults(race.id, 'race')}
                                                title={!hasResults(race.id, 'race') ? 'Keine Ergebnisse vorhanden' : ''}
                                                className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-bold uppercase flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <CheckCircle size={14} className="mr-1" /> Settle
                                            </button>
                                        </div>
                                         <button 
                                            onClick={() => setEditingResultSession({ race, session: 'race' })}
                                            className="w-full text-xs text-slate-400 hover:text-f1-pink flex justify-center items-center mt-2 py-1"
                                        >
                                            <Edit3 size={12} className="mr-1" /> Ergebnis korrigieren
                                        </button>
                                    </div>
                                </div>
                            </div>
                         );
                     })}
                 </div>
             )}

             {/* --- BONUS QUESTIONS --- */}
             {activeTab === 'bonus' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* List */}
                     <div className="lg:col-span-2 space-y-4">
                         {bonusQuestions.map(bq => (
                             <div key={bq.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
                                 <div>
                                     <div className="font-bold text-slate-900 mb-1">{bq.question}</div>
                                     <div className="text-xs text-slate-500 mb-2">Deadline: {new Date(bq.deadline).toLocaleString()} • {bq.points} Points</div>
                                     {bq.correctAnswer ? (
                                         <div className="text-xs font-bold text-green-600 bg-green-50 inline-block px-2 py-1 rounded">Lösung: {bq.correctAnswer}</div>
                                     ) : (
                                         <div className="text-xs font-bold text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded">Noch offen</div>
                                     )}
                                 </div>
                                 <div className="flex space-x-2">
                                     <button onClick={() => handleEditBQ(bq)} className="p-2 text-slate-400 hover:text-f1-pink bg-slate-50 rounded"><Trophy size={16} /></button>
                                     <button onClick={() => handleDeleteBQ(bq.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded"><Trash2 size={16} /></button>
                                 </div>
                             </div>
                         ))}
                     </div>

                     {/* Editor */}
                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
                         <h3 className="font-bold uppercase text-slate-700 mb-4 flex items-center">
                             {isEditingBQId ? 'Frage Bearbeiten' : 'Neue Frage'}
                         </h3>
                         
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-xs font-bold mb-1 text-slate-700">Frage</label>
                                 <input 
                                    className={inputClass} 
                                    value={editingBQ.question} 
                                    onChange={e => setEditingBQ({...editingBQ, question: e.target.value})}
                                 />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold mb-1 text-slate-700">Punkte</label>
                                 <input 
                                    type="number" 
                                    className={inputClass} 
                                    value={editingBQ.points} 
                                    onChange={e => setEditingBQ({...editingBQ, points: Number(e.target.value)})}
                                 />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold mb-1 text-slate-700">Deadline</label>
                                 <input 
                                    type="datetime-local" 
                                    className={inputClass} 
                                    value={editingBQ.deadline} 
                                    onChange={e => setEditingBQ({...editingBQ, deadline: e.target.value})}
                                 />
                             </div>
                             
                             <div className="pt-4 border-t border-slate-200 mt-4">
                                <label className="block text-xs font-bold mb-1 text-green-700">Richtige Antwort (Auflösung)</label>
                                <input 
                                    className={`${inputClass} bg-green-50 border-green-200 focus:border-green-500 focus:ring-green-500`} 
                                    placeholder="Erst eingeben, wenn Ergebnis feststeht"
                                    value={editingBQ.correctAnswer} 
                                    onChange={e => setEditingBQ({...editingBQ, correctAnswer: e.target.value})}
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Wenn dieses Feld ausgefüllt ist, werden Punkte an Spieler mit identischer Antwort vergeben.</p>
                             </div>

                             <div className="flex space-x-2 pt-2">
                                 {isEditingBQId && (
                                     <button 
                                        onClick={() => { setIsEditingBQId(null); setEditingBQ({ question: '', points: 10, deadline: '', correctAnswer: '' }); }}
                                        className="flex-1 py-2 bg-white border border-slate-200 text-slate-500 rounded text-xs font-bold uppercase"
                                     >
                                         Cancel
                                     </button>
                                 )}
                                 <button 
                                    onClick={handleSaveBQ}
                                    className="flex-1 py-2 bg-f1-pink text-white rounded text-xs font-bold uppercase flex justify-center items-center hover:bg-pink-700"
                                 >
                                     <Save size={14} className="mr-2" /> Save
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {/* --- SETTINGS --- */}
             {activeTab === 'settings' && (
                 <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="font-bold uppercase text-slate-900 mb-6 flex items-center text-lg">
                         <Settings className="mr-2 text-f1-pink" /> Game Settings
                     </h3>

                     <div className="space-y-6">
                         <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                             <label className="block text-sm font-bold text-yellow-800 mb-2">Aktuelle Saison (Jahr)</label>
                             <div className="flex items-center space-x-4">
                                 <input 
                                    type="number" 
                                    className="w-24 border border-yellow-300 p-2 rounded font-bold text-center bg-white text-slate-900" 
                                    value={localSettings.currentSeason} 
                                    onChange={e => setLocalSettings({...localSettings, currentSeason: Number(e.target.value)})}
                                />
                                <div className="text-xs text-yellow-700">
                                    <AlertTriangle size={14} className="inline mr-1" />
                                    Achtung: Wenn du das Jahr änderst, werden alte Tipps ausgeblendet und ein neues Spiel beginnt.
                                </div>
                             </div>
                         </div>

                         <div>
                             <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Punkteverteilung Rennen (P1, P2, P3...)</label>
                             <input 
                                className={inputClass} 
                                value={localSettings.racePoints.join(', ')} 
                                onChange={e => setLocalSettings({...localSettings, racePoints: e.target.value.split(',').map(n => Number(n.trim()) || 0)})}
                             />
                             <p className="text-[10px] text-slate-400 mt-1">Kommagetrennt. Beispiel: 10, 8, 6, 5...</p>
                         </div>

                         <div>
                             <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Punkteverteilung Qualifying (P1, P2...)</label>
                             <input 
                                className={inputClass} 
                                value={localSettings.qualiPoints.join(', ')} 
                                onChange={e => setLocalSettings({...localSettings, qualiPoints: e.target.value.split(',').map(n => Number(n.trim()) || 0)})}
                             />
                         </div>

                         <div>
                             <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Teilnahmepunkt (Trostpreis)</label>
                             <input 
                                type="number"
                                className="w-20 border border-slate-300 p-2 rounded text-sm bg-white text-slate-900" 
                                value={localSettings.participationPoint} 
                                onChange={e => setLocalSettings({...localSettings, participationPoint: Number(e.target.value)})}
                             />
                             <p className="text-[10px] text-slate-400 mt-1">Punkte für Fahrer in Top-Liste aber falsche Position.</p>
                         </div>

                         <div className="pt-4 border-t border-slate-100 flex justify-end">
                             <button 
                                onClick={saveSettings}
                                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold uppercase hover:bg-f1-pink transition-colors flex items-center"
                             >
                                 <Save size={16} className="mr-2" /> Einstellungen Speichern
                             </button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default PredictionManager;
