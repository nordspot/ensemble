import type { ChatType, MessageType, PollType } from './enums';

export interface Conversation {
  id: string;
  congress_id: string;
  type: ChatType;
  name: string | null;
  session_id: string | null;
  topic: string | null;
  is_moderated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  is_muted: boolean;
  last_read_at: string | null;
  joined_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  body: string;
  media_url: string | null;
  reply_to_id: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  edited_at: string | null;
  created_at: string;
}

export interface QAQuestion {
  id: string;
  session_id: string;
  user_id: string;
  body: string;
  is_anonymous: boolean;
  is_answered: boolean;
  is_approved: boolean;
  upvote_count: number;
  answered_at: string | null;
  created_at: string;
}

export interface Poll {
  id: string;
  session_id: string;
  created_by: string;
  type: PollType;
  question: string;
  options: string[];
  is_active: boolean;
  show_results: boolean;
  closes_at: string | null;
  created_at: string;
}

export interface PollResponse {
  id: string;
  poll_id: string;
  user_id: string;
  answer: string;
  created_at: string;
}
