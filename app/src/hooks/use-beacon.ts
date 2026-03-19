'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { BeaconScanner, type TrackedBeacon } from '@/lib/beacon/scanner';
import type { ZoneInfo, BeaconConfig } from '@/lib/beacon/zone-resolver';
import { useBeaconStore } from '@/stores/beacon-store';
import type { PrivacyLevel } from '@/types';

export interface UseBeaconReturn {
  isScanning: boolean;
  currentZone: ZoneInfo | null;
  nearbyBeacons: TrackedBeacon[];
  position: { x: number; y: number; floor: string } | null;
  error: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  isSupported: boolean;
}

/**
 * React hook for BLE iBeacon scanning.
 *
 * Wraps the BeaconScanner class, updates the beacon store,
 * and respects the user's privacy level setting.
 */
export function useBeacon(beaconConfig: BeaconConfig): UseBeaconReturn {
  const scannerRef = useRef<BeaconScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentZone, setCurrentZone] = useState<ZoneInfo | null>(null);
  const [nearbyBeacons, setNearbyBeacons] = useState<TrackedBeacon[]>([]);
  const [error, setError] = useState<string | null>(null);

  const store = useBeaconStore();
  const privacyLevel: PrivacyLevel = store.privacyLevel;

  const isSupported = typeof navigator !== 'undefined' && BeaconScanner.isSupported();

  const startScanning = useCallback(async () => {
    if (privacyLevel === 'off') {
      setError('Standortdienste sind deaktiviert.');
      return;
    }

    if (!isSupported) {
      setError('Web Bluetooth wird von diesem Browser nicht unterstuetzt.');
      return;
    }

    try {
      setError(null);
      const scanner = new BeaconScanner(beaconConfig);

      scanner.onBeaconFound = () => {
        const tracked = scanner.getTrackedBeacons();
        setNearbyBeacons([...tracked]);
        store.setNearbyBeacons(
          tracked.map((b) => ({ id: b.id, rssi: b.rssi, distance: b.distance })),
        );
      };

      scanner.onZoneChange = (zone) => {
        setCurrentZone(zone);
        store.setCurrentZone(zone?.zone ?? null);
      };

      await scanner.start();
      scannerRef.current = scanner;
      setIsScanning(true);
      store.startScanning();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unbekannter Fehler beim Starten des Scanners.';
      setError(message);
    }
  }, [beaconConfig, privacyLevel, isSupported, store]);

  const stopScanning = useCallback(() => {
    scannerRef.current?.stop();
    scannerRef.current = null;
    setIsScanning(false);
    setNearbyBeacons([]);
    store.stopScanning();
  }, [store]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scannerRef.current?.stop();
      scannerRef.current = null;
    };
  }, []);

  // Stop scanning if privacy is turned off
  useEffect(() => {
    if (privacyLevel === 'off' && isScanning) {
      stopScanning();
    }
  }, [privacyLevel, isScanning, stopScanning]);

  // Derive a rough position from the nearest beacon (trilateration is in use-indoor-position)
  const position =
    nearbyBeacons.length > 0
      ? (() => {
          const nearest = nearbyBeacons.reduce((a, b) =>
            a.distance < b.distance ? a : b,
          );
          const zone = currentZone;
          if (zone) {
            return { x: 0, y: 0, floor: zone.floor };
          }
          return null;
        })()
      : null;

  return {
    isScanning,
    currentZone,
    nearbyBeacons,
    position,
    error,
    startScanning,
    stopScanning,
    isSupported,
  };
}
