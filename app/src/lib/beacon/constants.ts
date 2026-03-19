/**
 * BLE iBeacon constants for indoor positioning.
 */

/** Apple's Bluetooth SIG company identifier */
export const APPLE_COMPANY_ID = 0x004c;

/** iBeacon advertisement type prefix (0x02 = length, 0x15 = subtype) */
export const IBEACON_TYPE = 0x0215;

/** Interval between BLE scans in milliseconds */
export const SCAN_INTERVAL_MS = 3_000;

/** Number of RSSI readings to buffer per beacon for median filtering */
export const RSSI_BUFFER_SIZE = 5;

/** Consecutive scans required in a new zone before switching (hysteresis) */
export const ZONE_HYSTERESIS_COUNT = 3;

/** Interval for reporting presence to the Durable Object */
export const PRESENCE_REPORT_INTERVAL_MS = 10_000;

/** Heartbeat interval for presence WebSocket */
export const PRESENCE_HEARTBEAT_MS = 30_000;

/** Minimum interval between zone update reports */
export const ZONE_UPDATE_RATE_LIMIT_MS = 5_000;
