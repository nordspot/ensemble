import type {
  UserRole,
  CongressRole,
  TicketType,
  RegistrationStatus,
  PaymentStatus,
  PrivacyLevel,
  PlanType,
} from './enums';

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  title: string | null;
  affiliation: string | null;
  department: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  language: string;
  timezone: string | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
  orcid_id: string | null;
  website: string | null;
  specialties: string[];
  interests: string[];
  role: UserRole;
  privacy_level: PrivacyLevel;
  push_token: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  plan: PlanType;
  billing_email: string | null;
  stripe_customer_id: string | null;
  max_congresses: number;
  max_attendees_per_congress: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CongressRoleEntry {
  id: string;
  congress_id: string;
  user_id: string;
  role: CongressRole;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface Registration {
  id: string;
  congress_id: string;
  user_id: string;
  ticket_type: TicketType;
  status: RegistrationStatus;
  payment_status: PaymentStatus;
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  qr_code: string | null;
  dietary_requirements: string | null;
  accessibility_needs: string | null;
  notes: string | null;
  registered_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}
