-- 0004_gamification_tables.sql
-- Referrals, points, achievements, and rewards

-- Referral links
CREATE TABLE IF NOT EXISTS referral_links (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  url TEXT,
  click_count INTEGER NOT NULL DEFAULT 0,
  conversion_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Points ledger
CREATE TABLE IF NOT EXISTS points_ledger (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('checkin', 'session_attendance', 'question_asked', 'poll_response', 'referral', 'poster_vote', 'networking', 'evaluation', 'social_event', 'workshop', 'bonus')),
  reference_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(congress_id, user_id, achievement_type)
);

-- Rewards
CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  points_required INTEGER NOT NULL,
  total_available INTEGER,
  claimed_count INTEGER NOT NULL DEFAULT 0,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('voucher', 'upgrade', 'access', 'physical')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Reward claims
CREATE TABLE IF NOT EXISTS reward_claims (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  reward_id TEXT NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'redeemed', 'expired', 'cancelled')),
  redeemed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_points_user ON points_ledger(congress_id, user_id);
