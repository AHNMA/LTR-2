
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { UserBet, PredictionSettings, BonusQuestion, UserBonusBet, SessionType, RoundStatus } from '../types';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';

// Default Settings
const DEFAULT_SETTINGS: PredictionSettings = {
    id: 'global',
    currentSeason: new Date().getFullYear(),
    racePoints: [10, 8, 6, 5, 4, 3, 2, 1],
    qualiPoints: [5, 4, 3, 2, 1],
    participationPoint: 1
};

interface LeaderboardEntry {
    userId: string;
    username: string;
    avatar: string;
    points: number;
    wins: number; 
    rank: number;
}

interface PredictionContextType {
    bets: UserBet[];
    bonusQuestions: BonusQuestion[];
    userBonusBets: UserBonusBet[];
    settings: PredictionSettings;
    submitBet: (raceId: string, sessionType: SessionType, drivers: string[]) => Promise<void>;
    submitBonusBet: (questionId: string, answer: string) => void;
    updateSettings: (newSettings: PredictionSettings) => Promise<void>;
    getLeaderboard: () => LeaderboardEntry[];
    getUserBet: (raceId: string, sessionType: SessionType, userId: string) => UserBet | undefined;
    
    // Management
    addBonusQuestion: (question: BonusQuestion) => Promise<void>;
    updateBonusQuestion: (question: BonusQuestion) => Promise<void>;
    deleteBonusQuestion: (id: string) => Promise<void>;
    setRoundStatus: (raceId: string, sessionType: SessionType, status: RoundStatus) => Promise<void>;
    getRoundStatus: (raceId: string, sessionType: SessionType) => RoundStatus | undefined;
    isBettingClosed: (raceId: string, sessionType: SessionType, deadline: string) => boolean;
    canManageGame: boolean;
    
    currentSeason: number;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export const PredictionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { results } = useData();
    const { users, currentUser } = useAuth();
    
    // Version signal for UI updates
    const [predictionVersion, setPredictionVersion] = useState(0);
    const forceUpdate = () => setPredictionVersion(v => v + 1);

    // 1. Load Settings from DB first
    const dbSettings = useLiveQuery(() => db.settings.get('global'), [predictionVersion]);
    const settings = dbSettings || DEFAULT_SETTINGS;
    const currentSeason = settings.currentSeason;

    // 2. Fetch Bets & Questions filtered by Season (dep on predictionVersion)
    const bets = useLiveQuery(() => db.bets.where('season').equals(currentSeason).toArray(), [currentSeason, predictionVersion]) || [];
    const bonusQuestions = useLiveQuery(() => db.bonusQuestions.where('season').equals(currentSeason).toArray(), [currentSeason, predictionVersion]) || [];
    const predictionStates = useLiveQuery(() => db.predictionState.toArray(), [predictionVersion]) || [];
    
    // Init Settings & Standard Questions if missing
    useEffect(() => {
        const initGame = async () => {
            // Check if settings exist
            const existingSettings = await db.settings.get('global');
            if (!existingSettings) {
                await db.settings.put(DEFAULT_SETTINGS);
                forceUpdate();
            }

            // Check standard questions for this season
            const seasonQs = await db.bonusQuestions.where('season').equals(currentSeason).toArray();
            const hasDriverChamp = seasonQs.some(q => q.question.includes('Fahrer-Weltmeister'));
            const hasConstChamp = seasonQs.some(q => q.question.includes('Konstrukteurs-Weltmeister'));

            const standardQs: BonusQuestion[] = [];
            const deadline = `${currentSeason}-03-01T00:00`; // Approximate start of season

            if (!hasDriverChamp) {
                standardQs.push({ 
                    id: `bq-driver-${currentSeason}`, 
                    season: currentSeason,
                    question: `Wer wird Fahrer-Weltmeister ${currentSeason}?`, 
                    points: 10, 
                    deadline: deadline 
                });
            }
            if (!hasConstChamp) {
                standardQs.push({ 
                    id: `bq-const-${currentSeason}`, 
                    season: currentSeason,
                    question: `Wer wird Konstrukteurs-Weltmeister ${currentSeason}?`, 
                    points: 10, 
                    deadline: deadline 
                });
            }

            if (standardQs.length > 0) {
                await db.bonusQuestions.bulkAdd(standardQs);
                forceUpdate();
            }
        };
        initGame();
    }, [currentSeason]);

    // Mock local storage for User Bonus Bets (should be DB in real app, simplified here)
    const [userBonusBets, setUserBonusBets] = useState<UserBonusBet[]>([]);

    const canManageGame = !!currentUser && ['admin', 'editor', 'author', 'it', 'moderator'].includes(currentUser.role);

    const submitBet = async (raceId: string, sessionType: SessionType, drivers: string[]) => {
        if (!currentUser) return;
        
        const betId = `${currentUser.id}-${raceId}-${sessionType}-${currentSeason}`;
        const newBet: UserBet = {
            id: betId,
            userId: currentUser.id,
            season: currentSeason,
            raceId,
            sessionType,
            drivers,
            timestamp: new Date().toISOString()
        };
        await db.bets.put(newBet);
        forceUpdate();
    };

    const submitBonusBet = (questionId: string, answer: string) => {
        if (!currentUser) return;
        setUserBonusBets(prev => {
            const filtered = prev.filter(b => !(b.userId === currentUser.id && b.questionId === questionId));
            return [...filtered, { userId: currentUser.id, questionId, answer }];
        });
        // Note: Bonus bets are local state in this demo, no DB forceUpdate needed
    };

    const updateSettings = async (newSettings: PredictionSettings) => {
        if (canManageGame) {
            await db.settings.put({ ...newSettings, id: 'global' });
            forceUpdate();
        }
    };

    // --- BONUS QUESTION MANAGEMENT ---
    const addBonusQuestion = async (question: BonusQuestion) => {
        await db.bonusQuestions.put({ ...question, season: currentSeason });
        forceUpdate();
    };

    const updateBonusQuestion = async (question: BonusQuestion) => {
        await db.bonusQuestions.put(question);
        forceUpdate();
    };

    const deleteBonusQuestion = async (id: string) => {
        await db.bonusQuestions.delete(id);
        forceUpdate();
    };

    // --- ROUND MANAGEMENT ---
    const setRoundStatus = async (raceId: string, sessionType: SessionType, status: RoundStatus) => {
        const id = `${raceId}-${sessionType}`;
        await db.predictionState.put({ id, status });
        forceUpdate();
    };

    const getRoundStatus = (raceId: string, sessionType: SessionType): RoundStatus | undefined => {
        const id = `${raceId}-${sessionType}`;
        return predictionStates.find(s => s.id === id)?.status;
    };

    const isBettingClosed = (raceId: string, sessionType: SessionType, deadline: string): boolean => {
        const status = getRoundStatus(raceId, sessionType);
        
        // Manual override takes precedence
        if (status === 'locked' || status === 'settled') return true;
        if (status === 'open') return false;

        // Default to time-based if no manual status set
        const now = new Date();
        const deadlineDate = new Date(deadline);
        return now > deadlineDate;
    };

    const getUserBet = (raceId: string, sessionType: SessionType, userId: string) => {
        return bets.find(b => b.raceId === raceId && b.sessionType === sessionType && b.userId === userId && b.season === currentSeason);
    };

    // --- SCORING LOGIC ---
    const calculatePointsForBet = (bet: UserBet): number => {
        // Only calculate if bet is in current season
        if (bet.season !== currentSeason) return 0;

        const sessionResult = results.find(r => r.raceId === bet.raceId && r.sessionType === bet.sessionType);
        
        if (!sessionResult || sessionResult.entries.length === 0) return 0;

        const sortedEntries = [...sessionResult.entries].sort((a, b) => {
            const posA = parseInt(a.position) || 999;
            const posB = parseInt(b.position) || 999;
            return posA - posB;
        });

        const isRaceOrSprint = bet.sessionType === 'race' || bet.sessionType === 'sprint';
        const pointSystem = isRaceOrSprint ? settings.racePoints : settings.qualiPoints;
        const maxSlots = pointSystem.length;

        let totalPoints = 0;

        bet.drivers.forEach((predictedDriverId, index) => {
            if (index >= maxSlots) return;
            const actualDriverAtPos = sortedEntries[index]?.driverId;
            
            if (actualDriverAtPos === predictedDriverId) {
                totalPoints += pointSystem[index];
            } else {
                const actualTopXIds = sortedEntries.slice(0, maxSlots).map(e => e.driverId);
                if (actualTopXIds.includes(predictedDriverId)) {
                    totalPoints += settings.participationPoint;
                }
            }
        });
        return totalPoints;
    };
    
    // Calculate Bonus Points
    const calculateBonusPoints = (userId: string): number => {
        let pts = 0;
        userBonusBets.filter(b => b.userId === userId).forEach(bet => {
            const question = bonusQuestions.find(q => q.id === bet.questionId && q.season === currentSeason);
            if (question && question.correctAnswer) {
                if (bet.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
                    pts += question.points;
                }
            }
        });
        return pts;
    };

    const getLeaderboard = (): LeaderboardEntry[] => {
        const stats: Record<string, { points: number, wins: number }> = {};
        users.forEach(u => stats[u.id] = { points: 0, wins: 0 });

        const sessionPerformances: Record<string, Record<string, number>> = {}; 

        // 1. Process Race Bets
        bets.forEach(bet => {
            const pts = calculatePointsForBet(bet);
            if (!stats[bet.userId]) stats[bet.userId] = { points: 0, wins: 0 };
            
            stats[bet.userId].points += pts;

            const sessionKey = `${bet.raceId}-${bet.sessionType}`;
            if (!sessionPerformances[sessionKey]) sessionPerformances[sessionKey] = {};
            sessionPerformances[sessionKey][bet.userId] = pts;
        });

        // 2. Process Bonus Bets
        users.forEach(u => {
            const bonusPts = calculateBonusPoints(u.id);
             if (!stats[u.id]) stats[u.id] = { points: 0, wins: 0 };
             stats[u.id].points += bonusPts;
        });

        // 3. Calculate Wins (Session highscores)
        Object.values(sessionPerformances).forEach(sessionScores => {
            let maxScore = -1;
            Object.values(sessionScores).forEach(score => {
                if (score > maxScore) maxScore = score;
            });
            
            if (maxScore > 0) {
                Object.keys(sessionScores).forEach(userId => {
                    if (sessionScores[userId] === maxScore) {
                        if (stats[userId]) stats[userId].wins += 1;
                    }
                });
            }
        });

        const leaderboard = Object.keys(stats).map(userId => {
            const user = users.find(u => u.id === userId);
            return {
                userId,
                username: user?.username || 'Unknown',
                avatar: user?.avatar || '',
                points: stats[userId].points,
                wins: stats[userId].wins,
                rank: 0 
            };
        });

        leaderboard.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.wins - a.wins;
        });

        return leaderboard.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    };

    return (
        <PredictionContext.Provider value={{
            bets,
            bonusQuestions,
            userBonusBets,
            settings,
            submitBet,
            submitBonusBet,
            updateSettings,
            getLeaderboard,
            getUserBet,
            addBonusQuestion,
            updateBonusQuestion,
            deleteBonusQuestion,
            setRoundStatus,
            getRoundStatus,
            isBettingClosed,
            canManageGame,
            currentSeason
        }}>
            {children}
        </PredictionContext.Provider>
    );
};

export const usePrediction = () => {
    const context = useContext(PredictionContext);
    if (context === undefined) {
        throw new Error('usePrediction must be used within a PredictionProvider');
    }
    return context;
};
