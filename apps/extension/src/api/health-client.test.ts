import { describe, expect, it } from 'vitest';
import { fetchApiStatus } from './health-client';

describe('fetchApiStatus', () => {
  it('returns ok for a successful response and calls the health path', async () => {
    let requested = '';
    const status = await fetchApiStatus('https://api.example.test', (url) => {
      requested = url;
      return Promise.resolve({ ok: true });
    });
    expect(status).toBe('ok');
    expect(requested).toBe('https://api.example.test/v1/health');
  });

  it('returns unreachable for an error response', async () => {
    expect(await fetchApiStatus('https://x', () => Promise.resolve({ ok: false }))).toBe(
      'unreachable',
    );
  });

  it('returns unreachable when the request throws', async () => {
    const failing = () => Promise.reject(new Error('offline'));
    expect(await fetchApiStatus('https://x', failing)).toBe('unreachable');
  });
});
