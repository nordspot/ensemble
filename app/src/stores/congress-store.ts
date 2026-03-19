import { create } from 'zustand';
import type { Congress } from '@/types';

interface CongressState {
  currentCongress: Congress | null;
  congresses: Congress[];
  setCurrentCongress: (congress: Congress | null) => void;
  setCongresses: (congresses: Congress[]) => void;
  fetchCongresses: () => void;
}

export const useCongressStore = create<CongressState>()((set) => ({
  currentCongress: null,
  congresses: [],
  setCurrentCongress: (congress) => set({ currentCongress: congress }),
  setCongresses: (congresses) => set({ congresses }),
  fetchCongresses: () => {
    // Stub: will be replaced with actual API call
  },
}));
