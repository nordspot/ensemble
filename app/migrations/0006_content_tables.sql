-- 0006_content_tables.sql
-- Abstracts, articles, posters, media, exhibitors, sponsors, events, notifications, AI/audit

-- Abstracts
CREATE TABLE IF NOT EXISTS abstracts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  track_id TEXT REFERENCES tracks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  abstract_text TEXT NOT NULL,
  keywords TEXT NOT NULL DEFAULT '[]',
  authors TEXT,
  presentation_type TEXT NOT NULL CHECK (presentation_type IN ('oral', 'poster', 'workshop', 'lightning')),
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'revision_requested', 'accepted', 'rejected', 'withdrawn')),
  decision_notes TEXT,
  submitted_at TEXT,
  decision_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Abstract reviews
CREATE TABLE IF NOT EXISTS abstract_reviews (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  abstract_id TEXT NOT NULL REFERENCES abstracts(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scores TEXT,
  overall_score REAL,
  recommendation TEXT CHECK (recommendation IN ('accept', 'minor_revision', 'major_revision', 'reject')),
  comments_for_authors TEXT,
  comments_for_committee TEXT,
  is_blind INTEGER NOT NULL DEFAULT 1,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(abstract_id, reviewer_id)
);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  content_text TEXT,
  original_file_url TEXT,
  converted_file_url TEXT,
  file_type TEXT,
  keywords TEXT,
  doi TEXT,
  is_published INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Posters
CREATE TABLE IF NOT EXISTS posters (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  abstract_id TEXT REFERENCES abstracts(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT,
  poster_number TEXT,
  physical_location TEXT,
  pdf_url TEXT,
  eposter_slides TEXT NOT NULL DEFAULT '[]',
  video_url TEXT,
  audio_url TEXT,
  qr_code_url TEXT,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Photos
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  location TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_photographer INTEGER NOT NULL DEFAULT 0,
  tags TEXT NOT NULL DEFAULT '[]',
  taken_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Podcast episodes
CREATE TABLE IF NOT EXISTS podcast_episodes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  guest_ids TEXT NOT NULL DEFAULT '[]',
  video_url TEXT,
  audio_url TEXT,
  transcript TEXT,
  summary TEXT,
  duration_seconds INTEGER,
  chapters TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'recording', 'editing', 'scheduled', 'published')),
  scheduled_at TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Session recordings
CREATE TABLE IF NOT EXISTS recordings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  video_url TEXT,
  audio_url TEXT,
  slides_url TEXT,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed', 'archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Transcripts
CREATE TABLE IF NOT EXISTS transcripts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  episode_id TEXT REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'de',
  segments TEXT,
  full_text TEXT,
  summary TEXT,
  keywords TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Exhibitors
CREATE TABLE IF NOT EXISTS exhibitors (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  booth_number TEXT,
  booth_size TEXT CHECK (booth_size IN ('small', 'medium', 'large', 'premium')),
  description TEXT,
  logo_url TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  products TEXT NOT NULL DEFAULT '[]',
  room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
  map_x REAL,
  map_y REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Exhibitor lead scanning
CREATE TABLE IF NOT EXISTS exhibitor_leads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  exhibitor_id TEXT NOT NULL REFERENCES exhibitors(id) ON DELETE CASCADE,
  attendee_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scanned_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scan_method TEXT NOT NULL CHECK (scan_method IN ('nfc_badge', 'qr_scan')),
  notes TEXT,
  rating INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sponsors
CREATE TABLE IF NOT EXISTS sponsors (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'title')),
  logo_url TEXT,
  website TEXT,
  description TEXT,
  benefits TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Workshops (extended session info)
CREATE TABLE IF NOT EXISTS workshops (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  max_participants INTEGER,
  materials_info TEXT,
  equipment TEXT NOT NULL DEFAULT '[]',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_hands_on INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Social events
CREATE TABLE IF NOT EXISTS social_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('dinner', 'reception', 'tour', 'activity', 'networking', 'party', 'other')),
  location TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT,
  max_attendees INTEGER,
  price_cents INTEGER NOT NULL DEFAULT 0,
  dress_code TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Social event RSVPs
CREATE TABLE IF NOT EXISTS social_event_rsvps (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  social_event_id TEXT NOT NULL REFERENCES social_events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'declined', 'waitlisted', 'cancelled')),
  dietary_requirements TEXT,
  plus_one INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(social_event_id, user_id)
);

-- Contacts (networking)
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  method TEXT CHECK (method IN ('nfc_badge', 'qr_scan', 'manual', 'ble_proximity')),
  notes TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(congress_id, user_id, contact_user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('session_reminder', 'schedule_change', 'message', 'announcement', 'achievement', 'poll', 'qa', 'system')),
  data TEXT NOT NULL DEFAULT '{}',
  is_read INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Knowledge chunks for RAG
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('session', 'abstract', 'article', 'transcript', 'poster', 'podcast')),
  source_id TEXT,
  source_title TEXT,
  speaker_name TEXT,
  session_title TEXT,
  congress_year INTEGER,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- AI audit log
CREATE TABLE IF NOT EXISTS ai_audit_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('rag_query', 'summary', 'translation')),
  data_types_used TEXT NOT NULL DEFAULT '[]',
  message_count INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- General audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT NOT NULL DEFAULT '{}',
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_congress ON knowledge_chunks(congress_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(congress_id, user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_abstracts_congress ON abstracts(congress_id, status);
