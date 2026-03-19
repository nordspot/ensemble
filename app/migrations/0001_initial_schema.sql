-- 0001_initial_schema.sql
-- Core tables for Ensemble congress management platform

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  settings TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User profiles (id is the auth provider's user ID)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  title TEXT,
  organization_name TEXT,
  department TEXT,
  specialty TEXT,
  country TEXT,
  city TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  linkedin_url TEXT,
  orcid TEXT,
  researchgate_url TEXT,
  website TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'de',
  dietary_requirements TEXT,
  accessibility_needs TEXT,
  ble_location_enabled INTEGER NOT NULL DEFAULT 0,
  push_token TEXT,
  role TEXT NOT NULL DEFAULT 'attendee' CHECK (role IN ('attendee', 'speaker', 'organizer', 'admin', 'superadmin')),
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Congresses
CREATE TABLE IF NOT EXISTS congresses (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  discipline TEXT CHECK (discipline IN ('medical', 'dental', 'pharmaceutical', 'nursing', 'veterinary', 'scientific', 'engineering', 'legal', 'business', 'other')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Zurich',
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_country TEXT,
  venue_lat REAL,
  venue_lng REAL,
  logo_url TEXT,
  banner_url TEXT,
  website TEXT,
  max_attendees INTEGER,
  registration_open INTEGER NOT NULL DEFAULT 0,
  registration_deadline TEXT,
  abstract_submission_open INTEGER NOT NULL DEFAULT 0,
  abstract_deadline TEXT,
  early_bird_deadline TEXT,
  early_bird_price_cents INTEGER,
  regular_price_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'CHF',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'completed', 'archived')),
  settings TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(organization_id, slug)
);

-- Congress-specific roles
CREATE TABLE IF NOT EXISTS congress_roles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('organizer', 'reviewer', 'session_chair', 'photographer', 'exhibitor_admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(congress_id, user_id, role)
);

-- Tracks
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  floor TEXT,
  capacity INTEGER,
  equipment TEXT NOT NULL DEFAULT '[]',
  map_x REAL,
  map_y REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  track_id TEXT REFERENCES tracks(id) ON DELETE SET NULL,
  room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  session_type TEXT NOT NULL DEFAULT 'lecture' CHECK (session_type IN ('keynote', 'lecture', 'panel', 'workshop', 'poster', 'break', 'social', 'ceremony', 'satellite', 'other')),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  max_attendees INTEGER,
  is_bookable INTEGER NOT NULL DEFAULT 0,
  is_recorded INTEGER NOT NULL DEFAULT 0,
  is_streamed INTEGER NOT NULL DEFAULT 0,
  stream_url TEXT,
  recording_url TEXT,
  slides_url TEXT,
  cme_credits REAL NOT NULL DEFAULT 0,
  cme_type TEXT,
  requires_evaluation INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'live', 'completed', 'cancelled')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  settings TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Session speakers
CREATE TABLE IF NOT EXISTS session_speakers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'speaker' CHECK (role IN ('speaker', 'moderator', 'panelist', 'chair')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(session_id, user_id)
);

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL DEFAULT 'standard' CHECK (ticket_type IN ('early_bird', 'standard', 'student', 'speaker', 'vip', 'exhibitor', 'day_pass', 'virtual')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'waived')),
  payment_id TEXT,
  amount_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'CHF',
  referral_code TEXT,
  badge_printed INTEGER NOT NULL DEFAULT 0,
  badge_nfc_uid TEXT,
  dietary_requirements TEXT,
  accessibility_needs TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(congress_id, user_id)
);

-- Session bookings
CREATE TABLE IF NOT EXISTS session_bookings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'waitlisted', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(session_id, user_id)
);

-- Check-ins
CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('nfc_badge', 'qr_scan', 'ble_beacon', 'manual')),
  beacon_id TEXT,
  checked_in_at TEXT NOT NULL DEFAULT (datetime('now')),
  checked_out_at TEXT,
  duration_minutes INTEGER,
  UNIQUE(session_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_congress ON sessions(congress_id, start_time);
CREATE INDEX IF NOT EXISTS idx_registrations_congress ON registrations(congress_id);
CREATE INDEX IF NOT EXISTS idx_checkins_session ON checkins(congress_id, session_id);
