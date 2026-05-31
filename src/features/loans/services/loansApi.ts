/**
 * API Service para el módulo de Préstamos (Loans)
 * Integración con el backend Django REST Framework
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  LoanApplication,
  LoanApplicationDocumentRequirement,
  TimelineEvent,
  DocumentType,
  TenantRuleSet,
  EligibilityRule,
  CreditProductParameter,
  CreateLoanApplicationDto,
  UpdateLoanApplicationDto,
  SubmitLoanApplicationDto,
  ChangeStatusDto,
  ReviewLoanApplicationDto,
  ApproveLoanApplicationDto,
  RejectLoanApplicationDto,
  UploadDocumentDto,
  ReviewDocumentDto,
  LoanApplicationFilters,
  PaginatedResponse,
} from '../types/loan.types';

// Configuración de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas y errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const BASE_URL = '/loans';

// ============================================================================
// SOLICITUDES DE CRÉDITO (Credit Applications)
// ============================================================================

export const loansApi = {
  // Listar solicitudes
  listApplications: async (filters?: LoanApplicationFilters) => {
    const response = await apiClient.get<PaginatedResponse<LoanApplication>>(
      `${BASE_URL}/credit-applications/`,
      { params: filters }
    );
    return response.data;
  },

  // Crear solicitud (borrador)
  createApplication: async (data: CreateLoanApplicationDto) => {
    const response = await apiClient.post<LoanApplication>(
      `${BASE_URL}/credit-applications/`,
      data
    );
    return response.data;
  },

  // Obtener detalle de solicitud
  getApplication: async (id: number) => {
    const response = await apiClient.get<LoanApplication>(
      `${BASE_URL}/credit-applications/${id}/`
    );
    return response.data;
  },

  // Actualizar solicitud (solo borradores)
  updateApplication: async (id: number, data: UpdateLoanApplicationDto) => {
    const response = await apiClient.patch<LoanApplication>(
      `${BASE_URL}/credit-applications/${id}/`,
      data
    );
    return response.data;
  },

  // Enviar solicitud
  submitApplication: async (id: number, data?: SubmitLoanApplicationDto) => {
    const response = await apiClient.post<LoanApplication>(
      `${BASE_URL}/credit-applications/${id}/submit/`,
      data || {}
    );
    return response.data;
  },

  // Cambiar estado de solicitud
  changeStatus: async (id: number, data: ChangeStatusDto) => {
    const response = await apiClient.post<LoanApplication>(
      `${BASE_URL}/credit-applications/${id}/change-status/`,
      data
    );
    return response.data;
  },

  // Revisar solicitud (actualizar evaluación)
  reviewApplication: async (id: number, data: ReviewLoanApplicationDto) => {
    const response = await apiClient.post<LoanApplication>(
      `${BASE_URL}/credit-applications/${id}/review/`,
      data
    );
    return response.data;
  },

  // Aprobar solicitud
  approveApplication: async (id: number, data: ApproveLoanApplicationDto) => {
    const response = await apiClient.post<LoanApplication>(
      `${BASE_URL}/credit-applications/${id}/approve/`,
      data
    );
    return response.data;
  },

  // Rechazar solicitud
  rejectApplication: async (id: number, data: RejectLoanApplicationDto) => {
    const response = await apiClient.post<LoanApplication>(
      `${BASE_URL}/credit-applications/${id}/reject/`,
      data
    );
    return response.data;
  },

  // Obtener timeline de solicitud
  getTimeline: async (id: number) => {
    const response = await apiClient.get<TimelineEvent[]>(
      `${BASE_URL}/credit-applications/${id}/timeline/`
    );
    return response.data;
  },

  // Sincronizar workflow
  syncWorkflow: async (id: number) => {
    const response = await apiClient.post<LoanApplication>(
      `${BASE_URL}/credit-applications/${id}/sync-workflow/`
    );
    return response.data;
  },

  // ============================================================================
  // DOCUMENTOS (Documents)
  // ============================================================================

  // Listar documentos de una solicitud (para clientes)
  listMyDocuments: async (applicationId?: number) => {
    const response = await apiClient.get<LoanApplicationDocumentRequirement[]>(
      `${BASE_URL}/my-documents/`,
      { params: { loan_application: applicationId } }
    );
    return response.data;
  },

  // Cargar documento
  uploadDocument: async (requirementId: number, data: UploadDocumentDto) => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.notes) {
      formData.append('notes', data.notes);
    }

    const response = await apiClient.post<LoanApplicationDocumentRequirement>(
      `${BASE_URL}/my-documents/${requirementId}/upload/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Listar documentos (para staff)
  listStaffDocuments: async (applicationId?: number) => {
    const response = await apiClient.get<LoanApplicationDocumentRequirement[]>(
      `${BASE_URL}/staff/documents/`,
      { params: { loan_application: applicationId } }
    );
    return response.data;
  },

  // Revisar documento (para staff)
  reviewDocument: async (requirementId: number, data: ReviewDocumentDto) => {
    const response = await apiClient.post<LoanApplicationDocumentRequirement>(
      `${BASE_URL}/staff/documents/${requirementId}/review/`,
      data
    );
    return response.data;
  },

  // ============================================================================
  // MIS SOLICITUDES (Cliente)
  // ============================================================================

  // Listar mis solicitudes
  listMyApplications: async (filters?: LoanApplicationFilters) => {
    const response = await apiClient.get<PaginatedResponse<LoanApplication>>(
      `${BASE_URL}/my-applications/`,
      { params: filters }
    );
    return response.data;
  },

  // Obtener detalle de mi solicitud
  getMyApplication: async (id: number) => {
    const response = await apiClient.get<LoanApplication>(
      `${BASE_URL}/my-applications/${id}/`
    );
    return response.data;
  },

  // Obtener timeline de mi solicitud
  getMyTimeline: async (id: number) => {
    const response = await apiClient.get<TimelineEvent[]>(
      `${BASE_URL}/my-applications/${id}/timeline/`
    );
    return response.data;
  },

  // Obtener acciones pendientes
  getPendingActions: async (id: number) => {
    const response = await apiClient.get<any[]>(
      `${BASE_URL}/my-applications/${id}/pending-actions/`
    );
    return response.data;
  },

  // ============================================================================
  // REGLAS Y PARÁMETROS (Rules & Parameters)
  // ============================================================================

  // Listar conjuntos de reglas
  listRuleSets: async () => {
    const response = await apiClient.get<TenantRuleSet[]>(`${BASE_URL}/rule-sets/`);
    return response.data;
  },

  // Obtener conjunto de reglas activo
  getActiveRuleSet: async () => {
    const response = await apiClient.get<TenantRuleSet>(`${BASE_URL}/rule-sets/active/`);
    return response.data;
  },

  // Obtener detalle de conjunto de reglas
  getRuleSet: async (id: number) => {
    const response = await apiClient.get<TenantRuleSet>(`${BASE_URL}/rule-sets/${id}/`);
    return response.data;
  },

  // Crear conjunto de reglas
  createRuleSet: async (data: Partial<TenantRuleSet>) => {
    const response = await apiClient.post<TenantRuleSet>(`${BASE_URL}/rule-sets/`, data);
    return response.data;
  },

  // Activar conjunto de reglas
  activateRuleSet: async (id: number) => {
    const response = await apiClient.post<TenantRuleSet>(
      `${BASE_URL}/rule-sets/${id}/activate/`
    );
    return response.data;
  },

  // Clonar conjunto de reglas
  cloneRuleSet: async (id: number, newVersion: string) => {
    const response = await apiClient.post<TenantRuleSet>(
      `${BASE_URL}/rule-sets/${id}/clone/`,
      { new_version: newVersion }
    );
    return response.data;
  },

  // Listar reglas de elegibilidad
  listEligibilityRules: async (ruleSetId?: number) => {
    const response = await apiClient.get<EligibilityRule[]>(
      `${BASE_URL}/eligibility-rules/`,
      { params: { rule_set: ruleSetId } }
    );
    return response.data;
  },

  // Listar parámetros de productos
  listProductParameters: async (ruleSetId?: number, productId?: number) => {
    const response = await apiClient.get<CreditProductParameter[]>(
      `${BASE_URL}/product-parameters/`,
      { params: { rule_set: ruleSetId, product: productId } }
    );
    return response.data;
  },

  // Obtener parámetros de un producto específico
  getProductParameter: async (id: number) => {
    const response = await apiClient.get<CreditProductParameter>(
      `${BASE_URL}/product-parameters/${id}/`
    );
    return response.data;
  },

  // Obtener resumen de parámetros con fallbacks
  getProductParameterSummary: async (id: number) => {
    const response = await apiClient.get<any>(
      `${BASE_URL}/product-parameters/${id}/summary/`
    );
    return response.data;
  },

  // ============================================================================
  // CATÁLOGOS (Catalogs)
  // ============================================================================

  // Tipos de documento
  listDocumentTypes: async (activeOnly = true) => {
    const endpoint = activeOnly
      ? `${BASE_URL}/catalogs/document-types/active/`
      : `${BASE_URL}/catalogs/document-types/`;
    const response = await apiClient.get<DocumentType[]>(endpoint);
    return response.data;
  },

  // Tipos de producto
  listProductTypes: async (activeOnly = true) => {
    const endpoint = activeOnly
      ? `${BASE_URL}/catalogs/product-types/active/`
      : `${BASE_URL}/catalogs/product-types/`;
    const response = await apiClient.get<any[]>(endpoint);
    return response.data;
  },

  // Frecuencias de pago
  listPaymentFrequencies: async (activeOnly = true) => {
    const endpoint = activeOnly
      ? `${BASE_URL}/catalogs/payment-frequencies/active/`
      : `${BASE_URL}/catalogs/payment-frequencies/`;
    const response = await apiClient.get<any[]>(endpoint);
    return response.data;
  },

  // Sistemas de amortización
  listAmortizationSystems: async (activeOnly = true) => {
    const endpoint = activeOnly
      ? `${BASE_URL}/catalogs/amortization-systems/active/`
      : `${BASE_URL}/catalogs/amortization-systems/`;
    const response = await apiClient.get<any[]>(endpoint);
    return response.data;
  },

  // Monedas
  listCurrencies: async (activeOnly = true) => {
    const endpoint = activeOnly
      ? `${BASE_URL}/catalogs/currencies/active/`
      : `${BASE_URL}/catalogs/currencies/`;
    const response = await apiClient.get<any[]>(endpoint);
    return response.data;
  },
};

export default loansApi;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formatea el número de solicitud para mostrar
 */
export function formatApplicationNumber(applicationNumber: string): string {
  return applicationNumber || 'N/D';
}

/**
 * Obtiene el color para el estado de la solicitud
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    DRAFT: 'slate',
    SUBMITTED: 'blue',
    IN_REVIEW: 'amber',
    OBSERVED: 'orange',
    UNDER_REVIEW: 'amber',
    APPROVED: 'emerald',
    REJECTED: 'red',
    DISBURSED: 'teal',
    CANCELLED: 'slate',
  };
  return statusColors[status] || 'slate';
}

/**
 * Obtiene el color para el estado de verificación de identidad
 */
export function getIdentityStatusColor(status?: string | null): string {
  if (!status) return 'slate';
  const statusColors: Record<string, string> = {
    NOT_VERIFIED: 'slate',
    PENDING: 'amber',
    IN_PROGRESS: 'blue',
    APPROVED: 'emerald',
    DECLINED: 'red',
    MANUAL_REVIEW: 'orange',
  };
  return statusColors[status] || 'slate';
}

/**
 * Obtiene el color para el estado de documentos
 */
export function getDocumentsStatusColor(status?: string | null): string {
  if (!status) return 'slate';
  const statusColors: Record<string, string> = {
    NOT_REQUIRED: 'slate',
    PENDING: 'amber',
    COMPLETE: 'emerald',
    OBSERVED: 'orange',
  };
  return statusColors[status] || 'slate';
}

export function getAvailableActions(application: Pick<LoanApplication, 'status'>) {
  const actions: Array<{ key: string; label: string; color: string }> = [];

  if (application.status === 'DRAFT' || application.status === 'OBSERVED') {
    actions.push({ key: 'submit', label: 'Enviar', color: 'emerald' });
  }

  if (application.status === 'SUBMITTED' || application.status === 'IN_REVIEW') {
    actions.push({ key: 'review', label: 'Poner en revisión', color: 'amber' });
    actions.push({ key: 'observe', label: 'Observar', color: 'orange' });
    actions.push({ key: 'approve', label: 'Aprobar', color: 'emerald' });
    actions.push({ key: 'reject', label: 'Rechazar', color: 'rose' });
  }

  if (application.status === 'APPROVED') {
    actions.push({ key: 'disburse', label: 'Desembolsar', color: 'teal' });
  }

  return actions;
}

export async function reviewLoanApplication(
  id: number,
  data: { credit_score?: number; risk_level?: string; debt_to_income_ratio?: string; notes?: string }
): Promise<LoanApplication> {
  const response = await apiClient.post<LoanApplication>(
    `${BASE_URL}/credit-applications/${id}/review/`,
    data
  );
  return response.data;
}

export async function approveLoanApplication(
  id: number,
  data: ApproveLoanApplicationData
): Promise<LoanApplication> {
  const response = await apiClient.post<LoanApplication>(
    `${BASE_URL}/credit-applications/${id}/approve/`,
    data
  );
  return response.data;
}

export async function rejectLoanApplication(
  id: number,
  data: { rejection_reason: string }
): Promise<LoanApplication> {
  const response = await apiClient.post<LoanApplication>(
    `${BASE_URL}/credit-applications/${id}/reject/`,
    { rejection_reason: data.rejection_reason }
  );
  return response.data;
}

export async function disburseLoanApplication(
  id: number,
  data: { notes?: string }
): Promise<LoanApplication> {
  const response = await apiClient.post<LoanApplication>(
    `${BASE_URL}/credit-applications/${id}/disburse/`,
    data
  );
  return response.data;
}

export type AutoDecision = 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' | 'ESCALATE' | null;

export interface SubScores {
  payment_capacity: number | null;
  employment_stability: number | null;
  credit_history: number | null;
  debt_burden: number | null;
  demographic: number | null;
}

export interface BureauQuerySummary {
  id?: number;
  provider: string | null;
  status: string | null;
  score_external: number | null;
  debt_total: string | null;
  has_defaults: boolean | null;
  cic_category: string | null;
  queried_at?: string | null;
  response_time_ms?: number | null;
}

export interface CreditEvaluationResult {
  evaluation_id: number;
  score_ia: number | null;
  score_bureau: number | null;
  score_weighted: number | null;
  risk_level: string | null;
  risk_level_display: string | null;
  debt_to_income_ratio: string | null;
  auto_decision: AutoDecision;
  auto_decision_reason: string;
  evaluated_at: string | null;
  application: LoanApplication;
  sub_scores: SubScores | null;
  bureau_query: BureauQuerySummary | null;
}

export interface CreditEvaluationDetail {
  id: number;
  status: string;
  score_ia: number | null;
  score_bureau: number | null;
  score_weighted: number | null;
  risk_level: string | null;
  risk_level_display: string | null;
  debt_to_income_ratio: string | null;
  auto_decision: AutoDecision;
  auto_decision_reason: string;
  eligibility_check_passed: boolean | null;
  bureau_check_passed: boolean | null;
  dti_calculated: string | null;
  recommended_amount: string | null;
  max_affordable_payment: string | null;
  sub_scores: SubScores | null;
  model_version: string;
  features_used: Record<string, number>;
  evaluated_at: string | null;
  evaluation_time_ms: number | null;
  error_message: string | null;
  bureau_query: BureauQuerySummary | null;
}

export async function calculateLoanApplicationScore(
  id: number
): Promise<CreditEvaluationResult> {
  const response = await apiClient.post<CreditEvaluationResult>(
    `${BASE_URL}/credit-applications/${id}/calculate-score/`,
    {}
  );
  return response.data;
}

export async function getLoanApplicationEvaluation(
  id: number
): Promise<CreditEvaluationDetail> {
  const response = await apiClient.get<CreditEvaluationDetail>(
    `${BASE_URL}/credit-applications/${id}/evaluation/`
  );
  return response.data;
}

export async function calculateLoanScore(id: number): Promise<{
  credit_score?: number;
  risk_level?: string;
  debt_to_income_ratio?: number;
}> {
  try {
    const evaluation = await calculateLoanApplicationScore(id);
    return {
      credit_score: evaluation.score_weighted ?? undefined,
      risk_level: evaluation.risk_level ?? undefined,
      debt_to_income_ratio: evaluation.debt_to_income_ratio
        ? Number(evaluation.debt_to_income_ratio)
        : undefined,
    };
  } catch {
    const application = await loansApi.getApplication(id);
    return {
      credit_score: application.credit_score ?? undefined,
      risk_level: application.risk_level ?? undefined,
      debt_to_income_ratio: application.debt_to_income_ratio
        ? Number(application.debt_to_income_ratio)
        : undefined,
    };
  }
}
