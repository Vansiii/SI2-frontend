/**
 * Tipos TypeScript para Reportes Manuales Independientes
 * 
 * @module manualReports.types
 */

// ============================================================
// TIPOS BÁSICOS
// ============================================================

export type ReportType = 
  | 'clients'
  | 'products'
  | 'applications'
  | 'audit'
  | 'users'
  | 'branches';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ============================================================
// FILTROS
// ============================================================

export interface BaseFilters {
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
  scope?: 'SAAS' | 'TENANT';
}

export interface ClientFilters extends BaseFilters {
  status?: 'active' | 'inactive';
  kyc_status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  city?: string;
  department?: string;
  employment_status?: string;
  income_min?: number;
  income_max?: number;
}

export interface ProductFilters extends BaseFilters {
  status?: 'active' | 'inactive';
  product_type_id?: number;
  min_amount_from?: number;
  min_amount_to?: number;
  max_amount_from?: number;
  max_amount_to?: number;
}

export interface ApplicationFilters extends BaseFilters {
  status?: string;
  product_id?: number;
  client_id?: number;
  branch_id?: number;
  assigned_to_id?: number;
  identity_verification_status?: string;
  documents_status?: string;
  risk_level?: string;
  submitted_from?: string;
  submitted_to?: string;
  amount_min?: number;
  amount_max?: number;
}

export interface AuditFilters extends BaseFilters {
  user_id?: number;
  action?: string;
  resource_type?: string;
  resource_id?: number;
  severity?: string;
  ip_address?: string;
}

export interface UserFilters extends BaseFilters {
  is_active?: boolean;
  role?: string;
}

export interface BranchFilters extends BaseFilters {
  is_active?: boolean;
  city?: string;
  department?: string;
}

export type ReportFilters = 
  | ClientFilters
  | ProductFilters
  | ApplicationFilters
  | AuditFilters
  | UserFilters
  | BranchFilters;

// ============================================================
// DATOS DE REPORTES
// ============================================================

export interface Pagination {
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface MonthlyChartData {
  month: string;
  count: number;
  [key: string]: string | number;
}

// Datos de gráficos específicos por tipo
export interface ClientChartData {
  by_status: ChartDataPoint[];
  by_kyc_status: ChartDataPoint[];
  by_month: MonthlyChartData[];
  by_risk_level: ChartDataPoint[];
  by_city: ChartDataPoint[];
}

export interface ProductChartData {
  by_type: ChartDataPoint[];
  by_status: ChartDataPoint[];
  by_month: MonthlyChartData[];
  interest_rate_comparison: ChartDataPoint[];
  amount_distribution: any[];
}

export interface ApplicationChartData {
  by_status: ChartDataPoint[];
  by_month: MonthlyChartData[];
  approval_rate_by_month: MonthlyChartData[];
  amounts_comparison: any[];
  by_product: ChartDataPoint[];
  by_branch: ChartDataPoint[];
  by_risk_level: ChartDataPoint[];
  processing_time: ChartDataPoint[];
}

export interface AuditChartData {
  by_action: ChartDataPoint[];
  by_severity: ChartDataPoint[];
  by_user_top10: ChartDataPoint[];
  by_day: MonthlyChartData[];
  by_resource: ChartDataPoint[];
  by_hour: ChartDataPoint[];
}

export interface UserChartData {
  by_role: ChartDataPoint[];
  by_status: ChartDataPoint[];
  by_month: MonthlyChartData[];
  activity: ChartDataPoint[];
}

export interface BranchChartData {
  by_city: ChartDataPoint[];
  by_status: ChartDataPoint[];
  applications_by_branch: ChartDataPoint[];
  geographic_distribution: ChartDataPoint[];
}

export type ChartData = 
  | ClientChartData
  | ProductChartData
  | ApplicationChartData
  | AuditChartData
  | UserChartData
  | BranchChartData;

// ============================================================
// FILAS DE DATOS
// ============================================================

export interface ClientRow {
  id: number;
  full_name: string;
  document_number: string;
  email: string;
  status: string;
  kyc_status: string;
  risk_level: string;
  monthly_income: number;
  city: string;
  created_at: string;
}

export interface ProductRow {
  id: number;
  name: string;
  code: string;
  product_type: string;
  status: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  min_term_months: number;
  max_term_months: number;
  created_at: string;
}

export interface ApplicationRow {
  id: number;
  application_number: string;
  client_name: string;
  client_document: string;
  product_name: string;
  status: string;
  requested_amount: number;
  approved_amount: number | null;
  term_months: number;
  risk_level: string;
  branch: string;
  assigned_to: string;
  created_at: string;
  submitted_at: string | null;
  approved_at: string | null;
}

export interface AuditRow {
  id: number;
  user: string;
  action: string;
  resource_type: string;
  resource_id: number | null;
  description: string;
  severity: string;
  ip_address: string;
  timestamp: string;
}

export interface UserRow {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface BranchRow {
  id: number;
  name: string;
  code: string;
  city: string;
  department: string;
  address: string;
  phone: string;
  is_active: boolean;
  applications_count: number;
  created_at: string;
}

export type ReportRow = 
  | ClientRow
  | ProductRow
  | ApplicationRow
  | AuditRow
  | UserRow
  | BranchRow;

// ============================================================
// RESÚMENES
// ============================================================

export interface ClientSummary {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  avg_income: number;
  risk_distribution: Array<{ risk_level: string; count: number }>;
}

export interface ProductSummary {
  total: number;
  active: number;
  inactive: number;
  by_type: Array<{ type: string; count: number }>;
}

export interface ApplicationSummary {
  total: number;
  by_status: Record<string, number>;
  approval_rate: number;
  total_requested: number;
  total_approved: number;
  avg_processing_days: number;
  by_product: Array<{ product: string; count: number }>;
}

export interface AuditSummary {
  total: number;
  by_action: Array<{ action: string; count: number }>;
  by_severity: Array<{ severity: string; count: number }>;
  by_user: Array<{ user: string; count: number }>;
  by_resource: Array<{ resource_type: string; count: number }>;
}

export interface UserSummary {
  total: number;
  active: number;
  inactive: number;
  by_role: Array<{ role: string; count: number }>;
}

export interface BranchSummary {
  total: number;
  active: number;
  inactive: number;
  by_city: Array<{ city: string; count: number }>;
  applications_by_branch: Array<{ branch: string; count: number }>;
}

export type ReportSummary = 
  | ClientSummary
  | ProductSummary
  | ApplicationSummary
  | AuditSummary
  | UserSummary
  | BranchSummary;

// ============================================================
// RESPUESTA COMPLETA
// ============================================================

export interface ReportData<
  TRow extends ReportRow = ReportRow,
  TSummary extends ReportSummary = ReportSummary,
  TChart extends ChartData = ChartData
> {
  report_type: ReportType;
  filters_applied: ReportFilters;
  summary: TSummary;
  chart_data: TChart;
  rows: TRow[];
  pagination: Pagination;
}

// Respuestas tipadas específicas
export type ClientReportData = ReportData<ClientRow, ClientSummary, ClientChartData>;
export type ProductReportData = ReportData<ProductRow, ProductSummary, ProductChartData>;
export type ApplicationReportData = ReportData<ApplicationRow, ApplicationSummary, ApplicationChartData>;
export type AuditReportData = ReportData<AuditRow, AuditSummary, AuditChartData>;
export type UserReportData = ReportData<UserRow, UserSummary, UserChartData>;
export type BranchReportData = ReportData<BranchRow, BranchSummary, BranchChartData>;

// ============================================================
// EXPORTACIÓN
// ============================================================

export interface ExportParams {
  report_type: ReportType;
  filters: ReportFilters;
  include_chart?: boolean;
  chart_type?: string;
}

export interface ExportResponse {
  blob: Blob;
  filename: string;
}

// ============================================================
// ESTADO DE LA APLICACIÓN
// ============================================================

export interface ReportState {
  reportType: ReportType | null;
  filters: ReportFilters;
  data: ReportData | null;
  loadingState: LoadingState;
  error: string | null;
}

// ============================================================
// UTILIDADES
// ============================================================

export function isReportType(value: string): value is ReportType {
  return ['clients', 'products', 'applications', 'audit', 'users', 'branches'].includes(value);
}

export function isExportFormat(value: string): value is ExportFormat {
  return ['csv', 'xlsx', 'pdf'].includes(value);
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  clients: 'Clientes',
  products: 'Productos Crediticios',
  applications: 'Solicitudes de Crédito',
  audit: 'Bitácora de Auditoría',
  users: 'Usuarios',
  branches: 'Sucursales',
};

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  xlsx: 'Excel',
  pdf: 'PDF',
};
