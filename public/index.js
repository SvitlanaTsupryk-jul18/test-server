"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const routes_1 = __importDefault(require("./routes"));
const db_1 = require("./utils/db");
const config_1 = __importDefault(require("./config"));
// Singleton Fastify instance for cold/warm start
let fastify;
async function buildServer() {
    if (!fastify) {
        fastify = (0, fastify_1.default)({ logger: false });
        await (0, db_1.initializeDb)();
        await fastify.register(cors_1.default, {
            origin: config_1.default.cors.origin,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
        await fastify.register(multipart_1.default, {
            limits: {
                fileSize: config_1.default.upload.maxFileSize,
            }
        });
        await fastify.register(static_1.default, {
            root: config_1.default.storage.uploadsDir,
            prefix: '/api/files/',
            decorateReply: false,
        });
        await fastify.register(swagger_1.default, {
            openapi: {
                info: {
                    title: 'Music Tracks API',
                    description: 'API for managing music tracks',
                    version: '1.0.0',
                }
            }
        });
        await fastify.register(swagger_ui_1.default, {
            routePrefix: '/documentation',
            uiConfig: {
                docExpansion: 'list',
                deepLinking: true
            }
        });
        await fastify.register(routes_1.default);
        await fastify.ready();
    }
    return fastify;
}
async function handler(req, res) {
    const app = await buildServer();
    app.server.emit('request', req, res);
}
//# sourceMappingURL=index.js.map