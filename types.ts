
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
}

export interface GalleryImage {
  url: string;
  caption?: string;
}

export type UserRole = 'admin' | 'it' | 'editor' | 'author' | 'moderator' | 'vip' | 'user';

export interface User {
  id: string; // Numerical string "1", "2"...
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string; // URL or Base64
  role: UserRole;
  website?: string;
  bio?: string;
  socials: SocialLinks;
  joinedDate: string;
  isBanned?: boolean;
  isVerified?: boolean; // New field for email verification
}

export interface MediaItem {
  id: string;
  name: string;
  url: string; // Base64 or External URL
  type: string; // e.g. 'image/jpeg'
  size: number; // in bytes
  dimensions?: { width: number; height: number };
  uploadedAt: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  color: string; // Hex Code
  logo: string; // URL
  carImage: string; // URL
  nationalityFlag: string; // Emoji or URL
  nationalityText: string;
  entryYear: number;
  teamPrincipal: string;
  base: string;
  chassis: string;
  powerUnit: string;
  socials: SocialLinks;
  bio: string; // max 1500 chars
  gallery: string[]; // URLs
  points: number; // Calculated field
  rank: number;   // Calculated field
  trend: 'up' | 'down' | 'same';
  order?: number; // Manual display order
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  raceNumber: number;
  teamId: string | null; // ID reference to Team, null if inactive/free agent
  slug: string;
  image: string; // URL
  nationalityFlag: string;
  nationalityText: string;
  dob: string; // YYYY-MM-DD
  birthplace: string;
  height: number; // cm
  weight: number; // kg
  maritalStatus: string;
  socials: SocialLinks;
  bio: string; // max 1500 chars
  gallery: string[]; // URLs
  
  // Performance Data (Calculated)
  rank: number;
  points: number;
  trend: 'up' | 'down' | 'same';
  order?: number; // Manual display order (e.g. Driver 1 vs Driver 2)
}

export interface DriverStanding {
  rank: number;
  driverId: string;
  points: number;
  wins: number;
  podiums: number;
  positionHistory: number[]; // For countback (number of 1st, 2nd, 3rd places...)
  trend: 'up' | 'down' | 'same';
}

export interface Constructor {
  rank: number;
  name: string;
  points: number;
  logo: string;
  trend: 'up' | 'down' | 'same';
}

// --- RACE CALENDAR TYPES ---

export type RaceFormat = 'standard' | 'sprint';
export type RaceStatus = 'upcoming' | 'next' | 'live' | 'completed' | 'cancelled';
export type SessionType = 'fp1' | 'fp2' | 'fp3' | 'qualifying' | 'sprintQuali' | 'sprint' | 'race';

export interface RaceSessions {
  fp1?: string; // ISO Date String
  fp2?: string;
  fp3?: string;
  qualifying?: string;
  sprintQuali?: string;
  sprint?: string;
  race: string; // Main event
}

export interface Race {
  id: string;
  round: number; // Acts as order
  country: string;
  city: string;
  circuitName: string;
  flag: string; // Emoji or URL
  format: RaceFormat;
  status: RaceStatus;
  sessions: RaceSessions;
  trackMap?: string; // Image URL
}

// --- RESULTS TYPES ---

export interface ResultEntry {
    driverId: string;
    teamId: string; // Snapshot of team at that time
    position: string; // "1", "2", "DNF", "DNS"
    time: string; // Gap or Time
    laps: number;
    points: number;
    grid?: number; // Starting position
    q1?: string;
    q2?: string;
    q3?: string;
}

export interface SessionResult {
    raceId: string;
    sessionType: SessionType;
    entries: ResultEntry[];
    distancePercentage?: 25 | 50 | 75 | 100; // For race points calculation
}

export type PostSection = 'hero' | 'recent' | 'trending' | 'grid' | 'feed';

export type BlockType = 'paragraph' | 'heading-h2' | 'heading-h3' | 'image' | 'quote' | 'gallery' | 'video' | 'key-facts' | 'embed';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string; // Text content, Image URL, or Video URL
  caption?: string; // For images/videos
  items?: string[]; // For gallery images or list items (key facts)
}

export interface Post {
  id: string;
  title: string;
  excerpt?: string;
  content?: string; // Plain text fallback for excerpts/legacy
  blocks?: ContentBlock[]; // New structured content
  author: string;
  date: string;
  image: string;
  heroCaption?: string; // Credits/Description for hero image
  heroCredits?: string;
  tags: string[];
  commentCount: number;
  readTime: string; // e.g., "3 minutes read"
  section: PostSection; // Determines where the post appears
}

export interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

// --- PREDICTION GAME TYPES ---

export interface PredictionSettings {
    id?: string; // usually 'global'
    currentSeason: number; // e.g. 2026
    racePoints: number[]; // e.g. [8, 7, 6, 5, 4, 3, 2, 1] for exact match
    qualiPoints: number[]; // e.g. [4, 3, 2, 1] for exact match
    participationPoint: number; // Point for incorrect position but in list
}

export interface UserBet {
    id: string;
    userId: string;
    season: number; // Year
    raceId: string;
    sessionType: SessionType; // 'race' | 'qualifying' | 'sprint' | 'sprintQuali'
    drivers: string[]; // Array of DriverIDs in order (P1, P2, P3...)
    timestamp: string;
}

export interface BonusQuestion {
    id: string;
    season: number;
    question: string;
    points: number;
    deadline: string; // ISO Date
    correctAnswer?: string; // Set by admin later
}

export interface UserBonusBet {
    userId: string;
    questionId: string;
    answer: string;
}

// New type for managing round status manually
export type RoundStatus = 'open' | 'locked' | 'settled';

export interface PredictionRoundState {
    id: string; // composite: raceId-sessionType
    status: RoundStatus;
}
