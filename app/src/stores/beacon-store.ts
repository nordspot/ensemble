import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PrivacyLevel } from '@/types';

interface NearbyBeacon {
  id: string;
  rssi: number;
  distance: number;
}

interface BeaconState {
  isScanning: boolean;
  currentZone: string | null;
  nearbyBeacons: NearbyBeacon[];
  privacyLevel: PrivacyLevel;
  startScanning: () => void;
  stopScanning: () => void;
  setCurrentZone: (zone: string | null) => void;
  setNearbyBeacons: (beacons: NearbyBeacon[]) => void;
  setPrivacyLevel: (level: PrivacyLevel) => void;
}

export const useBeaconStore = create<BeaconState>()(
  persist(
    (set) => ({
      isScanning: false,
      currentZone: null,
      nearbyBeacons: [],
      privacyLevel: 'off',
      startScanning: () => {
        // Stub: will integrate with BLE scanning
        set({ isScanning: true });
      },
      stopScanning: () =>
        set({ isScanning: false, nearbyBeacons: [] }),
      setCurrentZone: (zone) => set({ currentZone: zone }),
      setNearbyBeacons: (beacons) => set({ nearbyBeacons: beacons }),
      setPrivacyLevel: (level) => set({ privacyLevel: level }),
    }),
    {
      name: 'ensemble-beacon',
      partialize: (state) => ({ privacyLevel: state.privacyLevel }),
    }
  )
);
