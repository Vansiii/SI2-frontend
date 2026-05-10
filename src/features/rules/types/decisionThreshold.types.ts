export interface DecisionThreshold {
  id: number;
  rule_set: number;
  rule_set_name?: string;
  min_score_auto_approval: number;
  min_score_manual_review: number;
  max_score_auto_rejection: number;
  max_amount_auto_approval: number | null;
  requires_manager_approval_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface DecisionThresholdWrite {
  rule_set: number;
  min_score_auto_approval?: number;
  min_score_manual_review?: number;
  max_score_auto_rejection?: number;
  max_amount_auto_approval?: number | null;
  requires_manager_approval_amount?: number | null;
}