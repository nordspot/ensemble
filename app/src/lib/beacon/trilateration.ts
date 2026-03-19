/**
 * Weighted centroid trilateration from the top-3 nearest beacons.
 */

export interface BeaconPosition {
  id: string;
  x: number;
  y: number;
  floor: string;
  distance: number;
}

export interface TrilaterationResult {
  x: number;
  y: number;
  floor: string;
  accuracy: number;
}

/**
 * Compute the user's estimated position using weighted centroid of the
 * closest beacons. Weights are inverse-square of distance.
 *
 * Requires at least 1 beacon with known coordinates.
 * Uses at most the 3 nearest beacons.
 */
export function trilaterate(
  beacons: readonly BeaconPosition[],
): TrilaterationResult | null {
  if (beacons.length === 0) return null;

  // Sort by distance ascending, take top 3
  const sorted = [...beacons].sort((a, b) => a.distance - b.distance);
  const top = sorted.slice(0, 3);

  // Use the floor of the closest beacon
  const floor = top[0].floor;

  // Guard against zero-distance (beacon is right on top of us)
  const MIN_DISTANCE = 0.01;

  let weightSum = 0;
  let xSum = 0;
  let ySum = 0;

  for (const beacon of top) {
    const d = Math.max(beacon.distance, MIN_DISTANCE);
    const weight = 1 / (d * d);
    weightSum += weight;
    xSum += weight * beacon.x;
    ySum += weight * beacon.y;
  }

  if (weightSum === 0) return null;

  const x = xSum / weightSum;
  const y = ySum / weightSum;

  // Accuracy is the weighted average distance (lower = better)
  const accuracy =
    top.reduce((sum, b) => {
      const d = Math.max(b.distance, MIN_DISTANCE);
      const w = 1 / (d * d);
      return sum + w * d;
    }, 0) / weightSum;

  return { x, y, floor, accuracy };
}
