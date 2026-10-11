import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import type { AppConfig } from './config/config.js';
import { errorHandler, notFoundHandler } from './http/error-handler.js';
import { registerHealthRoutes } from './http/health-routes.js';

/** Header names whose values must never be written to logs. */
const REDACTED_LOG_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

export async function buildApp(config: AppConfig): Promise<FastifyInstance> {
  const app = Fastify({
    bodyLimit: config.requestBodyLimitBytes,
    logger: { level: config.logLevel, redact: REDACTED_LOG_PATHS },
    trustProxy: true,
  });

  await app.register(helmet);
  app.addHook('onSend', (_request, reply, payload, done) => {
    void reply.header('Cache-Control', 'no-store');
    done(null, payload);
  });

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);
  registerHealthRoutes(app);

  return app;
}
