/**
 * Types for garantias (collaterals and guarantors).
 */

export type CollateralType =
  | 'REAL_ESTATE'
  | 'VEHICLE'
  | 'MACHINERY'
  | 'SAVINGS'
  | 'GUARANTOR'
  | 'OTHER';

export type CollateralStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RELEASED';

export type GuarantorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type GuarantorDocumentType = 'CI' | 'NIT' | 'PASSPORT';

export type GuarantorEmploymentType =
  | 'EMPLOYED'
  | 'SELF_EMPLOYED'
  | 'BUSINESS_OWNER'
  | 'RETIRED'
  | 'OTHER';

export type CollateralDocumentType =
  | 'DEED'
  | 'APPRAISAL'
  | 'PHOTOS'
  | 'INSURANCE'
  | 'REGISTRATION'
  | 'OTHER';

export type CollateralValuationType = 'INTERNAL' | 'EXTERNAL' | 'MARKET_COMPARISON';

export interface PaginatedResponse<T> {
  success?: boolean;
  count: number;
  total_pages?: number;
  current_page?: number;
  page_size?: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CollateralListItem {
  id: number;
  loan_application: number;
  loan_application_number?: string;
  collateral_type: CollateralType;
  collateral_type_display?: string;
  estimated_value: string;
  appraised_value?: string | null;
  coverage_percentage?: string | null;
  status: CollateralStatus;
  status_display?: string;
  created_at: string;
  updated_at: string;
}

export interface Collateral extends CollateralListItem {
  description?: string;
  is_active?: boolean;
  property_address?: string | null;
  property_registry_number?: string | null;
  property_area_m2?: string | null;
  vehicle_plate?: string | null;
  vehicle_vin?: string | null;
  vehicle_year?: number | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  ownership_verified?: boolean;
  has_liens?: boolean;
  lien_details?: string | null;
  insurance_policy_number?: string | null;
  insurance_company?: string | null;
  insurance_expiry_date?: string | null;
  registered_by?: number | null;
  registered_by_name?: string | null;
  approved_by?: number | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  notes?: string | null;
  documents_count?: number;
  valuations_count?: number;
}

export interface CollateralDocument {
  id: number;
  collateral: number;
  document_type: CollateralDocumentType;
  document_type_display?: string;
  file_resource?: string | null;
  signed_url?: string | null;
  description?: string;
  uploaded_by?: number | null;
  uploaded_by_name?: string | null;
  verified_by?: number | null;
  verified_by_name?: string | null;
  verified_at?: string | null;
  is_valid: boolean;
  expiry_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollateralValuation {
  id: number;
  collateral: number;
  valuation_type: CollateralValuationType;
  valuation_type_display?: string;
  appraiser_name: string;
  appraiser_license?: string | null;
  appraiser_company?: string | null;
  valuation_date: string;
  appraised_value: string;
  valuation_method?: string | null;
  observations?: string | null;
  report_file?: string | null;
  valid_until?: string | null;
  approved_by?: number | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollateralValuationCreatePayload {
  collateral: number;
  valuation_type: CollateralValuationType;
  appraiser_name: string;
  appraiser_license?: string | null;
  appraiser_company?: string | null;
  valuation_date: string;
  appraised_value: string;
  valuation_method?: string | null;
  observations?: string | null;
  report_file?: string | null;
  valid_until?: string | null;
}

export interface GuarantorListItem {
  id: number;
  loan_application: number;
  collateral?: number | null;
  full_name?: string;
  document_number: string;
  monthly_income: string;
  status: GuarantorStatus;
  status_display?: string;
  created_at: string;
  updated_at: string;
}

export interface Guarantor extends GuarantorListItem {
  first_name: string;
  last_name: string;
  document_type: GuarantorDocumentType;
  document_extension?: string | null;
  birth_date: string;
  gender?: string | null;
  email: string;
  phone: string;
  mobile_phone?: string | null;
  address: string;
  city: string;
  department: string;
  employment_type: GuarantorEmploymentType;
  employer_name?: string | null;
  job_title?: string | null;
  relationship_to_borrower: string;
  approved_by?: number | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  is_active?: boolean;
}

export interface CollateralFilters {
  page?: number;
  page_size?: number;
  status?: CollateralStatus | '';
  collateral_type?: CollateralType | '';
  loan_application?: number | '';
}

export interface GuarantorFilters {
  page?: number;
  page_size?: number;
  status?: GuarantorStatus | '';
  loan_application?: number | '';
}

export interface CollateralCreatePayload {
  loan_application: number;
  collateral_type: CollateralType;
  description?: string;
  estimated_value: string;
  appraised_value?: string | null;
  property_address?: string | null;
  property_registry_number?: string | null;
  property_area_m2?: string | null;
  vehicle_plate?: string | null;
  vehicle_vin?: string | null;
  vehicle_year?: number | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  ownership_verified?: boolean;
  has_liens?: boolean;
  lien_details?: string | null;
  insurance_policy_number?: string | null;
  insurance_company?: string | null;
  insurance_expiry_date?: string | null;
  notes?: string | null;
}

export interface CollateralUpdatePayload extends Partial<CollateralCreatePayload> {
  is_active?: boolean;
}

export interface GuarantorCreatePayload {
  loan_application: number;
  collateral?: number | null;
  first_name: string;
  last_name: string;
  document_type: GuarantorDocumentType;
  document_number: string;
  document_extension?: string | null;
  birth_date: string;
  gender?: string | null;
  email: string;
  phone: string;
  mobile_phone?: string | null;
  address: string;
  city: string;
  department: string;
  employment_type: GuarantorEmploymentType;
  employer_name?: string | null;
  job_title?: string | null;
  monthly_income: string;
  relationship_to_borrower: string;
}

export interface GuarantorUpdatePayload extends Partial<GuarantorCreatePayload> {
  is_active?: boolean;
}
