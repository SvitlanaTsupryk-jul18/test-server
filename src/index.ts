import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import path from 'path';
import routes from './routes';
import { initializeDb } from './utils/db';
import config from './config';

// Singleton Fastify instance for cold/warm start
let fastify: FastifyInstance | undefined;

async function buildServer(): Promise<FastifyInstance> {
  if (!fastify) {
    fastify = Fastify({ logger: false });

    await initializeDb();

    await fastify.register(cors, {
      origin: config.cors.origin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: config.upload.maxFileSize,
      }
    });

    await fastify.register(fastifyStatic, {
      root: config.storage.uploadsDir,
      prefix: '/api/files/',
      decorateReply: false,
    });

    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Music Tracks API',
          description: 'API for managing music tracks',
          version: '1.0.0',
        }
      }
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true
      }
    });

    await fastify.register(routes);

    await fastify.ready();
  }
  return fastify;
}

// Vercel Serverless Function Handler for TypeScript
import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const app = await buildServer();
  app.server.emit('request', req, res);
}