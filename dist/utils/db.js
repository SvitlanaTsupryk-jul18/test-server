"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAudioFile = exports.saveAudioFile = exports.deleteMultipleTracks = exports.deleteTrack = exports.updateTrack = exports.createTrack = exports.getTrackById = exports.getTrackBySlug = exports.getTracks = exports.getGenres = exports.initializeDb = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
// Determine which paths to use
const isTestMode = process.env.TEST_MODE === 'true';
// Get the paths from config, which will reflect the right environment
const TRACKS_DIR = config_1.default.storage.tracksDir;
const UPLOADS_DIR = config_1.default.storage.uploadsDir;
const GENRES_FILE = config_1.default.storage.genresFile;
// Log paths in development for debugging
if (config_1.default.isDevelopment) {
    console.log('Using storage paths:');
    console.log('TRACKS_DIR:', TRACKS_DIR);
    console.log('UPLOADS_DIR:', UPLOADS_DIR);
    console.log('GENRES_FILE:', GENRES_FILE);
}
// Initialize the data directories
const initializeDb = async () => {
    try {
        await promises_1.default.mkdir(TRACKS_DIR, { recursive: true });
        await promises_1.default.mkdir(UPLOADS_DIR, { recursive: true });
        // Create genres file if it doesn't exist
        try {
            await promises_1.default.access(GENRES_FILE);
        }
        catch {
            // Default genres
            const defaultGenres = [
                'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 'Electronic',
                'R&B', 'Country', 'Folk', 'Reggae', 'Metal', 'Blues', 'Indie'
            ];
            await promises_1.default.writeFile(GENRES_FILE, JSON.stringify(defaultGenres, null, 2));
        }
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};
exports.initializeDb = initializeDb;
/**
 * Get all available music genres
 * @returns Array of genre names
 */
const getGenres = async () => {
    try {
        const data = await promises_1.default.readFile(GENRES_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Failed to read genres:', error);
        return [];
    }
};
exports.getGenres = getGenres;
/**
 * Get tracks with pagination, sorting, and filtering
 * @param params Query parameters for filtering, sorting, and pagination
 * @returns Object containing tracks array and total count
 */
const getTracks = async (params = {}) => {
    try {
        const files = await promises_1.default.readdir(TRACKS_DIR);
        let tracks = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await promises_1.default.readFile(path_1.default.join(TRACKS_DIR, file), 'utf-8');
                tracks.push(JSON.parse(content));
            }
        }
        // Apply filtering
        if (params.search) {
            const searchLower = params.search.toLowerCase();
            tracks = tracks.filter(track => track.title.toLowerCase().includes(searchLower) ||
                track.artist.toLowerCase().includes(searchLower) ||
                (track.album && track.album.toLowerCase().includes(searchLower)));
        }
        if (params.genre) {
            tracks = tracks.filter(track => track.genres.includes(params.genre));
        }
        if (params.artist) {
            const artistLower = params.artist.toLowerCase();
            tracks = tracks.filter(track => track.artist.toLowerCase().includes(artistLower));
        }
        // Apply sorting
        if (params.sort) {
            const sortField = params.sort;
            const sortOrder = params.order || 'asc';
            tracks.sort((a, b) => {
                const valueA = a[sortField] || '';
                const valueB = b[sortField] || '';
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    return sortOrder === 'asc'
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                }
                return 0;
            });
        }
        else {
            // Default sort by createdAt
            tracks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        const total = tracks.length;
        // Apply pagination
        const page = params.page || 1;
        const limit = params.limit || 10;
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            tracks: tracks.slice(start, end),
            total
        };
    }
    catch (error) {
        console.error('Failed to read tracks:', error);
        return { tracks: [], total: 0 };
    }
};
exports.getTracks = getTracks;
/**
 * Get a track by its slug (URL-friendly version of title)
 * @param slug The slug to search for
 * @returns Track object if found, null otherwise
 */
const getTrackBySlug = async (slug) => {
    try {
        const files = await promises_1.default.readdir(TRACKS_DIR);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await promises_1.default.readFile(path_1.default.join(TRACKS_DIR, file), 'utf-8');
                const track = JSON.parse(content);
                if (track.slug === slug) {
                    return track;
                }
            }
        }
        return null;
    }
    catch (error) {
        console.error(`Failed to get track by slug ${slug}:`, error);
        return null;
    }
};
exports.getTrackBySlug = getTrackBySlug;
/**
 * Get a track by its unique ID
 * @param id Unique identifier of the track
 * @returns Track object if found, null otherwise
 */
const getTrackById = async (id) => {
    try {
        const filePath = path_1.default.join(TRACKS_DIR, `${id}.json`);
        const content = await promises_1.default.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        return null;
    }
};
exports.getTrackById = getTrackById;
/**
 * Create a new track and save it to the database
 * @param track Track data without ID and timestamps
 * @returns Complete track object with generated ID and timestamps
 */
const createTrack = async (track) => {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    const newTrack = {
        ...track,
        id,
        createdAt: now,
        updatedAt: now
    };
    await promises_1.default.writeFile(path_1.default.join(TRACKS_DIR, `${id}.json`), JSON.stringify(newTrack, null, 2));
    return newTrack;
};
exports.createTrack = createTrack;
/**
 * Update an existing track with new values
 * @param id ID of the track to update
 * @param updates Partial track object with updated fields
 * @returns Updated track object or null if track not found
 */
const updateTrack = async (id, updates) => {
    try {
        const track = await (0, exports.getTrackById)(id);
        if (!track) {
            return null;
        }
        const updatedTrack = {
            ...track,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        await promises_1.default.writeFile(path_1.default.join(TRACKS_DIR, `${id}.json`), JSON.stringify(updatedTrack, null, 2));
        return updatedTrack;
    }
    catch (error) {
        console.error(`Failed to update track ${id}:`, error);
        return null;
    }
};
exports.updateTrack = updateTrack;
/**
 * Delete a track and its associated audio file
 * @param id ID of the track to delete
 * @returns Boolean indicating success or failure
 */
const deleteTrack = async (id) => {
    try {
        const track = await (0, exports.getTrackById)(id);
        if (!track) {
            return false;
        }
        // Delete track file
        await promises_1.default.unlink(path_1.default.join(TRACKS_DIR, `${id}.json`));
        // Delete associated audio file if it exists
        if (track.audioFile) {
            try {
                await promises_1.default.unlink(path_1.default.join(UPLOADS_DIR, track.audioFile));
            }
            catch (error) {
                console.error(`Failed to delete audio file for track ${id}:`, error);
            }
        }
        return true;
    }
    catch (error) {
        console.error(`Failed to delete track ${id}:`, error);
        return false;
    }
};
exports.deleteTrack = deleteTrack;
/**
 * Delete multiple tracks in a batch operation
 * @param ids Array of track IDs to delete
 * @returns Object containing arrays of successful and failed deletions
 */
const deleteMultipleTracks = async (ids) => {
    const results = {
        success: [],
        failed: []
    };
    for (const id of ids) {
        const success = await (0, exports.deleteTrack)(id);
        if (success) {
            results.success.push(id);
        }
        else {
            results.failed.push(id);
        }
    }
    return results;
};
exports.deleteMultipleTracks = deleteMultipleTracks;
/**
 * Save an uploaded audio file to disk
 * @param id ID of the associated track
 * @param fileName Original name of the uploaded file
 * @param buffer File data buffer
 * @returns Generated filename of the saved file
 */
const saveAudioFile = async (id, fileName, buffer) => {
    const fileExt = path_1.default.extname(fileName);
    const safeFileName = `${id}${fileExt}`;
    const filePath = path_1.default.join(UPLOADS_DIR, safeFileName);
    await promises_1.default.writeFile(filePath, buffer);
    return safeFileName;
};
exports.saveAudioFile = saveAudioFile;
/**
 * Delete an audio file and remove its reference from the track
 * @param id ID of the track with the audio file to delete
 * @returns Boolean indicating success or failure
 */
const deleteAudioFile = async (id) => {
    try {
        const track = await (0, exports.getTrackById)(id);
        if (!track || !track.audioFile) {
            return false;
        }
        await promises_1.default.unlink(path_1.default.join(UPLOADS_DIR, track.audioFile));
        // Update track to remove audioFile reference
        await (0, exports.updateTrack)(id, { audioFile: undefined });
        return true;
    }
    catch (error) {
        console.error(`Failed to delete audio file for track ${id}:`, error);
        return false;
    }
};
exports.deleteAudioFile = deleteAudioFile;
//# sourceMappingURL=db.js.map