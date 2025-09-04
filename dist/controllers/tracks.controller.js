"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrackFile = exports.uploadTrackFile = exports.removeTracks = exports.removeTrack = exports.updateTrackById = exports.addTrack = exports.getTrack = exports.getAllTracks = void 0;
const db_1 = require("../utils/db");
const slug_1 = require("../utils/slug");
/**
 * Get all tracks with pagination, sorting, and filtering
 */
const getAllTracks = async (request, reply) => {
    try {
        const { tracks, total } = await (0, db_1.getTracks)(request.query);
        const page = request.query.page || 1;
        const limit = request.query.limit || 10;
        const response = {
            data: tracks,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
        return reply.code(200).send(response);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
exports.getAllTracks = getAllTracks;
/**
 * Get a track by its slug
 */
const getTrack = async (request, reply) => {
    try {
        const { slug } = request.params;
        const track = await (0, db_1.getTrackBySlug)(slug);
        if (!track) {
            return reply.code(404).send({ error: 'Track not found' });
        }
        return reply.code(200).send(track);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
exports.getTrack = getTrack;
/**
 * Create a new track
 */
const addTrack = async (request, reply) => {
    try {
        const { title, artist, album = "", genres = [], coverImage = "" } = request.body;
        if (!title || !artist) {
            return reply.code(400).send({ error: 'Title and artist are required' });
        }
        if (!genres || !Array.isArray(genres)) {
            return reply.code(400).send({ error: 'Genres must be an array' });
        }
        const slug = (0, slug_1.createSlug)(title);
        const existingTrack = await (0, db_1.getTrackBySlug)(slug);
        if (existingTrack) {
            return reply.code(409).send({ error: 'A track with this title already exists' });
        }
        const newTrack = await (0, db_1.createTrack)({
            title,
            artist,
            album,
            genres,
            coverImage,
            slug
        });
        return reply.code(201).send(newTrack);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
exports.addTrack = addTrack;
/**
 * Update a track by ID
 */
const updateTrackById = async (request, reply) => {
    try {
        const { id } = request.params;
        const { title, artist, album, genres, coverImage } = request.body;
        const existingTrack = await (0, db_1.getTrackById)(id);
        if (!existingTrack) {
            return reply.code(404).send({ error: 'Track not found' });
        }
        // If title is being updated, update the slug as well
        let updates = { ...request.body };
        if (title && title !== existingTrack.title) {
            const newSlug = (0, slug_1.createSlug)(title);
            // Check if the new slug already exists on a different track
            const trackWithSameSlug = await (0, db_1.getTrackBySlug)(newSlug);
            if (trackWithSameSlug && trackWithSameSlug.id !== id) {
                return reply.code(409).send({ error: 'A track with this title already exists' });
            }
            updates.slug = newSlug;
        }
        const updatedTrack = await (0, db_1.updateTrack)(id, updates);
        return reply.code(200).send(updatedTrack);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
exports.updateTrackById = updateTrackById;
/**
 * Delete a track by ID
 */
const removeTrack = async (request, reply) => {
    try {
        const { id } = request.params;
        const success = await (0, db_1.deleteTrack)(id);
        if (!success) {
            return reply.code(404).send({ error: 'Track not found' });
        }
        return reply.code(204).send();
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
exports.removeTrack = removeTrack;
/**
 * Delete multiple tracks
 */
const removeTracks = async (request, reply) => {
    try {
        const { ids } = request.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return reply.code(400).send({ error: 'Track IDs are required' });
        }
        const results = await (0, db_1.deleteMultipleTracks)(ids);
        return reply.code(200).send(results);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
exports.removeTracks = removeTracks;
/**
 * Upload an audio file for a track
 */
const uploadTrackFile = async (request, reply) => {
    try {
        const { id } = request.params;
        const existingTrack = await (0, db_1.getTrackById)(id);
        if (!existingTrack) {
            return reply.code(404).send({ error: 'Track not found' });
        }
        const data = await request.file();
        if (!data) {
            return reply.code(400).send({ error: 'No file uploaded' });
        }
        // Validate file type
        const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
        if (!allowedMimeTypes.includes(data.mimetype)) {
            return reply.code(400).send({
                error: 'Invalid file type. Only MP3 and WAV files are allowed.'
            });
        }
        // Get file buffer
        const buffer = await data.toBuffer();
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (buffer.length > maxSize) {
            return reply.code(400).send({
                error: 'File is too large. Maximum size is 10MB.'
            });
        }
        // Save file and update track
        const fileName = await (0, db_1.saveAudioFile)(id, data.filename, buffer);
        const updatedTrack = await (0, db_1.updateTrack)(id, { audioFile: fileName });
        return reply.code(200).send(updatedTrack);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
exports.uploadTrackFile = uploadTrackFile;
/**
 * Delete an audio file from a track
 */
const deleteTrackFile = async (request, reply) => {
    try {
        const { id } = request.params;
        const existingTrack = await (0, db_1.getTrackById)(id);
        if (!existingTrack) {
            return reply.code(404).send({ error: 'Track not found' });
        }
        if (!existingTrack.audioFile) {
            return reply.code(404).send({ error: 'Track has no audio file' });
        }
        const success = await (0, db_1.deleteAudioFile)(id);
        if (!success) {
            return reply.code(500).send({ error: 'Failed to delete audio file' });
        }
        const updatedTrack = await (0, db_1.getTrackById)(id);
        return reply.code(200).send(updatedTrack);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
exports.deleteTrackFile = deleteTrackFile;
//# sourceMappingURL=tracks.controller.js.map