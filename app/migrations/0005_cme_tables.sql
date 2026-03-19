-- 0005_cme_tables.sql
-- Continuing Medical Education credits and evaluations

-- CME credit types
CREATE TABLE IF NOT EXISTS cme_credit_types (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  abbreviation TEXT,
  description TEXT,
  accreditation_body TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- CME credits earned
CREATE TABLE IF NOT EXISTS cme_credits (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  credit_type_id TEXT NOT NULL REFERENCES cme_credit_types(id) ON DELETE CASCADE,
  credits REAL NOT NULL,
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  checkin_verified INTEGER NOT NULL DEFAULT 0,
  evaluation_completed INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, session_id, credit_type_id)
);

-- Session evaluations
CREATE TABLE IF NOT EXISTS session_evaluations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ratings TEXT NOT NULL,
  comments TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(session_id, user_id)
);

-- CME certificates
CREATE TABLE IF NOT EXISTS cme_certificates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_credits REAL NOT NULL,
  credit_type_id TEXT NOT NULL REFERENCES cme_credit_types(id) ON DELETE CASCADE,
  certificate_url TEXT,
  verification_code TEXT NOT NULL UNIQUE,
  generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Speaker conflict-of-interest disclosures
CREATE TABLE IF NOT EXISTS speaker_disclosures (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  has_conflicts INTEGER NOT NULL,
  disclosures TEXT NOT NULL DEFAULT '[]',
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(congress_id, user_id)
);
