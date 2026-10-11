import { describe, expect, it } from 'vitest';
import { strings } from '../i18n/strings';
import { statusText } from './status-text';

describe('statusText', () => {
  it('maps every status to its copy', () => {
    expect(statusText('checking')).toBe(strings.apiStatusChecking);
    expect(statusText('ok')).toBe(strings.apiStatusOk);
    expect(statusText('unreachable')).toBe(strings.apiStatusUnreachable);
  });
});
