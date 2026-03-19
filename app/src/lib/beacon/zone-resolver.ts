/**
 * Maps iBeacon (major, minor) pairs to named zones.
 */

export interface ZoneInfo {
  zone: string;
  roomId: string;
  floor: string;
}

export type BeaconConfig = Map<string, ZoneInfo>;

/**
 * Build a lookup key from major/minor values.
 */
export function beaconKey(major: number, minor: number): string {
  return `${major}:${minor}`;
}

/**
 * Resolve a beacon's (major, minor) to its zone info.
 * Returns null if the beacon is not mapped.
 */
export function resolveZone(
  config: BeaconConfig,
  major: number,
  minor: number,
): ZoneInfo | null {
  return config.get(beaconKey(major, minor)) ?? null;
}
