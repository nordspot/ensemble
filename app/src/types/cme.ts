export interface CmeCreditType {
  id: string;
  congress_id: string;
  name: string;
  authority: string;
  country: string | null;
  max_credits: number;
  created_at: string;
}

export interface CmeCredit {
  id: string;
  credit_type_id: string;
  session_id: string;
  credits: number;
  created_at: string;
}

export interface SessionEvaluation {
  id: string;
  session_id: string;
  user_id: string;
  rating: number;
  feedback: string | null;
  is_anonymous: boolean;
  completed_at: string;
}

export interface CmeCertificate {
  id: string;
  congress_id: string;
  user_id: string;
  credit_type_id: string;
  total_credits: number;
  certificate_url: string | null;
  issued_at: string;
}

export interface SpeakerDisclosure {
  id: string;
  congress_id: string;
  user_id: string;
  has_conflicts: boolean;
  disclosure_text: string | null;
  companies: string[];
  submitted_at: string;
}
