import { describe, expect, it } from 'vitest';
import { asItemId, asVaultId } from './ids.js';

describe('branded ids', () => {
  it('keep the underlying string value', () => {
    expect(asVaultId('vault-1')).toBe('vault-1');
    expect(asItemId('item-1')).toBe('item-1');
  });
});
