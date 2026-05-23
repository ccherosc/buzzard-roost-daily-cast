import { describe, it, expect } from 'vitest';
import { getSetupQuip, getCatchQuip, getSpotQuip, getSpotLureQuip } from '../mascotLines.js';

describe('getSpotQuip', () => {
  it('dock → calm water commentary', () => {
    expect(getSpotQuip('dock')).toMatch(/dock|calm|consistent/i);
  });
  it('deepWater → depth/serious commentary', () => {
    expect(getSpotQuip('deepWater')).toMatch(/deep|serious|big/i);
  });
  it('unknown spot → fallback', () => {
    expect(getSpotQuip('moonbase')).toBeTruthy();
  });
});

describe('getSpotLureQuip', () => {
  it('reeds + frog → classic setup line', () => {
    const line = getSpotLureQuip('reeds', 'frog');
    expect(line).toMatch(/frog|classic|reeds/i);
  });
  it('dock + worm → reliable commentary', () => {
    const line = getSpotLureQuip('dock', 'worm');
    expect(line).toMatch(/dock|worm|reliable|something/i);
  });
  it('unknown combo → null (falls back to caller)', () => {
    const line = getSpotLureQuip('moonbase', 'laserBait');
    expect(line).toBeNull();
  });
});

describe('getSetupQuip', () => {
  it('mystery + deep + risky → specific triple-combo line (genius or fool)', () => {
    const line = getSetupQuip('deepWater', 'mysteryLure', 'riskyCast');
    expect(line).toMatch(/genius or a fool/i);
  });

  it('dock + mysteryLure + safeCast → mystery lure at dock line', () => {
    // Full combo or spot+lure match for dock+mysteryLure takes precedence
    const line = getSetupQuip('dock', 'mysteryLure', 'safeCast');
    expect(line).toMatch(/mystery|dock/i);
  });

  it('deepWater + spinner + riskyCast → risk-level fallback line', () => {
    // No specific full combo; falls to risk-score quip (score 3+1+3=7 → high risk)
    const line = getSetupQuip('deepWater', 'spinner', 'riskyCast');
    expect(line).toMatch(/risk|line|lose|nobody/i);
  });

  it('dock + worm + safeCast → safe/classic line', () => {
    const line = getSetupQuip('dock', 'worm', 'safeCast');
    expect(line).toMatch(/dock|worm|classic|safe|catch/i);
  });

  it('reeds + frog + precisionCast → precision frog line', () => {
    const line = getSetupQuip('reeds', 'frog', 'precisionCast');
    expect(line).toMatch(/frog|precision|classic|reeds/i);
  });

  it('rockyBank + jig + powerCast → jig/rocky line (spot+lure quip)', () => {
    // Falls through to spot+lure quip for rockyBank+jig
    const line = getSetupQuip('rockyBank', 'jig', 'powerCast');
    expect(line).toMatch(/jig|rock|bottom/i);
  });

  it('triple-combo match takes priority over spot+lure match', () => {
    const line = getSetupQuip('deepWater', 'mysteryLure', 'riskyCast');
    // Should be the triple-combo line, not just any mystery-lure line
    expect(line).toMatch(/genius or a fool/i);
  });
});

describe('getCatchQuip', () => {
  it('legendary → rare fish reaction', () => {
    expect(getCatchQuip('legendary')).toMatch(/no way|30 years|camera/i);
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
