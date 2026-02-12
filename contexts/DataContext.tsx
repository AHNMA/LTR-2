
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Team, Driver, Race, SessionResult } from '../types';

interface DataContextType {
  teams: Team[];
  drivers: Driver[];
  races: Race[];
  results: SessionResult[];
  addTeam: (team: Team) => Promise<any>;
  updateTeam: (team: Team) => Promise<any>;
  deleteTeam: (id: string) => Promise<void>;
  getTeam: (id: string) => Team | undefined;
  addDriver: (driver: Driver) => Promise<any>;
  updateDriver: (driver: Driver) => Promise<any>;
  deleteDriver: (id: string) => Promise<void>;
  getDriver: (id: string) => Driver | undefined;
  getDriversByTeam: (teamId: string) => Driver[];
  addRace: (race: Race) => Promise<any>;
  updateRace: (race: Race) => Promise<any>;
  deleteRace: (id: string) => Promise<void>;
  getRace: (id: string) => Race | undefined;
  updateSessionResult: (result: SessionResult) => Promise<void>;
  getSessionResult: (raceId: string, type: string) => SessionResult | undefined;
  recalculateStandings: () => Promise<void>;
  reorderEntities: (collection: 'teams' | 'drivers' | 'races', orderedItems: any[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Add a version signal to force refreshes if Dexie auto-observation lags
  const [dataVersion, setDataVersion] = useState(0);

  const forceUpdate = () => setDataVersion(v => v + 1);

  // Use dataVersion in deps to force re-query on manual triggers
  // Sort Teams by 'order' asc
  const teams = useLiveQuery(() => db.teams.orderBy('order').toArray(), [dataVersion]) || [];
  
  // Sort Drivers by 'order' asc (Global display order, usually implicitly Team Order + Driver #)
  const drivers = useLiveQuery(() => db.drivers.orderBy('order').toArray(), [dataVersion]) || [];
  
  // Sort Races by 'round' (which effectively acts as order)
  const races = useLiveQuery(() => db.races.orderBy('round').toArray(), [dataVersion]) || [];
  
  const results = useLiveQuery(() => db.results.toArray(), [dataVersion]) || [];

  // Standings Calculation
  const calculateAndSetStandings = async () => {
    const allDrivers = await db.drivers.toArray();
    const allTeams = await db.teams.toArray();
    const allResults = await db.results.toArray();

    const driverStats: Record<string, { points: number, positions: number[] }> = {};
    const teamStats: Record<string, { points: number, positions: number[] }> = {};

    allDrivers.forEach(d => driverStats[d.id] = { points: 0, positions: [] });
    allTeams.forEach(t => teamStats[t.id] = { points: 0, positions: [] });

    allResults.forEach(session => {
        if (session.sessionType === 'race' || session.sessionType === 'sprint') {
            session.entries.forEach(entry => {
                const pts = Number(entry.points) || 0;
                
                if (driverStats[entry.driverId]) {
                    driverStats[entry.driverId].points += pts;
                    const pos = parseInt(entry.position);
                    if (!isNaN(pos)) {
                        driverStats[entry.driverId].positions.push(pos);
                    }
                }
                if (entry.teamId && teamStats[entry.teamId]) {
                    teamStats[entry.teamId].points += pts;
                }
            });
        }
    });

    // Helper for sorting based on points (Rank)
    const sortDrivers = (a: any, b: any) => {
        const statA = driverStats[a.id];
        const statB = driverStats[b.id];
        if (statB.points !== statA.points) return statB.points - statA.points;
        return 0; // Simplified countback
    };

    const sortTeams = (a: any, b: any) => {
        return teamStats[b.id].points - teamStats[a.id].points;
    };

    // Prepare updates - ONLY update rank/points/trend, do NOT touch 'order'
    const sortedDriversByPoints = [...allDrivers].sort(sortDrivers);
    const driverUpdates = sortedDriversByPoints.map((d, idx) => {
        const stats = driverStats[d.id];
        const newRank = idx + 1;
        let trend: 'up' | 'down' | 'same' = 'same';
        if (d.rank > 0 && d.rank !== newRank) trend = newRank < d.rank ? 'up' : 'down';
        
        return {
            key: d.id,
            changes: { points: stats.points, rank: newRank, trend }
        };
    });

    const sortedTeamsByPoints = [...allTeams].sort(sortTeams);
    const teamUpdates = sortedTeamsByPoints.map((t, idx) => {
        const stats = teamStats[t.id];
        const newRank = idx + 1;
        let trend: 'up' | 'down' | 'same' = 'same';
        if (t.rank > 0 && t.rank !== newRank) trend = newRank < t.rank ? 'up' : 'down';

        return {
            key: t.id,
            changes: { points: stats.points, rank: newRank, trend }
        };
    });

    // Execute bulk update
    await db.transaction('rw', db.drivers, db.teams, () => {
        driverUpdates.forEach(u => db.drivers.update(u.key, u.changes));
        teamUpdates.forEach(u => db.teams.update(u.key, u.changes));
    });
  };

  // Wrapper for operations to ensure standings are updated and UI is notified
  const addTeam = async (team: Team) => {
      // Auto-assign order at the end if not provided
      if (team.order === undefined) {
          const count = await db.teams.count();
          team.order = count + 1;
      }
      await db.teams.put(team);
      await calculateAndSetStandings();
      forceUpdate();
  };
  const updateTeam = async (team: Team) => {
      await db.teams.put(team);
      await calculateAndSetStandings();
      forceUpdate();
  };
  const deleteTeam = async (id: string) => {
      await db.transaction('rw', db.teams, db.drivers, async () => {
          await db.teams.delete(id);
          await db.drivers.where({ teamId: id }).modify({ teamId: null });
      });
      await calculateAndSetStandings();
      forceUpdate();
  };
  const getTeam = (id: string) => teams.find(t => t.id === id);

  const addDriver = async (driver: Driver) => {
      if (driver.order === undefined) {
          const count = await db.drivers.count();
          driver.order = count + 1;
      }
      await db.drivers.put(driver);
      await calculateAndSetStandings();
      forceUpdate();
  };
  const updateDriver = async (driver: Driver) => {
      await db.drivers.put(driver);
      await calculateAndSetStandings();
      forceUpdate();
  };
  const deleteDriver = async (id: string) => {
      await db.drivers.delete(id);
      await calculateAndSetStandings();
      forceUpdate();
  };
  const getDriver = (id: string) => drivers.find(d => d.id === id);
  // Returns drivers sorted by their global order (or you could sort locally)
  const getDriversByTeam = (teamId: string) => drivers.filter(d => d.teamId === teamId);

  const addRace = async (race: Race) => {
      // Auto assign next round
      const count = await db.races.count();
      race.round = count + 1;
      await db.races.put(race);
      forceUpdate();
  };
  const updateRace = async (race: Race) => {
      await db.races.put(race);
      forceUpdate();
  };
  const deleteRace = async (id: string) => {
      await db.races.delete(id);
      forceUpdate();
  };
  const getRace = (id: string) => races.find(r => r.id === id);

  const updateSessionResult = async (result: SessionResult) => {
    // Manually handle upsert logic based on composite key (raceId + sessionType)
    const existing = await db.results.where({ raceId: result.raceId, sessionType: result.sessionType }).first();
    if (existing && existing.id) {
        await db.results.put({ ...result, id: existing.id });
    } else {
        const { id, ...cleanResult } = result as any; 
        await db.results.add(cleanResult);
    }
    await calculateAndSetStandings();
    forceUpdate();
  };

  const getSessionResult = (raceId: string, type: string) => {
      return results.find(r => r.raceId === raceId && r.sessionType === type);
  };

  const recalculateStandings = async () => {
      await calculateAndSetStandings();
      forceUpdate();
  };

  const reorderEntities = async (collection: 'teams' | 'drivers' | 'races', orderedItems: any[]) => {
      if (collection === 'races') {
          await db.transaction('rw', db.races, async () => {
              for (let i = 0; i < orderedItems.length; i++) {
                  await db.races.update(orderedItems[i].id, { round: i + 1 });
              }
          });
      } else if (collection === 'teams') {
          await db.transaction('rw', db.teams, async () => {
              for (let i = 0; i < orderedItems.length; i++) {
                  await db.teams.update(orderedItems[i].id, { order: i + 1 });
              }
          });
      } else if (collection === 'drivers') {
          await db.transaction('rw', db.drivers, async () => {
              for (let i = 0; i < orderedItems.length; i++) {
                  await db.drivers.update(orderedItems[i].id, { order: i + 1 });
              }
          });
      }
      forceUpdate();
  };

  return (
    <DataContext.Provider value={{ 
      teams, drivers, races, results,
      addTeam, updateTeam, deleteTeam, getTeam,
      addDriver, updateDriver, deleteDriver, getDriver, getDriversByTeam,
      addRace, updateRace, deleteRace, getRace,
      updateSessionResult, getSessionResult, recalculateStandings, reorderEntities
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
