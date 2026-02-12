
import Dexie, { Table } from 'dexie';
import { User, Post, Team, Driver, Race, SessionResult, UserBet, BonusQuestion, PredictionRoundState, PredictionSettings, MediaItem } from '../types';

export type PolePositionDB = Dexie & {
  users: Table<User>;
  posts: Table<Post>;
  teams: Table<Team>;
  drivers: Table<Driver>;
  races: Table<Race>;
  results: Table<SessionResult>;
  bets: Table<UserBet>;
  bonusQuestions: Table<BonusQuestion>;
  predictionState: Table<PredictionRoundState>;
  settings: Table<PredictionSettings>;
  media: Table<MediaItem>;
};

const db = new Dexie('PolePositionDB') as PolePositionDB;

db.version(1).stores({
  users: 'id, username, email',
  posts: 'id, section, date',
  teams: 'id, slug',
  drivers: 'id, teamId, slug',
  races: 'id, status',
  results: '++id, [raceId+sessionType]',
  bets: 'id, userId, [raceId+sessionType]'
});

// Version 2: Add 'round' index to races table
db.version(2).stores({
  races: 'id, status, round'
});

// Version 3: Add bonus questions and manual prediction state
db.version(3).stores({
  bonusQuestions: 'id',
  predictionState: 'id' // id = raceId-sessionType
});

// Version 4: Add settings table and update bets/bonus for season support
db.version(4).stores({
  settings: 'id',
  bets: 'id, userId, season, [raceId+sessionType]',
  bonusQuestions: 'id, season'
});

// Version 5: Add media table
db.version(5).stores({
  media: 'id, name, type, uploadedAt'
});

// Version 6: Add 'order' index for manual sorting
db.version(6).stores({
  teams: 'id, slug, order',
  drivers: 'id, teamId, slug, order'
});

// Version 7: Maintenance bump to ensure clean state triggers
db.version(7).stores({}).upgrade(tx => {
    // No schema changes, just version bump to force sync check
});

export { db };
