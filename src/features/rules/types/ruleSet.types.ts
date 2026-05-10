export interface EligibilityRule {
  id: number;
  rule_set: number;
  max_debt_to_income_ratio: string;
  min_income_required: string;
  min_employment_months: number;
  max_arrears_allowed: string;
  allowed_cic_categories: string[];
  min_collateral_coverage: string;
  min_age: number;
  max_age: number;
  created_at: string;
  updated_at: string;
}

export interface CreditProductParameter {
  id: number;
  rule_set: number;
  product: number;
  product_name: string;
  min_amount: string;
  max_amount: string;
  min_term_months: number;
  max_term_months: number;
  min_interest_rate: string;
  max_interest_rate: string;
  allowed_currencies: string[];
  payment_frequencies: string[];
  max_financing_percentage: string;
  requires_guarantor: boolean;
  requires_collateral: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentRequirement {
  id: number;
  rule_set: number;
  product: number;
  product_name: string;
  document_type: string;
  document_name: string;
  description: string;
  is_mandatory: boolean;
  max_validity_days: number | null;
  allowed_formats: string[];
  max_file_size_mb: string;
  requires_manual_review: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStageDefinition {
  id: number;
  rule_set: number;
  stage_name: string;
  stage_code: string;
  stage_order: number;
  responsible_role: number | null;
  responsible_role_name: string;
  time_limit_hours: number | null;
  is_automated: boolean;
  escalation_rules: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DecisionThreshold {
  id: number;
  rule_set: number;
  min_score_auto_approval: number;
  min_score_manual_review: number;
  max_score_auto_rejection: number;
  max_amount_auto_approval: string | null;
  requires_manager_approval_amount: string | null;
  created_at: string;
  updated_at: string;
}

export interface RuleSetAudit {
  id: number;
  rule_set: number;
  changed_by: number | null;
  changed_by_name: string;
  change_type: 'CREATED' | 'UPDATED' | 'ACTIVATED' | 'ARCHIVED';
  field_name: string;
  old_value: any;
  new_value: any;
  ip_address: string;
  user_agent: string;
  notes: string;
  created_at: string;
}

export interface TenantRuleSet {
  id: number;
  version: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  name: string;
  description: string;
  activated_at: string | null;
  activated_by: number | null;
  activated_by_name: string;
  archived_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  // Nested
  eligibility_rule: EligibilityRule | null;
  product_parameters: CreditProductParameter[];
  document_requirements: DocumentRequirement[];
  workflow_stages: WorkflowStageDefinition[];
  decision_threshold: DecisionThreshold | null;
}

export interface TenantRuleSetWrite {
  version: string;
  name: string;
  description?: string;
  notes?: string;
}

export interface CloneRuleSetRequest {
  name: string;
}

export interface RuleSetStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
}
export interface PaginatedRuleSetResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TenantRuleSet[];
}