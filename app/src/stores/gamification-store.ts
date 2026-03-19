import { create } from 'zustand';

interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  rank: number;
}

interface ReferralStats {
  clicks: number;
  conversions: number;
}

interface GamificationState {
  myPoints: number;
  leaderboard: LeaderboardEntry[];
  achievements: string[];
  referralCode: string | null;
  referralStats: ReferralStats | null;
  setMyPoints: (points: number) => void;
  addPoints: (points: number) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  addAchievement: (achievement: string) => void;
  setReferralCode: (code: string | null) => void;
  setReferralStats: (stats: ReferralStats | null) => void;
}

export const useGamificationStore = create<GamificationState>()((set) => ({
  myPoints: 0,
  leaderboard: [],
  achievements: [],
  referralCode: null,
  referralStats: null,
  setMyPoints: (points) => set({ myPoints: points }),
  addPoints: (points) =>
    set((s) => ({ myPoints: s.myPoints + points })),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  addAchievement: (achievement) =>
    set((s) => ({
      achievements: s.achievements.includes(achievement)
        ? s.achievements
        : [...s.achievements, achievement],
    })),
  setReferralCode: (code) => set({ referralCode: code }),
  setReferralStats: (stats) => set({ referralStats: stats }),
}));
