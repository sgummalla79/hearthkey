import { describe, expect, it } from 'vitest';
import { API_BASE_URL_ENV_NAME, asOptionalString, loadClientConfig } from './client-config';

describe('loadClientConfig', () => {
  it('returns the base url without a trailing slash', () => {
    const config = loadClientConfig({ apiBaseUrl: 'https://api.example.test/' });
    expect(config.apiBaseUrl).toBe('https://api.example.test');
  });

  it('fails when the value is missing', () => {
    expect(() => loadClientConfig({ apiBaseUrl: undefined })).toThrow(API_BASE_URL_ENV_NAME);
  });

  it('fails when the value is not a url', () => {
    expect(() => loadClientConfig({ apiBaseUrl: 'not a url' })).toThrow();
  });
});

describe('asOptionalString', () => {
  it('keeps strings and drops everything else', () => {
    expect(asOptionalString('x')).toBe('x');
    expect(asOptionalString(undefined)).toBeUndefined();
    expect(asOptionalString(42)).toBeUndefined();
  });
});
