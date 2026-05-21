// src/utils/__tests__/integrity.test.js
import { describe, it, expect } from 'vitest';
import { signResult, addSignature, verifyResult } from '../integrity.js';
import { buildResult } from '../gameLogic.js';

function makeValidResult() {
  const r = buildResult('dock', 'worm', 'safeCast');
  return addSignature(r);
}

describe('signResult', () => {
  it('returns a non-empty string', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    expect(signResult(r)).toBeTruthy();
    expect(typeof signResult(r)).toBe('string');
  });

  it('is deterministic for the same input', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    expect(signResult(r)).toBe(signResult(r));
  });

  it('changes when any field changes', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const sig1 = signResult(r);
    const sig2 = signResult({ ...r, points: r.points + 1 });
    expect(sig1).not.toBe(sig2);
  });
});

describe('addSignature', () => {
  it('adds a sig field', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const signed = addSignature(r);
    expect(signed).toHaveProperty('sig');
  });

  it('sig equals signResult of the unsigned fields', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const signed = addSignature(r);
    const { sig, ...unsigned } = signed;
    expect(sig).toBe(signResult(unsigned));
  });

  it('is idempotent — re-signing a signed result gives the same sig', () => {
    const r = buildResult('dock', 'worm', 'safeCast');
    const signed1 = addSignature(r);
    const signed2 = addSignature(signed1);
    expect(signed1.sig).toBe(signed2.sig);
  });
});

describe('verifyResult', () => {
  it('passes a freshly signed valid result', () => {
    expect(verifyResult(makeValidResult())).toBe(true);
  });

  it('fails when sig is missing', () => {
    const r = makeValidResult();
    delete r.sig;
    expect(verifyResult(r)).toBe(false);
  });

  it('fails when points is tampered up', () => {
    const r = makeValidResult();
    r.points = 999999;
    expect(verifyResult(r)).toBe(false);
  });

  it('fails when rarity is changed to an invalid string', () => {
    const r = makeValidResult();
    r.rarity = 'godlike';
    expect(verifyResult(r)).toBe(false);
  });

  it('fails when fishId does not exist', () => {
    const r = makeValidResult();
    r.fishId = 'fake_fish_xyz';
    expect(verifyResult(r)).toBe(false);
  });

  it('fails when date is in the future', () => {
    const r = makeValidResult();
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    r.date = future.toISOString().split('T')[0];
    // Re-sign with future date so sig check passes, then date check fails
    const { sig: _old, ...unsigned } = r;
    const resigned = addSignature(unsigned);
    expect(verifyResult(resigned)).toBe(false);
  });

  it('fails when weight is above fish max', () => {
    const r = makeValidResult();
    r.weight = 99999;
    expect(verifyResult(r)).toBe(false);
  });

  it('returns false for null/undefined/non-object', () => {
    expect(verifyResult(null)).toBe(false);
    expect(verifyResult(undefined)).toBe(false);
    expect(verifyResult('string')).toBe(false);
  });
});
