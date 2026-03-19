import type { BoothSize, SponsorTier } from './enums';

export interface Exhibitor {
  id: string;
  congress_id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  booth_number: string | null;
  booth_size: BoothSize;
  booth_map_x: number | null;
  booth_map_y: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  products: string[];
  documents: ExhibitorDocument[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExhibitorDocument {
  name: string;
  url: string;
  type: string;
}

export interface ExhibitorLead {
  id: string;
  exhibitor_id: string;
  user_id: string;
  scanned_by: string;
  notes: string | null;
  rating: number | null;
  scanned_at: string;
}

export interface Sponsor {
  id: string;
  congress_id: string;
  name: string;
  tier: SponsorTier;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}
