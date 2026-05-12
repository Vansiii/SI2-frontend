/**
 * Tipos para el módulo de Reportes Personalizables con Audio (CU-39)
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export type ReportScope = 'TENANT' | 'SAAS';

export type ReportCategory =
  | 'CREDITS'
  | 'CUSTOMERS'
  | 'DOCUMENTS'
  | 'IDENTITY_VERIFICATION'
  | 'TENANTS'
  | 'USERS'
  | 'PLANS'
  | 'SUBSCRIPTIONS';

export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type ReportFormat = 'csv' | 'xlsx';

export type ValidationStatus = 'VALID' | 'NEEDS_REVIEW' | 'INVALID';

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'gte'
  | 'lte'
  | 'gt'
  | 'lt'
  | 'between'
  | 'contains'
  | 'icontains'
  | 'startswith'
  | 'endswith'
  | 'is_null'
  | 'is_not_null';

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'current_week'
  | 'last_week'
  | 'current_month'
  | 'last_month'
  | 'current_quarter'
  | 'last_quarter'
  | 'current_year'
  | 'last_year'
  | 'custom';

export type SortDirection = 'asc' | 'desc';

// ============================================================================
// CATÁLOGO DE REPORTES
// ============================================================================

export interface ReportDefinition {
  scope: ReportScope;
  category: ReportCategory;
  report_type: string;
  name: string;
  description: string;
  model: string;
  available_columns: string[];
  available_filters: FilterDefinition[];
  available_group_by: string[];
  required_roles: string[];
}

export interface FilterDefinition {
  field: string;
  type: 'text' | 'number' | 'date' | 'choice' | 'boolean' | 'foreign_key';
  choices?: string[];
  label?: string;
}

export interface ReportCatalog {
  [scope: string]: {
    [category: string]: ReportDefinition[];
  };
}

// ============================================================================
// CONFIGURACIÓN DE REPORTE
// ============================================================================

export interface DateRange {
  preset?: DatePreset | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface ReportFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface ReportConfig {
  scope: ReportScope;
  category: ReportCategory;
  report_type: string;
  date_range?: DateRange;
  filters?: ReportFilter[];
  columns?: string[];
  group_by?: string[];
  sort?: SortConfig[];
  format?: ReportFormat;
}

// Alias para compatibilidad con componentes de voz
// Incluye campos adicionales de interpretación
export interface VoiceIntent extends ReportConfig {
  interpretation_notes?: string;
  confidence?: number;
}

// ============================================================================
// PLANTILLAS
// ============================================================================

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  scope: ReportScope;
  category: ReportCategory;
  report_type: string;
  config_json: ReportConfig;
  created_by: {
    id: number;
    username: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  scope: ReportScope;
  category: ReportCategory;
  report_type: string;
  config_json: ReportConfig;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {}

// ============================================================================
// REPORTES GENERADOS
// ============================================================================

export interface FileResource {
  id: string;
  original_name: string;
  file_size_bytes: number;
  mime_type: string;
  download_url?: string;
}

export interface GeneratedReport {
  id: string;
  scope: ReportScope;
  category: ReportCategory;
  report_type: string;
  status: ReportStatus;
  file_resource?: FileResource;
  total_rows: number;
  generation_time_seconds: number;
  generation_source: 'MANUAL' | 'VOICE' | 'SCHEDULED' | 'API';
  config_json: ReportConfig;
  error_message?: string;
  requested_by: {
    id: number;
    username: string;
    email: string;
  };
  created_at: string;
  completed_at?: string;
}

export interface GeneratedReportList {
  id: string;
  scope: ReportScope;
  category: ReportCategory;
  report_type: string;
  requested_by_name: string;
  generation_source: 'MANUAL' | 'AUDIO';
  status: ReportStatus;
  file_format: 'csv' | 'xlsx' | 'pdf';
  file_size_mb?: number;
  row_count?: number;
  created_at: string;
  completed_at?: string;
}

// ============================================================================
// VISTA PREVIA
// ============================================================================

export interface ReportPreviewRequest {
  config: ReportConfig;
  page?: number;
  page_size?: number;
}

export interface ReportPreviewResponse {
  total_rows: number;
  preview_rows: Record<string, any>[];
  columns: string[];
  estimated_file_size_mb: number;
}

// ============================================================================
// GENERACIÓN
// ============================================================================

export interface ReportGenerationRequest {
  config: ReportConfig;
  save_as_template?: boolean;
  template_name?: string;
  template_description?: string;
}

// ============================================================================
// REPORTES POR VOZ
// ============================================================================

export interface VoiceReportRequest {
  id: string;
  scope: ReportScope;
  transcription: string;
  transcription_language: string;
  validation_status: ValidationStatus;
  parsed_intent_json?: any;
  missing_fields_json?: string[];
  unsupported_terms_json?: Array<{
    term: string;
    reason: string;
  }>;
  audio_file_resource?: FileResource;
  audio_duration_seconds: number;
  processing_time_seconds: number;
  groq_transcription_model: string;
  groq_chat_model: string;
  requested_by: {
    id: number;
    username: string;
    email: string;
  };
  created_at: string;
}

export interface VoiceInterpretRequest {
  audio_file: File;
  scope: ReportScope;
}

export interface VoiceInterpretResponse {
  voice_request_id: string;
  transcription: string;
  language?: string;  // Idioma detectado (opcional)
  validation_status: ValidationStatus;
  proposed_config: ReportConfig;
  missing_fields: string[];
  unsupported_terms: Array<{
    term: string;
    reason: string;
  }>;
  interpretation_notes: string;
  confidence: number;
  processing_time_seconds?: number;
}

// ============================================================================
// PAGINACIÓN
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// FILTROS
// ============================================================================

export interface ReportHistoryFilters {
  scope?: ReportScope;
  category?: ReportCategory;
  status?: ReportStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface VoiceHistoryFilters {
  scope?: ReportScope;
  validation_status?: ValidationStatus;
}

// ============================================================================
// ERRORES
// ============================================================================

export interface ApiError {
  error: string;
  detail?: string;
}

// ============================================================================
// REPORTES MANUALES - TIPOS ADICIONALES
// ============================================================================

/**
 * Formato de exportación extendido (incluye PDF)
 */
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

/**
 * Tipos de gráficos soportados
 */
export type ChartType = 
  | 'BAR'
  | 'HORIZONTAL_BAR'
  | 'LINE'
  | 'PIE'
  | 'DONUT'
  | 'STACKED_BAR';

/**
 * Configuración de gráfico para visualización
 */
export interface ChartConfig {
  chart_type: ChartType;
  title: string;
  x_field: string;
  y_field: string;
  value_field?: string;
  label_field?: string;
  stack_fields?: string[];
  colors?: string[];
  show_legend?: boolean;
  show_grid?: boolean;
  value_format?: 'number' | 'currency' | 'percentage';
}

/**
 * Resultados de un reporte generado para visualización
 */
export interface ReportResults {
  data: Record<string, any>[];
  total_rows: number;
  columns: string[];
  chart_config?: ChartConfig;
  metadata?: {
    generated_at: string;
    filters_applied: Record<string, any>;
    execution_time_ms: number;
  };
}

/**
 * Tipo de dato del filtro
 */
export type FilterType = 
  | 'text'
  | 'choice'
  | 'date'
  | 'datetime'
  | 'integer'
  | 'decimal'
  | 'boolean';

/**
 * Opción de un filtro de tipo choice
 */
export interface FilterChoice {
  value: string | number;
  label: string;
}

/**
 * Definición extendida de filtro disponible
 */
export interface FilterDefinitionExtended {
  type: FilterType;
  operators: FilterOperator[];
  values?: FilterChoice[];
  default?: any;
  required?: boolean;
  description?: string;
}

/**
 * Valor de un filtro aplicado
 */
export interface FilterValue {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Configuración de ordenamiento
 */
export interface SortConfiguration {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Configuración de paginación
 */
export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRows: number;
}

/**
 * Formato de una columna
 */
export type ColumnFormat = 
  | 'text'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'email'
  | 'phone';

/**
 * Definición de una columna
 */
export interface ColumnDefinition {
  field: string;
  label: string;
  format: ColumnFormat;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

/**
 * Estado de carga
 */
export type LoadingState = 
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

/**
 * Información de error
 */
export interface ErrorInfo {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Type guard: Verifica si un reporte tiene configuración de gráfico
 */
export function hasChartConfig(results: ReportResults): results is ReportResults & { chart_config: ChartConfig } {
  return results.chart_config !== undefined && results.chart_config !== null;
}

/**
 * Type guard: Verifica si un filtro es de tipo choice
 */
export function isChoiceFilter(definition: FilterDefinitionExtended): definition is FilterDefinitionExtended & { values: FilterChoice[] } {
  return definition.type === 'choice' && Array.isArray(definition.values);
}

/**
 * Type guard: Verifica si un filtro es de tipo date
 */
export function isDateFilter(definition: FilterDefinitionExtended): boolean {
  return definition.type === 'date' || definition.type === 'datetime';
}

/**
 * Type guard: Verifica si un filtro es de tipo numérico
 */
export function isNumericFilter(definition: FilterDefinitionExtended): boolean {
  return definition.type === 'integer' || definition.type === 'decimal';
}

/**
 * Type guard: Verifica si un valor es un error
 */
export function isErrorInfo(value: any): value is ErrorInfo {
  return typeof value === 'object' && value !== null && 'message' in value;
}

// ============================================================================
// REPORTES MANUALES - METADATOS ENRIQUECIDOS (FASE 2)
// ============================================================================

/**
 * Componente UI para renderizar filtro
 */
export type UIComponent = 
  | 'multiselect' 
  | 'number_input' 
  | 'date_picker' 
  | 'date_range_picker' 
  | 'toggle' 
  | 'text_input';

/**
 * Opción de filtro tipo choice
 */
export interface FilterOption {
  value: string | number;
  label: string;
}

/**
 * Metadatos enriquecidos de un filtro
 */
export interface FilterMetadata {
  field: string;
  label: string;
  type: FilterType;
  operators: FilterOperator[];
  required: boolean;
  ui_component: UIComponent;
  ui_props: Record<string, any>;
  options?: FilterOption[];
  default_value?: any;
}

/**
 * Metadatos de columna
 */
export interface ColumnMetadata {
  field: string;
  label: string;
  sortable: boolean;
  groupable: boolean;
}

/**
 * Metadatos de agrupación
 */
export interface GroupingMetadata {
  field: string;
  label: string;
}

/**
 * Metadatos de campo ordenable
 */
export interface SortFieldMetadata {
  field: string;
  label: string;
}

/**
 * Configuración completa de gráficos
 */
export interface ChartConfigFull {
  default_chart: string;
  available_charts: string[];
  chart_config: Record<string, ChartSpecificConfig>;
}

/**
 * Configuración específica por tipo de gráfico
 */
export interface ChartSpecificConfig {
  type?: string;
  
  // Para donut/pie
  data_key?: string;
  name_key?: string;
  colors?: string[];
  label_format?: string;
  
  // Para bar/line
  x_axis?: string;
  y_axis?: string;
  y_axes?: Array<{
    key: string;
    color: string;
    label: string;
    fill?: boolean;
  }>;
  color?: string;
  label?: string;
  
  // Para gauge
  metrics?: Array<{
    key: string;
    label: string;
    max: number;
    color: string;
  }>;
  
  // Para funnel
  stages?: Array<{
    key: string;
    label: string;
  }>;
}

/**
 * Metadatos completos de un reporte
 */
export interface ReportMetadata {
  scope: ReportScope;
  category: ReportCategory;
  report_type: string;
  name: string;
  description: string;
  datasource: string;
  filters: FilterMetadata[];
  columns: ColumnMetadata[];
  groupings: GroupingMetadata[];
  sort_fields: SortFieldMetadata[];
  formats: ExportFormat[];
  chart_config: ChartConfigFull;
  default_config: ReportConfigExtended;
}

/**
 * Configuración extendida de reporte (incluye chart_type)
 */
export interface ReportConfigExtended extends ReportConfig {
  chart_type?: string;
}

/**
 * Paginación de resultados
 */
export interface Pagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Resumen estadístico
 */
export interface ReportSummary {
  total_records: number;
  [key: string]: number;
}

/**
 * Vista previa con chart_config del backend
 */
export interface ReportPreviewWithChart {
  data: Record<string, any>[];
  pagination: Pagination;
  chart_config: ChartSpecificConfig;
  summary: ReportSummary;
  columns: string[];
}

/**
 * Extender ReportResults para incluir nuevos campos
 */
export interface ReportResultsExtended extends ReportResults {
  chart_config?: ChartSpecificConfig;
  summary?: ReportSummary;
  pagination?: Pagination;
}
