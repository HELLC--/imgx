import { describe, it, expect } from 'vitest';
import { clampPercent, INTRO_KEYFRAMES } from './compare-slider';

describe('clampPercent', () => {
  it('keeps mid values', () => {
    expect(clampPercent(50)).toBe(50);
    expect(clampPercent(33.7)).toBe(33.7);
  });

  it('clamps below 0 to 0', () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(-0.01)).toBe(0);
  });

  it('clamps above 100 to 100', () => {
    expect(clampPercent(101)).toBe(100);
    expect(clampPercent(9999)).toBe(100);
  });

  it('rejects NaN by returning 50', () => {
    expect(clampPercent(Number.NaN)).toBe(50);
  });
});

describe('INTRO_KEYFRAMES', () => {
  it('starts and ends at 50', () => {
    expect(INTRO_KEYFRAMES[0].position).toBe(50);
    expect(INTRO_KEYFRAMES[INTRO_KEYFRAMES.length - 1].position).toBe(50);
  });

  it('has total duration ~1500ms', () => {
    const total = INTRO_KEYFRAMES.reduce((sum, k) => sum + k.delayMs, 0);
    expect(total).toBeGreaterThanOrEqual(1400);
    expect(total).toBeLessThanOrEqual(1700);
  });
});
