'use client';

import { useState, useEffect, useRef } from 'react';
import { trilaterate, type BeaconPosition } from '@/lib/beacon/trilateration';
import type { TrackedBeacon } from '@/lib/beacon/scanner';
import type { Beacon } from '@/types';

export interface IndoorPosition {
  x: number;
  y: number;
  floor: string;
}

export interface UseIndoorPositionReturn {
  position: IndoorPosition | null;
  accuracy: number;
  isAvailable: boolean;
}

// ── Simple 2D Kalman filter ────────────────────────────────────

interface KalmanState {
  x: number;
  y: number;
  px: number; // x error covariance
  py: number; // y error covariance
}

const PROCESS_NOISE = 0.008;
const MEASUREMENT_NOISE = 0.1;

function kalmanUpdate(
  state: KalmanState,
  measurementX: number,
  measurementY: number,
): KalmanState {
  // Predict
  const predictedPx = state.px + PROCESS_NOISE;
  const predictedPy = state.py + PROCESS_NOISE;

  // Update
  const kx = predictedPx / (predictedPx + MEASUREMENT_NOISE);
  const ky = predictedPy / (predictedPy + MEASUREMENT_NOISE);

  return {
    x: state.x + kx * (measurementX - state.x),
    y: state.y + ky * (measurementY - state.y),
    px: (1 - kx) * predictedPx,
    py: (1 - ky) * predictedPy,
  };
}

/**
 * React hook for smoothed indoor positioning via trilateration.
 *
 * Takes raw beacon data from use-beacon and known beacon positions,
 * applies trilateration, then smooths with a simple Kalman filter.
 */
export function useIndoorPosition(
  nearbyBeacons: readonly TrackedBeacon[],
  knownBeacons: readonly Beacon[],
): UseIndoorPositionReturn {
  const [position, setPosition] = useState<IndoorPosition | null>(null);
  const [accuracy, setAccuracy] = useState<number>(Infinity);
  const kalmanRef = useRef<KalmanState | null>(null);

  useEffect(() => {
    if (nearbyBeacons.length === 0 || knownBeacons.length === 0) {
      return;
    }

    // Build position list from tracked beacons that have known coordinates
    const knownMap = new Map<string, Beacon>();
    for (const kb of knownBeacons) {
      knownMap.set(`${kb.major}:${kb.minor}`, kb);
    }

    const positions: BeaconPosition[] = [];
    for (const tracked of nearbyBeacons) {
      const known = knownMap.get(tracked.id);
      if (known && known.map_x !== null && known.map_y !== null && known.floor !== null) {
        positions.push({
          id: tracked.id,
          x: known.map_x,
          y: known.map_y,
          floor: known.floor,
          distance: tracked.distance,
        });
      }
    }

    const result = trilaterate(positions);
    if (!result) return;

    // Apply Kalman filter
    if (!kalmanRef.current) {
      kalmanRef.current = {
        x: result.x,
        y: result.y,
        px: 1,
        py: 1,
      };
    } else {
      kalmanRef.current = kalmanUpdate(kalmanRef.current, result.x, result.y);
    }

    setPosition({
      x: kalmanRef.current.x,
      y: kalmanRef.current.y,
      floor: result.floor,
    });
    setAccuracy(result.accuracy);
  }, [nearbyBeacons, knownBeacons]);

  return {
    position,
    accuracy,
    isAvailable: position !== null,
  };
}
