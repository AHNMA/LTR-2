
import React, { useState, useEffect } from 'react';
import { usePrediction } from '../../contexts/PredictionContext';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { SessionType } from '../../types';
import { Trophy, Clock, CheckCircle, Lock, Settings, Save, HelpCircle, Calendar, AlertCircle } from 'lucide-react';
import { getFlagUrl } from '../../constants';

const PredictionPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { goToLogin } = useNavigation();
    const { races, drivers, teams } = useData();
    const { 
        settings, 
        submitBet, 
        getUserBet, 
        getLeaderboard, 
        isBettingClosed, 
        getRoundStatus,
        bonusQuestions,
        userBonusBets,
        submitBonusBet,
        currentSeason,
        updateSettings,
        canManageGame
    } = usePrediction();
    
    const [activeTab, setActiveTab] = useState<'bet' | 'bonus' | 'leaderboard' | 'rules'>('bet');
    const [selectedRaceId, setSelectedRaceId] = useState<string>('');
    const [selectedSession, setSelectedSession] = useState<SessionType>('race');

    // Filter sessions that are relevant for betting
    const relevantSessions: SessionType[] = ['race', 'qualifying', 'sprint', 'sprintQuali'];

    // Initialize selection with next race
    useEffect(() => {
        // Try to find the first "open" race, otherwise the next scheduled one
        const openRace = races.find(r => getRoundStatus(r.id, 'race') === 'open');
        const next = openRace || races.find(r => r.status === 'next') || races.find(r => r.status === 'upcoming') || races[races.length - 1];
        
        if (next) {
            setSelectedRaceId(next.id);
            // Default to race unless quali is sooner/active logic (simplified here)
            setSelectedSession(next.format === 'sprint' ? 'sprintQuali' : 'qualifying');
        }
    }, [races]);

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <Trophy size={64} className="mx-auto text-f1-pink mb-4" />
                    <h2 className="text-2xl font-bold mb-2">F1 Tippspiel {currentSeason}</h2>
                    <p className="text-slate-500 mb-6">Bitte logge dich ein, um am Tippspiel teilzunehmen.</p>
                    <button onClick={goToLogin} className="bg-f1-pink text-white px-6 py-2 rounded-full font-bold uppercase">Zum Login</button>
                </div>
            </div>
        );
    }

    // -- HELPER COMPONENTS --

    const RaceSelector = () => (
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 no-scrollbar">
            {races.map(race => {
                const status = getRoundStatus(race.id, 'race'); // Check main race status for general vibe
                const isSelected = selectedRaceId === race.id;
                
                let statusColor = 'border-slate-200 text-slate-500';
                let Icon = null;

                if (status === 'open') {
                    statusColor = isSelected ? 'bg-f1-pink text-white border-f1-pink' : 'border-f1-pink text-f1-pink bg-pink-50';
                } else if (status === 'settled') {
                    statusColor = isSelected ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-400 bg-slate-100';
                    Icon = <CheckCircle size={10} className="ml-1" />;
                } else {
                    // Locked / Future
                    statusColor = isSelected ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-400';
                    Icon = <Lock size={10} className="ml-1 opacity-50" />;
                }

                return (
                    <button
                        key={race.id}
                        onClick={() => setSelectedRaceId(race.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg border text-xs font-bold uppercase transition-all flex items-center ${statusColor}`}
                    >
                        <img src={getFlagUrl(race.flag)} className="w-4 h-auto mr-2 border border-black/50" alt="" />
                        {race.country}
                        {Icon}
                    </button>
                );
            })}
        </div>
    );

    const BettingForm = () => {
        const race = races.find(r => r.id === selectedRaceId);
        if (!race) return null;

        const sessionTime = race.sessions?.[selectedSession];
        if (!sessionTime) return <div className="p-8 text-center text-slate-400">Session nicht verfügbar.</div>;

        const isClosed = isBettingClosed(race.id, selectedSession, sessionTime);
        const roundStatus = getRoundStatus(race.id, selectedSession);
        
        // Time Calculation
        const deadline = new Date(sessionTime);
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);

        // Determine how many slots to bet on
        const isQuali = selectedSession === 'qualifying' || selectedSession === 'sprintQuali';
        const slotsCount = isQuali ? settings.qualiPoints.length : settings.racePoints.length; 
        const pointsSchema = isQuali ? settings.qualiPoints : settings.racePoints;

        // Existing Bet
        const existingBet = getUserBet(race.id, selectedSession, currentUser.id);
        const [currentPicks, setCurrentPicks] = useState<string[]>(
            existingBet ? existingBet.drivers : Array(slotsCount).fill('')
        );
        const [isDirty, setIsDirty] = useState(false);

        // Update local state when bet changes (e.g. switching sessions)
        useEffect(() => {
            setCurrentPicks(existingBet ? existingBet.drivers : Array(slotsCount).fill(''));
            setIsDirty(false);
        }, [existingBet, slotsCount, selectedSession, selectedRaceId]);

        const handlePickChange = (index: number, driverId: string) => {
            if (isClosed) return;
            const newPicks = [...currentPicks];
            newPicks[index] = driverId;
            setCurrentPicks(newPicks);
            setIsDirty(true);
        };

        const handleSave = () => {
            submitBet(race.id, selectedSession, currentPicks);
            setIsDirty(false);
            alert('Tipp gespeichert!');
        };

        return (
            <div className="max-w-3xl mx-auto">
                {/* Session Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm inline-flex">
                        {relevantSessions.map(sess => {
                            if (race.format === 'standard' && (sess === 'sprint' || sess === 'sprintQuali')) return null;
                            return (
                                <button
                                    key={sess}
                                    onClick={() => setSelectedSession(sess)}
                                    className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-colors ${selectedSession === sess ? 'bg-f1-pink text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {sess === 'sprintQuali' ? 'Sprint Q' : sess}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Status Bar */}
                <div className={`mb-8 p-4 rounded-lg flex items-center justify-between shadow-sm ${isClosed ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                    <div className="flex items-center font-bold">
                        {isClosed ? <Lock size={18} className="mr-2" /> : <Clock size={18} className="mr-2" />}
                        {isClosed ? (
                            <span>
                                {roundStatus === 'settled' ? 'Runde beendet & ausgewertet' : 'Tippabgabe geschlossen'}
                            </span>
                        ) : (
                            <span>
                                {diff > 0 ? (
                                    <>Noch {days > 0 && `${days}d `}{hours}h {mins}m</>
                                ) : 'Geschlossen'}
                            </span>
                        )}
                    </div>
                    <div className="text-xs uppercase font-bold tracking-wider hidden sm:block">
                        Start: {new Date(sessionTime).toLocaleString('de-DE', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                {/* Betting Slots */}
                <div className="space-y-3 mb-8">
                    {Array.from({ length: slotsCount }).map((_, index) => {
                        const selectedDriverId = currentPicks[index];
                        const driver = drivers.find(d => d.id === selectedDriverId);
                        const team = driver ? teams.find(t => t.id === driver.teamId) : null;

                        return (
                            <div key={index} className="flex items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group">
                                {/* Position Badge */}
                                <div className={`w-8 h-8 flex items-center justify-center rounded font-display font-bold text-lg mr-4 ${index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-slate-300 text-white' : index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {index + 1}
                                </div>

                                {/* Driver Selector */}
                                <div className="flex-1">
                                    {isClosed ? (
                                        // Read Only View
                                        <div className="flex items-center h-10">
                                            {driver ? (
                                                <>
                                                    <div className="w-1 h-6 mr-3 rounded" style={{ backgroundColor: team?.color || '#ccc' }}></div>
                                                    <span className="font-bold text-slate-800">{driver.firstName} {driver.lastName}</span>
                                                    {existingBet && (
                                                        <span className="ml-auto text-xs font-bold text-green-600 uppercase bg-green-50 px-2 py-1 rounded">Getippt</span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-slate-400 italic">Kein Tipp abgegeben</span>
                                            )}
                                        </div>
                                    ) : (
                                        // Edit View
                                        <select
                                            value={selectedDriverId || ''}
                                            onChange={(e) => handlePickChange(index, e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-md focus:ring-f1-pink focus:border-f1-pink block p-2.5"
                                        >
                                            <option value="">-- Fahrer wählen --</option>
                                            {drivers.map(d => (
                                                <option key={d.id} value={d.id} disabled={currentPicks.includes(d.id) && currentPicks[index] !== d.id}>
                                                    {d.lastName}, {d.firstName}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Points Hint */}
                                <div className="ml-4 text-xs font-bold text-slate-300 w-12 text-right">
                                    {pointsSchema[index]} Pts
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Action Bar */}
                {!isClosed && (
                    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 flex justify-center z-50 md:static md:bg-transparent md:border-0 md:p-0">
                        <button 
                            onClick={handleSave} 
                            disabled={!isDirty}
                            className={`w-full md:w-auto px-8 py-3 rounded-full font-bold uppercase tracking-wider flex items-center justify-center transition-all ${isDirty ? 'bg-f1-pink text-white shadow-glow hover:bg-pink-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            <Save size={18} className="mr-2" />
                            {isDirty ? 'Tipps Speichern' : 'Gespeichert'}
                        </button>
                    </div>
                )}
                
                {isClosed && !existingBet && (
                    <div className="text-center p-4 bg-slate-100 rounded-lg text-slate-500 text-sm italic">
                        Du hast für diese Session keine Tipps abgegeben.
                    </div>
                )}
            </div>
        );
    };

    const BonusQuestionsView = () => {
        // Group questions
        const now = new Date();

        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start mb-6">
                    <HelpCircle className="text-yellow-600 mr-3 mt-0.5" size={20} />
                    <div>
                        <h4 className="font-bold text-yellow-800 text-sm uppercase mb-1">Bonus Punkte</h4>
                        <p className="text-xs text-yellow-700 leading-relaxed">
                            Beantworte diese Fragen vor der Deadline, um am Ende der Saison {currentSeason} zusätzliche Punkte zu erhalten. 
                            Achte auf die Groß- und Kleinschreibung bei Textantworten.
                        </p>
                    </div>
                </div>

                {bonusQuestions.length === 0 && <div className="text-center text-slate-400 py-8">Keine Bonusfragen verfügbar.</div>}

                {bonusQuestions.map(bq => {
                    const deadline = new Date(bq.deadline);
                    const isExpired = now > deadline;
                    const myBet = userBonusBets.find(b => b.questionId === bq.id && b.userId === currentUser.id);
                    const [tempAnswer, setTempAnswer] = useState(myBet?.answer || '');
                    const hasChanged = tempAnswer !== (myBet?.answer || '');

                    // Helper to determine status color
                    let statusColor = 'bg-green-50 text-green-700 border-green-200';
                    let statusText = 'Offen';
                    if (isExpired) {
                        statusColor = 'bg-slate-100 text-slate-500 border-slate-200';
                        statusText = 'Geschlossen';
                    }
                    if (bq.correctAnswer && isExpired) {
                        // If graded
                        const isCorrect = myBet?.answer.toLowerCase().trim() === bq.correctAnswer.toLowerCase().trim();
                        statusColor = isCorrect ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-50 text-red-800 border-red-200';
                        statusText = isCorrect ? `Richtig (+${bq.points})` : `Falsch (Lösung: ${bq.correctAnswer})`;
                    }

                    return (
                        <div key={bq.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center text-xs text-slate-500">
                                    <Calendar size={12} className="mr-1" />
                                    Deadline: {deadline.toLocaleDateString()} {deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${statusColor}`}>
                                    {statusText}
                                </span>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-start">
                                    <span className="bg-f1-pink text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 shrink-0 mt-0.5">?</span>
                                    {bq.question}
                                </h3>
                                
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        disabled={isExpired}
                                        value={tempAnswer}
                                        onChange={(e) => setTempAnswer(e.target.value)}
                                        placeholder="Deine Antwort..."
                                        className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-f1-pink disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                    {!isExpired && (
                                        <button 
                                            onClick={() => submitBonusBet(bq.id, tempAnswer)}
                                            disabled={!hasChanged || !tempAnswer}
                                            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-f1-pink disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
                                        >
                                            Speichern
                                        </button>
                                    )}
                                </div>
                                <div className="mt-2 text-right text-xs font-bold text-f1-pink">{bq.points} Punkte</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const LeaderboardView = () => {
        const leaderboard = getLeaderboard();
        
        return (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold uppercase text-slate-700 text-sm">Saison {currentSeason}</h3>
                    <div className="text-xs text-slate-500">{leaderboard.length} Spieler</div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
                        <tr>
                            <th className="p-4 w-16 text-center">Rang</th>
                            <th className="p-4">User</th>
                            <th className="p-4 text-center">Siege</th>
                            <th className="p-4 text-right">Punkte</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {leaderboard.map((entry) => (
                            <tr key={entry.userId} className={entry.userId === currentUser.id ? 'bg-pink-50' : 'hover:bg-slate-50'}>
                                <td className="p-4 text-center font-display font-bold text-lg text-slate-400">
                                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                                </td>
                                <td className="p-4 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 overflow-hidden mr-3">
                                        <img src={entry.avatar || `https://ui-avatars.com/api/?name=${entry.username}`} className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`font-bold ${entry.userId === currentUser.id ? 'text-f1-pink' : 'text-slate-900'}`}>
                                        {entry.username}
                                    </span>
                                </td>
                                <td className="p-4 text-center text-sm font-bold text-slate-600">
                                    {entry.wins}
                                </td>
                                <td className="p-4 text-right">
                                    <span className="bg-slate-900 text-white px-3 py-1 rounded font-display font-bold">
                                        {entry.points}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {leaderboard.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400 italic">Noch keine Punkte in dieser Saison.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    const RulesView = () => {
        const [localRacePts, setLocalRacePts] = useState(settings.racePoints.join(', '));
        const [localQualiPts, setLocalQualiPts] = useState(settings.qualiPoints.join(', '));

        const handleSaveRules = () => {
            updateSettings({
                ...settings,
                racePoints: localRacePts.split(',').map(n => parseInt(n.trim())),
                qualiPoints: localQualiPts.split(',').map(n => parseInt(n.trim()))
            });
            alert('Regeln gespeichert!');
        };

        return (
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                        <CheckCircle className="text-f1-pink mr-2" /> Punkteregeln {currentSeason}
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex items-start">
                            <span className="font-bold mr-2 text-slate-900">• Exakter Treffer:</span>
                            Volle Punktzahl für die jeweilige Position.
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold mr-2 text-slate-900">• Teil-Treffer:</span>
                            {settings.participationPoint} Punkt, wenn der Fahrer in den Top-Rängen ist, aber auf der falschen Position.
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold mr-2 text-slate-900">• Gleichstand:</span>
                            Bei Punktegleichstand entscheidet die Anzahl der Spieltagssiege.
                        </li>
                    </ul>
                </div>

                {canManageGame && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center text-slate-900">
                            <Settings className="text-slate-400 mr-2" /> Admin Einstellungen
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Rennen Punkte</label>
                                <input 
                                    value={localRacePts} 
                                    onChange={(e) => setLocalRacePts(e.target.value)}
                                    className="w-full border p-2 rounded text-sm" 
                                    placeholder="10, 8, 6, 5..."
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Punkte für P1, P2, P3... kommagetrennt</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Qualifying Punkte</label>
                                <input 
                                    value={localQualiPts} 
                                    onChange={(e) => setLocalQualiPts(e.target.value)}
                                    className="w-full border p-2 rounded text-sm" 
                                    placeholder="4, 3, 2, 1"
                                />
                            </div>
                            <button onClick={handleSaveRules} className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-bold uppercase hover:bg-f1-pink">
                                Regelwerk Speichern
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20 pt-8 font-sans">
            <div className="container mx-auto px-4">
                
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-2 uppercase italic">Tippspiel {currentSeason}</h1>
                    <p className="text-slate-500">Messe dich mit der Community und zeige dein F1 Wissen.</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-full border border-slate-200 shadow-sm flex flex-wrap justify-center gap-1">
                        <button onClick={() => setActiveTab('bet')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeTab === 'bet' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                            Tippen
                        </button>
                        <button onClick={() => setActiveTab('bonus')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeTab === 'bonus' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                            Bonusfragen
                        </button>
                        <button onClick={() => setActiveTab('leaderboard')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeTab === 'leaderboard' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                            Tabelle
                        </button>
                        <button onClick={() => setActiveTab('rules')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeTab === 'rules' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                            Regeln
                        </button>
                    </div>
                </div>

                {activeTab === 'bet' && (
                    <>
                        <div className="max-w-3xl mx-auto"><RaceSelector /></div>
                        <BettingForm />
                    </>
                )}

                {activeTab === 'bonus' && <BonusQuestionsView />}

                {activeTab === 'leaderboard' && <LeaderboardView />}
                
                {activeTab === 'rules' && <RulesView />}

            </div>
        </div>
    );
};

export default PredictionPage;
