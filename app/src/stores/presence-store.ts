import { create } from 'zustand';

interface NearbyPerson {
  userId: string;
  name: string;
  zone: string;
}

interface PresenceState {
  nearbyPeople: NearbyPerson[];
  zoneOccupancy: Record<string, number>;
  setNearbyPeople: (people: NearbyPerson[]) => void;
  setZoneOccupancy: (occupancy: Record<string, number>) => void;
}

export const usePresenceStore = create<PresenceState>()((set) => ({
  nearbyPeople: [],
  zoneOccupancy: {},
  setNearbyPeople: (people) => set({ nearbyPeople: people }),
  setZoneOccupancy: (occupancy) => set({ zoneOccupancy: occupancy }),
}));
