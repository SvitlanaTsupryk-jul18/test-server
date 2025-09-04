import { RouteHandler, GetTrackParams, GetTrackByIdParams, UpdateTrackParams, CreateTrackRequest, ListTracksQuery, DeleteTracksRequest, FileUploadParams } from '../types';
/**
 * Get all tracks with pagination, sorting, and filtering
 */
export declare const getAllTracks: RouteHandler<ListTracksQuery>;
/**
 * Get a track by its slug
 */
export declare const getTrack: RouteHandler<GetTrackParams>;
/**
 * Create a new track
 */
export declare const addTrack: RouteHandler<CreateTrackRequest>;
/**
 * Update a track by ID
 */
export declare const updateTrackById: RouteHandler<UpdateTrackParams>;
/**
 * Delete a track by ID
 */
export declare const removeTrack: RouteHandler<GetTrackByIdParams>;
/**
 * Delete multiple tracks
 */
export declare const removeTracks: RouteHandler<DeleteTracksRequest>;
/**
 * Upload an audio file for a track
 */
export declare const uploadTrackFile: RouteHandler<FileUploadParams>;
/**
 * Delete an audio file from a track
 */
export declare const deleteTrackFile: RouteHandler<FileUploadParams>;
