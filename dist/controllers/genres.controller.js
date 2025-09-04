"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGenres = void 0;
const db_1 = require("../utils/db");
/**
 * Get all available genres
 */
const getAllGenres = async (request, reply) => {
    try {
        const genres = await (0, db_1.getGenres)();
        return reply.code(200).send(genres);
    }
    catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
exports.getAllGenres = getAllGenres;
//# sourceMappingURL=genres.controller.js.map