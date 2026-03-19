// Congress platform enum types (string literal unions)

export type CongressStatus = 'draft' | 'published' | 'live' | 'completed' | 'archived';

export type CongressDiscipline = 'medical' | 'engineering' | 'legal' | 'academic' | 'scientific' | 'other';

export type SessionType =
  | 'keynote'
  | 'panel'
  | 'workshop'
  | 'poster'
  | 'oral'
  | 'symposium'
  | 'live_surgery'
  | 'social'
  | 'break'
  | 'other';

export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export type SpeakerRole = 'speaker' | 'moderator' | 'panelist' | 'chair';

export type TicketType = 'early_bird' | 'standard' | 'vip' | 'virtual' | 'speaker' | 'exhibitor';

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'waitlist';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'comp';

export type AbstractStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'revision_requested';

export type ReviewRecommendation = 'accept' | 'minor_revision' | 'major_revision' | 'reject';

export type PresentationType = 'oral' | 'poster' | 'either';

export type CheckinMethod = 'beacon_auto' | 'nfc_badge' | 'qr_scan' | 'manual';

export type ChatType = 'direct' | 'group' | 'session' | 'topic' | 'announcement';

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'system';

export type PollType = 'multiple_choice' | 'scale' | 'open_text' | 'word_cloud';

export type BoothSize = 'small' | 'medium' | 'large' | 'island';

export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export type RewardTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export type PointsReason =
  | 'referral'
  | 'checkin'
  | 'question'
  | 'quiz'
  | 'networking'
  | 'photo'
  | 'registration'
  | 'profile'
  | 'exhibitor_visit';

export type NotificationType = 'reminder' | 'announcement' | 'chat' | 'achievement' | 'proximity';

export type UserRole = 'attendee' | 'speaker' | 'organizer' | 'admin' | 'superadmin';

export type CongressRole =
  | 'organizer'
  | 'reviewer'
  | 'session_chair'
  | 'photographer'
  | 'exhibitor_admin';

export type PrivacyLevel = 'off' | 'navigation' | 'full';

export type SocialEventType = 'dinner' | 'reception' | 'tour' | 'sport' | 'cultural';

export type PlanType = 'starter' | 'professional' | 'enterprise';

export type KnowledgeSourceType =
  | 'transcript'
  | 'article'
  | 'abstract'
  | 'poster'
  | 'slide'
  | 'podcast';

export type RecordingStatus = 'processing' | 'ready' | 'error';

export type PodcastStatus = 'scheduled' | 'recording' | 'processing' | 'published';
