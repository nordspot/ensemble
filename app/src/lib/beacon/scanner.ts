// Extend Navigator for Web Bluetooth API (experimental)
declare global {
  interface Navigator {
    bluetooth?: unknown;
  }
}

/**
 * Core BLE iBeacon scanner using the Web Bluetooth API.
 *
 * Parses iBeacon advertisements, buffers RSSI for noise reduction,
 * estimates distance, and detects zone transitions with hysteresis.
 */

import {
  APPLE_COMPANY_ID,
  SCAN_INTERVAL_MS,
  RSSI_BUFFER_SIZE,
  ZONE_HYSTERESIS_COUNT,
} from './constants';
import { resolveZone, type BeaconConfig, type ZoneInfo } from './zone-resolver';

// ── Types ─────────────────────────────────────────────────────────

export interface ParsedBeacon {
  uuid: string;
  major: number;
  minor: number;
  txPower: number;
  rssi: number;
  distance: number;
}

export interface TrackedBeacon extends ParsedBeacon {
  id: string;
  lastSeen: number;
}

export type BeaconFoundCallback = (beacon: TrackedBeacon) => void;
export type ZoneChangeCallback = (zone: ZoneInfo | null, previous: ZoneInfo | null) => void;

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Parse an iBeacon manufacturer-specific data payload.
 *
 * Layout (after company ID bytes):
 *   [0]    0x02  (beacon type high byte)
 *   [1]    0x15  (beacon type low byte / length = 21)
 *   [2-17] UUID  (16 bytes)
 *   [18-19] Major (uint16 BE)
 *   [20-21] Minor (uint16 BE)
 *   [22]   TX Power (int8, calibrated at 1 m)
 */
function parseIBeacon(
  manufacturerData: DataView,
  rssi: number,
): ParsedBeacon | null {
  // Minimum length: 2 (type) + 16 (uuid) + 2 (major) + 2 (minor) + 1 (tx) = 23
  if (manufacturerData.byteLength < 23) return null;

  const typeHigh = manufacturerData.getUint8(0);
  const typeLow = manufacturerData.getUint8(1);
  if (typeHigh !== 0x02 || typeLow !== 0x15) return null;

  // UUID bytes 2..17
  const uuidBytes: string[] = [];
  for (let i = 2; i <= 17; i++) {
    uuidBytes.push(manufacturerData.getUint8(i).toString(16).padStart(2, '0'));
  }
  const uuid = [
    uuidBytes.slice(0, 4).join(''),
    uuidBytes.slice(4, 6).join(''),
    uuidBytes.slice(6, 8).join(''),
    uuidBytes.slice(8, 10).join(''),
    uuidBytes.slice(10, 16).join(''),
  ].join('-');

  const major = manufacturerData.getUint16(18, false); // big-endian
  const minor = manufacturerData.getUint16(20, false);
  const txPower = manufacturerData.getInt8(22);

  const distance = estimateDistance(rssi, txPower);

  return { uuid, major, minor, txPower, rssi, distance };
}

/**
 * Estimate distance in metres from RSSI and calibrated TX power.
 */
function estimateDistance(rssi: number, txPower: number): number {
  if (rssi === 0) return -1;

  const ratio = rssi / txPower;
  if (ratio < 1) {
    return Math.pow(ratio, 10);
  }
  return 0.89976 * Math.pow(ratio, 7.7095) + 0.111;
}

/**
 * Return the median of a numeric array.
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// ── Scanner Class ─────────────────────────────────────────────────

export class BeaconScanner {
  private scanning = false;
  private scanTimer: ReturnType<typeof setInterval> | null = null;
  private rssiBuffers = new Map<string, number[]>();
  private trackedBeacons = new Map<string, TrackedBeacon>();

  // Zone hysteresis
  private currentZone: ZoneInfo | null = null;
  private candidateZone: ZoneInfo | null = null;
  private candidateCount = 0;

  // Callbacks
  public onBeaconFound: BeaconFoundCallback | null = null;
  public onZoneChange: ZoneChangeCallback | null = null;

  constructor(private beaconConfig: BeaconConfig) {}

  /**
   * Check whether the Web Bluetooth API is available.
   */
  static isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      'bluetooth' in navigator &&
      typeof (navigator.bluetooth as Record<string, unknown>)?.requestLEScan === 'function'
    );
  }

  /**
   * Start scanning for iBeacons.
   */
  async start(): Promise<void> {
    if (this.scanning) return;

    if (!BeaconScanner.isSupported()) {
      throw new Error('Web Bluetooth scanning is not supported in this browser.');
    }

    this.scanning = true;

    try {
      // Request BLE scan — filters for Apple manufacturer data
      const bluetooth = navigator.bluetooth as unknown as {
        requestLEScan(options: {
          filters: Array<{ manufacturerData: Array<{ companyIdentifier: number }> }>;
          keepRepeatedDevices: boolean;
        }): Promise<{ stop(): void }>;
        addEventListener(event: string, handler: (e: unknown) => void): void;
        removeEventListener(event: string, handler: (e: unknown) => void): void;
      };

      const scan = await bluetooth.requestLEScan({
        filters: [
          {
            manufacturerData: [{ companyIdentifier: APPLE_COMPANY_ID }],
          },
        ],
        keepRepeatedDevices: true,
      });

      // Listen for advertisement events
      const handler = (event: unknown) => {
        this.handleAdvertisement(event);
      };

      bluetooth.addEventListener('advertisementreceived', handler);

      // Periodic zone evaluation
      this.scanTimer = setInterval(() => {
        this.evaluateZone();
      }, SCAN_INTERVAL_MS);

      // Store cleanup references
      this._cleanupScan = () => {
        scan.stop();
        bluetooth.removeEventListener('advertisementreceived', handler);
      };
    } catch (err) {
      this.scanning = false;
      throw err;
    }
  }

  /**
   * Stop scanning.
   */
  stop(): void {
    if (!this.scanning) return;
    this.scanning = false;

    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }

    this._cleanupScan?.();
    this._cleanupScan = undefined;

    this.rssiBuffers.clear();
    this.trackedBeacons.clear();
    this.candidateZone = null;
    this.candidateCount = 0;
  }

  /**
   * Get all currently tracked beacons.
   */
  getTrackedBeacons(): TrackedBeacon[] {
    return Array.from(this.trackedBeacons.values());
  }

  /**
   * Get the current zone.
   */
  getCurrentZone(): ZoneInfo | null {
    return this.currentZone;
  }

  get isScanning(): boolean {
    return this.scanning;
  }

  // ── Internal ──────────────────────────────────────────────────

  private _cleanupScan?: () => void;

  private handleAdvertisement(event: unknown): void {
    const adEvent = event as {
      rssi: number;
      manufacturerData: Map<number, DataView>;
    };

    const data = adEvent.manufacturerData?.get(APPLE_COMPANY_ID);
    if (!data) return;

    const parsed = parseIBeacon(data, adEvent.rssi);
    if (!parsed) return;

    const id = `${parsed.major}:${parsed.minor}`;

    // Buffer RSSI
    let buffer = this.rssiBuffers.get(id);
    if (!buffer) {
      buffer = [];
      this.rssiBuffers.set(id, buffer);
    }
    buffer.push(parsed.rssi);
    if (buffer.length > RSSI_BUFFER_SIZE) {
      buffer.shift();
    }

    // Use median RSSI for distance calculation
    const smoothedRssi = median(buffer);
    const distance = estimateDistance(smoothedRssi, parsed.txPower);

    const tracked: TrackedBeacon = {
      ...parsed,
      id,
      rssi: smoothedRssi,
      distance,
      lastSeen: Date.now(),
    };

    this.trackedBeacons.set(id, tracked);
    this.onBeaconFound?.(tracked);
  }

  private evaluateZone(): void {
    // Prune stale beacons (not seen in 2 scan intervals)
    const staleThreshold = Date.now() - SCAN_INTERVAL_MS * 2;
    for (const [id, beacon] of this.trackedBeacons) {
      if (beacon.lastSeen < staleThreshold) {
        this.trackedBeacons.delete(id);
        this.rssiBuffers.delete(id);
      }
    }

    // Find nearest beacon
    let nearest: TrackedBeacon | null = null;
    for (const beacon of this.trackedBeacons.values()) {
      if (!nearest || beacon.distance < nearest.distance) {
        nearest = beacon;
      }
    }

    const newZone = nearest
      ? resolveZone(this.beaconConfig, nearest.major, nearest.minor)
      : null;

    // Hysteresis: require ZONE_HYSTERESIS_COUNT consecutive scans in new zone
    const newZoneKey = newZone ? `${newZone.zone}:${newZone.roomId}` : null;
    const currentZoneKey = this.currentZone
      ? `${this.currentZone.zone}:${this.currentZone.roomId}`
      : null;

    if (newZoneKey === currentZoneKey) {
      this.candidateZone = null;
      this.candidateCount = 0;
      return;
    }

    const candidateKey = this.candidateZone
      ? `${this.candidateZone.zone}:${this.candidateZone.roomId}`
      : null;

    if (newZoneKey === candidateKey) {
      this.candidateCount++;
    } else {
      this.candidateZone = newZone;
      this.candidateCount = 1;
    }

    if (this.candidateCount >= ZONE_HYSTERESIS_COUNT) {
      const previous = this.currentZone;
      this.currentZone = this.candidateZone;
      this.candidateZone = null;
      this.candidateCount = 0;
      this.onZoneChange?.(this.currentZone, previous);
    }
  }
}
