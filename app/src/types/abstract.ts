import type {
  AbstractStatus,
  PresentationType,
  ReviewRecommendation,
} from './enums';

export interface Abstract {
  id: string;
  congress_id: string;
  user_id: string;
  track_id: string | null;
  title: string;
  body: string;
  keywords: string[];
  authors: AbstractAuthor[];
  presentation_type: PresentationType;
  status: AbstractStatus;
  submitted_at: string | null;
  decision_at: string | null;
  decision_notes: string | null;
  assigned_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AbstractAuthor {
  name: string;
  affiliation: string | null;
  email: string | null;
  is_presenter: boolean;
  sort_order: number;
}

export interface AbstractReview {
  id: string;
  abstract_id: string;
  reviewer_id: string;
  recommendation: ReviewRecommendation;
  score_originality: number;
  score_methodology: number;
  score_relevance: number;
  score_clarity: number;
  score_overall: number;
  comments_to_author: string | null;
  comments_to_committee: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
