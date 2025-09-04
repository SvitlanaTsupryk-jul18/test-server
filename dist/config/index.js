"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Determine which .env file to load based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
// Check if the env file exists
const envPath = path_1.default.resolve(process.cwd(), envFile);
const fallbackPath = path_1.default.resolve(process.cwd(), '.env');
// Load environment variables from .env file
const env = fs_1.default.existsSync(envPath)
    ? dotenv_1.default.config({ path: envPath })
    : fs_1.default.existsSync(fallbackPath)
        ? dotenv_1.default.config({ path: fallbackPath })
        : dotenv_1.default.config();
dotenv_expand_1.default.expand(env);
/**
 * Define a schema for the environment variables using Zod
 */
const envSchema = zod_1.z.object({
    // Server settings
    PORT: zod_1.z.string().default('8000').transform(Number),
    HOST: zod_1.z.string().default('0.0.0.0'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // File storage settings
    DATA_DIR: zod_1.z.string().default('./data'),
    TRACKS_DIR: zod_1.z.string().default('./data/tracks'),
    UPLOADS_DIR: zod_1.z.string().default('./data/uploads'),
    GENRES_FILE: zod_1.z.string().default('./data/genres.json'),
    // CORS settings
    CORS_ORIGIN: zod_1.z.string().default('*'),
    // Logging
    LOG_LEVEL: zod_1.z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    // File upload settings
    MAX_FILE_SIZE: zod_1.z.string().default('10485760').transform(Number) // 10MB in bytes
});
/**
 * Validate the environment variables against the schema
 */
const envVars = envSchema.safeParse(process.env);
if (!envVars.success) {
    console.error('❌ Invalid environment variables:', envVars.error.flatten().fieldErrors);
    process.exit(1);
}
/**
 * Configuration object with validated environment variables
 */
const config = {
    isProduction: envVars.data.NODE_ENV === 'production',
    isTest: envVars.data.NODE_ENV === 'test',
    isDevelopment: envVars.data.NODE_ENV === 'development',
    server: {
        port: envVars.data.PORT,
        host: envVars.data.HOST,
        env: envVars.data.NODE_ENV
    },
    storage: {
        dataDir: path_1.default.resolve(process.cwd(), envVars.data.DATA_DIR),
        tracksDir: path_1.default.resolve(process.cwd(), envVars.data.TRACKS_DIR),
        uploadsDir: path_1.default.resolve(process.cwd(), envVars.data.UPLOADS_DIR),
        genresFile: path_1.default.resolve(process.cwd(), envVars.data.GENRES_FILE)
    },
    cors: {
        origin: envVars.data.CORS_ORIGIN
    },
    logger: {
        level: envVars.data.LOG_LEVEL
    },
    upload: {
        maxFileSize: envVars.data.MAX_FILE_SIZE
    }
};
exports.default = config;
//# sourceMappingURL=index.js.map