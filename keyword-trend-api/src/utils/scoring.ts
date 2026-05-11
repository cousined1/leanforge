// src/utils/scoring.ts

export interface SnapshotData {
  currentInterest: number;
  searchVolume?: number;
  velocity7d: number;
  velocity30d: number;
  direction7d: string;
  direction30d?: string;
}

/**
 * Composite Trend Score (0-100)
 *
 * Signals and weights:
 * - Interest velocity (7d): 30%  — Is it spiking NOW?
 * - Interest velocity (30d): 15% — Sustained growth?
 * - Current interest level: 25% — Absolute popularity
 * - Search volume: 15%          — Real search demand
 * - Direction consistency: 15%  — Rising for 7+ consecutive days
 */
export function calculateTrendScore(snapshot: SnapshotData): number {
  // Normalize each signal to 0-100
  const velocity7dScore = normalize(Math.abs(snapshot.velocity7d || 0), 0, 200); // 0-200% change
  const velocity30dScore = normalize(Math.abs(snapshot.velocity30d || 0), 0, 100);
  const interestScore = normalize(snapshot.currentInterest, 0, 100);
  const volumeScore = snapshot.searchVolume
    ? normalize(Math.log10(snapshot.searchVolume + 1), 0, 6) // log scale for huge range
    : 50; // default mid if no volume data
  const consistencyScore =
    snapshot.direction7d === 'rising' ? 80 : snapshot.direction7d === 'flat' ? 40 : 20;

  const composite =
    velocity7dScore * 0.3 +
    velocity30dScore * 0.15 +
    interestScore * 0.25 +
    volumeScore * 0.15 +
    consistencyScore * 0.15;

  return Math.round(Math.min(100, Math.max(0, composite)));
}

/**
 * Calculate velocity (% change) between two values
 */
export function velocity(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Determine trend direction from velocity
 */
export function direction(
  velocity7d: number,
  velocity30d: number
): 'rising' | 'falling' | 'flat' {
  if (velocity7d > 10 && velocity30d > 0) return 'rising';
  if (velocity7d < -10 || velocity30d < -10) return 'falling';
  return 'flat';
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}
