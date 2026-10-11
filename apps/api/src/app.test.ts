import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import type { AppConfig } from './config/config.js';

const testConfig: AppConfig = {
  host: '127.0.0.1',
  port: 3000,
  databaseUrl: 'postgres://unused',
  requestBodyLimitBytes: 1024,
  pageSizeMax: 100,
  logLevel: 'silent',
};

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe('api app', () => {
  it('reports liveness', async () => {
    app = await buildApp(testConfig);
    const response = await app.inject({ method: 'GET', url: '/v1/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('sets security headers and disables caching', async () => {
    app = await buildApp(testConfig);
    const response = await app.inject({ method: 'GET', url: '/v1/health' });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('returns the standard error payload with 404 for unknown routes', async () => {
    app = await buildApp(testConfig);
    const response = await app.inject({ method: 'GET', url: '/v1/nope' });
    expect(response.statusCode).toBe(404);
    const body = response.json<{ error: { code: string; requestId: string } }>();
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.requestId).toBeTruthy();
  });

  it('rejects oversized bodies with 413', async () => {
    app = await buildApp(testConfig);
    app.post('/v1/echo', () => ({}));
    const response = await app.inject({
      method: 'POST',
      url: '/v1/echo',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ data: 'x'.repeat(testConfig.requestBodyLimitBytes * 2) }),
    });
    expect(response.statusCode).toBe(413);
    expect(response.json<{ error: { code: string } }>().error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});
