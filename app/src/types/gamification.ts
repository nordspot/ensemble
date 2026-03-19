import type { PointsReason, RewardTier } from './enums';

export interface ReferralLink {
  id: string;
  congress_id: string;
  referrer_id: string;
  code: string;
  uses: number;
  max_uses: number | null;
  expires_at: string | null;
  created_at: string;
}

export interface PointsLedgerEntry {
  id: string;
  congress_id: string;
  user_id: string;
  points: number;
  reason: PointsReason;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  congress_id: string;
  name: string;
  description: string;
  icon_url: string | null;
  criteria: Record<string, unknown>;
  points: number;
  created_at: string;
}

export interface Reward {
  id: string;
  congress_id: string;
  name: string;
  description: string;
  tier: RewardTier;
  points_cost: number;
  quantity_available: number | null;
  quantity_claimed: number;
  image_url: string | null;
  created_at: string;
}

export interface RewardClaim {
  id: string;
  reward_id: string;
  user_id: string;
  claimed_at: string;
  redeemed_at: string | null;
  redemption_code: string | null;
}
