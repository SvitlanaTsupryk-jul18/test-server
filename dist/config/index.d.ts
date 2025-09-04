/**
 * Configuration object with validated environment variables
 */
declare const config: {
    isProduction: boolean;
    isTest: boolean;
    isDevelopment: boolean;
    server: {
        port: number;
        host: string;
        env: "test" | "development" | "production";
    };
    storage: {
        dataDir: string;
        tracksDir: string;
        uploadsDir: string;
        genresFile: string;
    };
    cors: {
        origin: string;
    };
    logger: {
        level: "silent" | "error" | "debug" | "trace" | "fatal" | "warn" | "info";
    };
    upload: {
        maxFileSize: number;
    };
};
export default config;
