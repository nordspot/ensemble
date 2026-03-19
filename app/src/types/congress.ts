import type { CongressStatus, CongressDiscipline } from './enums';

export interface Congress {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  discipline: CongressDiscipline;
  start_date: string;
  end_date: string;
  timezone: string;
  venue_name: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_country: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  indoor_map_url: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  max_attendees: number | null;
  registration_open: boolean;
  registration_deadline: string | null;
  abstract_submission_open: boolean;
  abstract_deadline: string | null;
  early_bird_deadline: string | null;
  early_bird_price_cents: number | null;
  regular_price_cents: number | null;
  currency: string;
  status: CongressStatus;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  congress_id: string;
  name: string;
  description: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
}

export interface Room {
  id: string;
  congress_id: string;
  name: string;
  floor: string | null;
  capacity: number | null;
  equipment: string[];
  map_x: number | null;
  map_y: number | null;
  sort_order: number;
  created_at: string;
}
