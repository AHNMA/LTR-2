
import { Driver, Team } from '../types';

interface ParsedRow {
    pos: string;
    no: string;
    driverName: string; // Raw name from input
    teamName: string;
    laps: string;
    time: string;
    pts: string;
    q1?: string;
    q2?: string;
    q3?: string;
}

export const POINTS_SYSTEM = {
    race: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    sprint: [8, 7, 6, 5, 4, 3, 2, 1]
};

// Calculate points based on position and type
export const calculatePoints = (pos: string, type: 'race' | 'sprint', distancePct: number = 100): number => {
    const position = parseInt(pos);
    if (isNaN(position)) return 0; // DNF, etc.

    let basePoints = 0;
    const system = POINTS_SYSTEM[type];
    
    if (position <= system.length && position > 0) {
        basePoints = system[position - 1];
    }

    // Handle Reduced Points for Race only
    if (type === 'race' && distancePct < 100) {
        if (distancePct < 25) {
            // Very strict (Top 5 only usually) - Simplified logic based on prompt
             if (position <= 5) return [6, 4, 3, 2, 1][position - 1];
             return 0;
        } else if (distancePct < 50) {
             if (position <= 9) return [13, 10, 8, 6, 5, 4, 3, 2, 1][position - 1];
             return 0;
        } else if (distancePct < 75) {
             if (position <= 10) return [19, 14, 12, 10, 8, 6, 4, 3, 2, 1][position - 1];
             return 0;
        }
    }

    return basePoints;
};

// Match a raw driver name string to a Driver ID from the database
export const findDriverId = (rawName: string, drivers: Driver[]): string | undefined => {
    const cleanRaw = rawName.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // 1. Try exact match on Last Name
    const lastNameMatch = drivers.find(d => cleanRaw.includes(d.lastName.toLowerCase()));
    if (lastNameMatch) return lastNameMatch.id;

    // 2. Try exact match on First Name + Last Name
    const fullNameMatch = drivers.find(d => {
        const full = `${d.firstName} ${d.lastName}`.toLowerCase();
        return cleanRaw.includes(full) || full.includes(cleanRaw);
    });
    if (fullNameMatch) return fullNameMatch.id;
    
    // 3. Try slug
    const slugMatch = drivers.find(d => cleanRaw.includes(d.slug.replace('-', ' ')));
    if (slugMatch) return slugMatch.id;

    return undefined;
};

export const parseHTMLTable = (html: string): ParsedRow[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    
    if (!table) return [];

    const rows = Array.from(table.querySelectorAll('tr'));
    const parsedRows: ParsedRow[] = [];
    
    // Detect Headers to determine type
    const headerCells = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim().toLowerCase() || '');
    let type = 'unknown';
    
    if (headerCells.includes('q1') && headerCells.includes('q2')) type = 'qualifying';
    else if (headerCells.includes('pts') || headerCells.includes('pts.')) type = 'race';
    else if (headerCells.includes('time/gap') || headerCells.includes('gap')) type = 'practice';
    else if (headerCells.includes('time') && !headerCells.includes('laps')) type = 'grid';

    // Helper to get index by header name approx
    const getIdx = (candidates: string[]) => headerCells.findIndex(h => candidates.some(c => h.includes(c)));

    const posIdx = getIdx(['pos']);
    const noIdx = getIdx(['no']);
    const driverIdx = getIdx(['driver']);
    const teamIdx = getIdx(['team', 'car']);
    const lapsIdx = getIdx(['laps']);
    const timeIdx = getIdx(['time', 'gap', 'retired']);
    const ptsIdx = getIdx(['pts']);
    const q1Idx = getIdx(['q1']);
    const q2Idx = getIdx(['q2']);
    const q3Idx = getIdx(['q3']);

    rows.forEach((row, i) => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return;

        const getText = (idx: number) => idx >= 0 && cells[idx] ? cells[idx].textContent?.trim() || '' : '';

        // Clean Driver Name (remove the 3 letter code at end if attached) e.g. "NorrisNOR" -> "Norris"
        let rawDriver = getText(driverIdx);
        // Regex to remove trailing Uppercase 3 letters if attached to a word
        rawDriver = rawDriver.replace(/([a-z])([A-Z]{3})$/, '$1'); 
        rawDriver = rawDriver.replace(/\s+[A-Z]{3}$/, ''); // Remove detached code "Norris NOR"

        const rowData: ParsedRow = {
            pos: getText(posIdx),
            no: getText(noIdx),
            driverName: rawDriver,
            teamName: getText(teamIdx),
            laps: getText(lapsIdx),
            time: getText(timeIdx),
            pts: getText(ptsIdx),
            q1: getText(q1Idx),
            q2: getText(q2Idx),
            q3: getText(q3Idx),
        };

        // Basic validation: needs a position or a driver
        if (rowData.pos || rowData.driverName) {
            parsedRows.push(rowData);
        }
    });

    return parsedRows;
};
