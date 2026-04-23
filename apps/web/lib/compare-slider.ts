export function clampPercent(v: number): number {
  if (Number.isNaN(v)) return 50;
  if (v < 0) return 0;
  if (v > 100) return 100;
  return v;
}

export interface IntroKeyframe {
  position: number;
  delayMs: number;
}

/**
 * Intro animation timeline for the compare slider:
 * starts centered, sweeps to 30%, then 70%, back to 50% to draw attention.
 * Each step's `delayMs` is the time to wait before applying that position.
 */
export const INTRO_KEYFRAMES: readonly IntroKeyframe[] = [
  { position: 50, delayMs: 300 },
  { position: 30, delayMs: 400 },
  { position: 70, delayMs: 400 },
  { position: 50, delayMs: 400 },
] as const;
