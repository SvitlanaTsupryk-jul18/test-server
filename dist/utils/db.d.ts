import { Track, QueryParams, BatchDeleteResponse } from '../types';
/**
 * Result of getTracks with pagination
 */
interface GetTracksResult {
    tracks: Track[];
    total: number;
}
export declare const initializeDb: () => Promise<void>;
/**
 * Get all available music genres
 * @returns Array of genre names
 */
export declare const getGenres: () => Promise<string[]>;
/**
 * Get tracks with pagination, sorting, and filtering
 * @param params Query parameters for filtering, sorting, and pagination
 * @returns Object containing tracks array and total count
 */
export declare const getTracks: (params?: QueryParams) => Promise<GetTracksResult>;
/**
 * Get a track by its slug (URL-friendly version of title)
 * @param slug The slug to search for
 * @returns Track object if found, null otherwise
 */
export declare const getTrackBySlug: (slug: string) => Promise<Track | null>;
/**
 * Get a track by its unique ID
 * @param id Unique identifier of the track
 * @returns Track object if found, null otherwise
 */
export declare const getTrackById: (id: string) => Promise<Track | null>;
/**
 * Create a new track and save it to the database
 * @param track Track data without ID and timestamps
 * @returns Complete track object with generated ID and timestamps
 */
export declare const createTrack: (track: Omit<Track, "id" | "createdAt" | "updatedAt">) => Promise<Track>;
/**
 * Update an existing track with new values
 * @param id ID of the track to update
 * @param updates Partial track object with updated fields
 * @returns Updated track object or null if track not found
 */
export declare const updateTrack: (id: string, updates: Partial<Track>) => Promise<Track | null>;
/**
 * Delete a track and its associated audio file
 * @param id ID of the track to delete
 * @returns Boolean indicating success or failure
 */
export declare const deleteTrack: (id: string) => Promise<boolean>;
/**
 * Delete multiple tracks in a batch operation
 * @param ids Array of track IDs to delete
 * @returns Object containing arrays of successful and failed deletions
 */
export declare const deleteMultipleTracks: (ids: string[]) => Promise<BatchDeleteResponse>;
/**
 * Save an uploaded audio file to disk
 * @param id ID of the associated track
 * @param fileName Original name of the uploaded file
 * @param buffer File data buffer
 * @returns Generated filename of the saved file
 */
export declare const saveAudioFile: (id: string, fileName: string, buffer: Buffer) => Promise<string>;
/**
 * Delete an audio file and remove its reference from the track
 * @param id ID of the track with the audio file to delete
 * @returns Boolean indicating success or failure
 */
export declare const deleteAudioFile: (id: string) => Promise<boolean>;
export {};
