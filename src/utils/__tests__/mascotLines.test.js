import { describe, it, expect } from 'vitest';
import { getSetupQuip, getCatchQuip } from '../mascotLines.js';

describe('getSetupQuip', () => {
  it('mystery + deep + risky → specific triple-combo line', () => {
    const line = getSetupQuip('deepWater', 'mysteryLure', 'riskyCast');
    expect(line).toMatch(/genius or a fool/i);
  });

  it('mystery lure alone → mystery-lure line', () => {
    const line = getSetupQuip('dock', 'mysteryLure', 'safeCast');
    expect(line).toMatch(/nobody knows/i);
  });

  it('risky + deep (no mystery) → ambition line', () => {
    const line = getSetupQuip('deepWater', 'spinner', 'riskyCast');
    expect(line).toMatch(/ambition/i);
  });

  it('dock + worm + safe → classic line', () => {
    const line = getSetupQuip('dock', 'worm', 'safeCast');
    expect(line).toMatch(/classic/i);
  });

  it('frog lure → frog line', () => {
    const line = getSetupQuip('reeds', 'frog', 'precisionCast');
    expect(line).toMatch(/frog/i);
  });

  it('unknown combo → default line', () => {
    const line = getSetupQuip('rockyBank', 'jig', 'powerCast');
    expect(line).toMatch(/biting today/i);
  });

  it('triple-combo match takes priority over single-field match', () => {
    const line = getSetupQuip('deepWater', 'mysteryLure', 'riskyCast');
    expect(line).not.toMatch(/nobody knows/i);
  });
});

describe('getCatchQuip', () => {
  it('legendary → 30-year lake line', () => {
    expect(getCatchQuip('legendary')).toMatch(/30 years/i);
  });
  it('epic → get the camera', () => {
    expect(getCatchQuip('epic')).toMatch(/camera/i);
  });
  it('rare → keeper', () => {
    expect(getCatchQuip('rare')).toMatch(/keeper/i);
  });
  it('uncommon → solid catch', () => {
    expect(getCatchQuip('uncommon')).toMatch(/solid/i);
  });
  it('common → next cast', () => {
    expect(getCatchQuip('common')).toMatch(/next cast/i);
  });
  it('unknown rarity falls back to common line', () => {
    expect(getCatchQuip('mythic')).toMatch(/next cast/i);
  });
});
