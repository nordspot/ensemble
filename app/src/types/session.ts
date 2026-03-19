import type { SessionType, SessionStatus, SpeakerRole } from './enums';

export interface Session {
  id: string;
  congress_id: string;
  track_id: string | null;
  room_id: string | null;
  title: string;
  description: string | null;
  session_type: SessionType;
  status: SessionStatus;
  start_time: string;
  end_time: string;
  max_attendees: number | null;
  is_bookable: boolean;
  requires_registration: boolean;
  livestream_url: string | null;
  recording_url: string | null;
  slides_url: string | null;
  language: string | null;
  cme_credits: number | null;
  sort_order: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SessionSpeaker {
  session_id: string;
  user_id: string;
  role: SpeakerRole;
  sort_order: number;
}

export interface SessionBooking {
  session_id: string;
  user_id: string;
  status: 'confirmed' | 'cancelled' | 'waitlist';
  booked_at: string;
}
