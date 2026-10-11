import type { FastifyInstance } from 'fastify';

/** Liveness probe: reports that the process is up. Contains no internal details. */
export function registerHealthRoutes(app: FastifyInstance): void {
  app.get('/v1/health', () => ({ status: 'ok' }));
}
