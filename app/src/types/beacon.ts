import type { CheckinMethod } from './enums';

export interface Beacon {
  id: string;
  congress_id: string;
  uuid: string;
  major: number;
  minor: number;
  label: string;
  room_id: string | null;
  map_x: number | null;
  map_y: number | null;
  floor: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BeaconPresence {
  id: string;
  congress_id: string;
  user_id: string;
  beacon_id: string | null;
  session_id: string | null;
  checkin_method: CheckinMethod;
  rssi: number | null;
  checked_in_at: string;
  checked_out_at: string | null;
}

export interface MapWaypoint {
  id: string;
  congress_id: string;
  label: string;
  floor: string;
  x: number;
  y: number;
  is_accessible: boolean;
  poi_type: string | null;
  linked_room_id: string | null;
  created_at: string;
}

export interface MapEdge {
  id: string;
  congress_id: string;
  from_waypoint_id: string;
  to_waypoint_id: string;
  distance: number;
  is_accessible: boolean;
  is_stairs: boolean;
  created_at: string;
}
