
import { Team, Driver, Race, User, Post, MediaItem } from '../types';

// HINWEIS: Das Passwort ist für diese Mock-User im AuthContext immer "password" (oder beliebig, da keine echte Prüfung stattfindet).
export const INITIAL_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@poleposition.com',
    firstName: 'Max',
    lastName: 'Mustermann',
    avatar: 'https://ui-avatars.com/api/?name=Max+Mustermann&background=e10059&color=fff',
    role: 'admin', // DARF in den Admin-Bereich
    joinedDate: '2025-01-01',
    socials: {},
    isVerified: true
  },
  {
    id: '2',
    username: 'redakteur',
    email: 'editor@poleposition.com',
    firstName: 'Sabine',
    lastName: 'Schreiber',
    avatar: 'https://ui-avatars.com/api/?name=Sabine+Schreiber',
    role: 'editor', // DARF in den Admin-Bereich
    joinedDate: '2025-01-15',
    socials: {},
    isVerified: true
  },
  {
    id: '3',
    username: 'moderator',
    email: 'mod@poleposition.com',
    firstName: 'Mo',
    lastName: 'Derator',
    avatar: 'https://ui-avatars.com/api/?name=Mo+Derator',
    role: 'moderator', // DARF in den Admin-Bereich
    joinedDate: '2025-02-01',
    socials: {},
    isVerified: true
  },
  {
    id: '4',
    username: 'user',
    email: 'user@gmail.com',
    firstName: 'Hans',
    lastName: 'Meier',
    avatar: '',
    role: 'user', // DARF NICHT in den Admin-Bereich
    joinedDate: '2025-02-10',
    socials: {},
    isVerified: true
  },
  {
    id: '5',
    username: 'vip',
    email: 'vip@poleposition.com',
    firstName: 'Viktor',
    lastName: 'Important',
    avatar: '',
    role: 'vip', // DARF NICHT in den Admin-Bereich (laut Anforderung)
    joinedDate: '2025-02-12',
    socials: {},
    isVerified: true
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 't-rb',
    name: 'Red Bull Racing',
    slug: 'red-bull-racing',
    color: '#061D41',
    logo: 'https://upload.wikimedia.org/wikipedia/de/c/c4/Red_Bull_Racing_logo.svg',
    carImage: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/red-bull-racing.png',
    nationalityFlag: 'at',
    nationalityText: 'Österreich',
    entryYear: 2005,
    teamPrincipal: 'Christian Horner',
    base: 'Milton Keynes, UK',
    chassis: 'RB21',
    powerUnit: 'Honda RBPTH003',
    socials: { instagram: '#' },
    bio: 'Red Bull Racing ist eines der erfolgreichsten Teams der modernen Formel-1-Geschichte...',
    gallery: [],
    points: 0,
    rank: 0,
    trend: 'same',
    order: 1
  },
  {
    id: 't-mcl',
    name: 'McLaren',
    slug: 'mclaren',
    color: '#FF8000',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/66/McLaren_Racing_logo.svg/1200px-McLaren_Racing_logo.svg.png',
    carImage: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/mclaren.png',
    nationalityFlag: 'gb',
    nationalityText: 'Großbritannien',
    entryYear: 1966,
    teamPrincipal: 'Andrea Stella',
    base: 'Woking, UK',
    chassis: 'MCL39',
    powerUnit: 'Mercedes-AMG F1 M16',
    socials: { instagram: '#', twitter: '#' },
    bio: 'McLaren ist eines der traditionsreichsten Teams...',
    gallery: [],
    points: 0,
    rank: 0,
    trend: 'up',
    order: 2
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'd-ver',
    firstName: 'Max',
    lastName: 'Verstappen',
    slug: 'max-verstappen',
    raceNumber: 3, 
    teamId: 't-rb',
    image: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png',
    nationalityFlag: 'nl',
    nationalityText: 'Niederlande',
    dob: '1997-09-30',
    birthplace: 'Hasselt, Belgien',
    height: 181,
    weight: 72,
    maritalStatus: 'Ledig',
    socials: { instagram: '#' },
    bio: 'Max Emilian Verstappen ist ein niederländisch-belgischer Rennfahrer...',
    gallery: [],
    rank: 0,
    points: 0,
    trend: 'same',
    order: 1
  },
  {
    id: 'd-nor',
    firstName: 'Lando',
    lastName: 'Norris',
    slug: 'lando-norris',
    raceNumber: 1, 
    teamId: 't-mcl',
    image: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png',
    nationalityFlag: 'gb',
    nationalityText: 'Großbritannien',
    dob: '1999-11-13',
    birthplace: 'Bristol, UK',
    height: 170,
    weight: 68,
    maritalStatus: 'Ledig',
    socials: { instagram: '#' },
    bio: 'Lando Norris ist ein britischer Automobilrennfahrer...',
    gallery: [],
    rank: 0,
    points: 0,
    trend: 'up',
    order: 2
  }
];

export const INITIAL_RACES: Race[] = [
  {
    id: 'r-1',
    round: 1,
    country: 'Bahrain',
    city: 'Sakhir',
    circuitName: 'Bahrain International Circuit',
    flag: 'bh',
    format: 'standard',
    status: 'next',
    trackMap: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245032/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Bahrain%20carbon.png.transform/2col/image.png',
    sessions: {
      fp1: '2026-03-05T12:30',
      fp2: '2026-03-05T16:00',
      fp3: '2026-03-06T13:30',
      qualifying: '2026-03-06T17:00',
      race: '2026-03-07T16:00',
    }
  },
  {
    id: 'r-2',
    round: 2,
    country: 'Saudi Arabia',
    city: 'Jeddah',
    circuitName: 'Jeddah Corniche Circuit',
    flag: 'sa',
    format: 'standard',
    status: 'upcoming',
    trackMap: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Saudi%20Arabia%20carbon.png.transform/2col/image.png',
    sessions: {
      fp1: '2026-03-13T14:30',
      fp2: '2026-03-13T18:00',
      fp3: '2026-03-14T14:30',
      qualifying: '2026-03-14T18:00',
      race: '2026-03-15T18:00',
    }
  }
];

// Helper to seed initial media from existing assets
const createMediaItem = (url: string, name: string): MediaItem => ({
    id: Math.random().toString(36).substr(2, 9),
    url,
    name,
    type: 'image/jpeg',
    size: 1024 * 50, // Mock size
    uploadedAt: new Date().toISOString(),
    dimensions: { width: 800, height: 600 }
});

export const INITIAL_MEDIA: MediaItem[] = [
    createMediaItem('https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png', 'Verstappen Portrait'),
    createMediaItem('https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png', 'Norris Portrait'),
    createMediaItem('https://upload.wikimedia.org/wikipedia/de/c/c4/Red_Bull_Racing_logo.svg', 'RB Logo'),
    createMediaItem('https://upload.wikimedia.org/wikipedia/en/thumb/6/66/McLaren_Racing_logo.svg/1200px-McLaren_Racing_logo.svg.png', 'McLaren Logo'),
    createMediaItem('https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/red-bull-racing.png', 'RB Car'),
    createMediaItem('https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/mclaren.png', 'McLaren Car'),
    createMediaItem('https://picsum.photos/800/600?random=1', 'Article Hero 1'),
    createMediaItem('https://picsum.photos/600/400?random=10', 'Article Thumb 1'),
];
