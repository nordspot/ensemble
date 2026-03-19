import { create } from 'zustand';
import type { Session } from '@/types';

interface SessionState {
  sessions: Session[];
  myBookings: string[];
  selectedDate: string | null;
  selectedTrack: string | null;
  setSessions: (sessions: Session[]) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTrack: (track: string | null) => void;
  bookSession: (sessionId: string) => void;
  cancelBooking: (sessionId: string) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  sessions: [],
  myBookings: [],
  selectedDate: null,
  selectedTrack: null,
  setSessions: (sessions) => set({ sessions }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTrack: (track) => set({ selectedTrack: track }),
  bookSession: (sessionId) =>
    set((s) => ({
      myBookings: s.myBookings.includes(sessionId)
        ? s.myBookings
        : [...s.myBookings, sessionId],
    })),
  cancelBooking: (sessionId) =>
    set((s) => ({
      myBookings: s.myBookings.filter((id) => id !== sessionId),
    })),
}));
