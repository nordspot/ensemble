-- 0002_beacon_tables.sql
-- BLE beacon infrastructure and indoor navigation

-- Beacons
CREATE TABLE IF NOT EXISTS beacons (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
  beacon_uuid TEXT NOT NULL,
  major INTEGER NOT NULL,
  minor INTEGER NOT NULL,
  name TEXT,
  zone TEXT,
  floor TEXT,
  map_x REAL,
  map_y REAL,
  tx_power INTEGER NOT NULL DEFAULT -59,
  battery_level INTEGER,
  last_seen_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(congress_id, beacon_uuid, major, minor)
);

-- Beacon presence (real-time location tracking)
CREATE TABLE IF NOT EXISTS beacon_presence (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  beacon_id TEXT NOT NULL REFERENCES beacons(id) ON DELETE CASCADE,
  zone TEXT,
  rssi INTEGER,
  estimated_distance REAL,
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(congress_id, user_id)
);

-- Map waypoints for indoor navigation
CREATE TABLE IF NOT EXISTS map_waypoints (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  name TEXT,
  floor TEXT,
  map_x REAL NOT NULL,
  map_y REAL NOT NULL,
  is_room_entrance INTEGER NOT NULL DEFAULT 0,
  room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
  is_elevator INTEGER NOT NULL DEFAULT 0,
  is_stairs INTEGER NOT NULL DEFAULT 0,
  is_accessible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Map edges (connections between waypoints for pathfinding)
CREATE TABLE IF NOT EXISTS map_edges (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  congress_id TEXT NOT NULL REFERENCES congresses(id) ON DELETE CASCADE,
  from_waypoint_id TEXT NOT NULL REFERENCES map_waypoints(id) ON DELETE CASCADE,
  to_waypoint_id TEXT NOT NULL REFERENCES map_waypoints(id) ON DELETE CASCADE,
  distance_meters REAL NOT NULL,
  is_accessible INTEGER NOT NULL DEFAULT 1,
  floor_change TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_beacon_presence_zone ON beacon_presence(congress_id, zone);
CREATE INDEX IF NOT EXISTS idx_beacon_presence_user ON beacon_presence(congress_id, user_id);
