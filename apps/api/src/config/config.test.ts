import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';

const validEnv = {
  HEARTHKEY_API_HOST: '0.0.0.0',
  HEARTHKEY_API_PORT: '3000',
  HEARTHKEY_DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
  HEARTHKEY_REQUEST_BODY_LIMIT_BYTES: '1048576',
  HEARTHKEY_PAGE_SIZE_MAX: '100',
  HEARTHKEY_LOG_LEVEL: 'info',
};

describe('loadConfig', () => {
  it('parses a valid environment', () => {
    expect(loadConfig(validEnv)).toEqual({
      host: '0.0.0.0',
      port: 3000,
      databaseUrl: validEnv.HEARTHKEY_DATABASE_URL,
      requestBodyLimitBytes: 1048576,
      pageSizeMax: 100,
      logLevel: 'info',
    });
  });

  it('fails fast when a value is missing', () => {
    const { HEARTHKEY_API_PORT: _omitted, ...incomplete } = validEnv;
    expect(() => loadConfig(incomplete)).toThrow();
  });

  it('rejects out-of-range values', () => {
    expect(() => loadConfig({ ...validEnv, HEARTHKEY_API_PORT: '0' })).toThrow();
  });

  it('rejects an unknown log level', () => {
    expect(() => loadConfig({ ...validEnv, HEARTHKEY_LOG_LEVEL: 'loud' })).toThrow();
  });
});
