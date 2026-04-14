/**
 * API service para gestión de planes de suscripción y suscripciones
 */

import { apiClient } from '@/utils/apiClient';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  billing_cycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  trial_days: number;
  setup_fee: string;
  
  // Límites
  max_users: number;
  max_branches: number;
  max_products: number;
  max_loans_per_month: number;
  max_storage_gb: number;
  
  // Features
  has_ai_scoring: boolean;
  has_workflows: boolean;
  has_reporting: boolean;
  has_mobile_app: boolean;
  has_api_access: boolean;
  has_white_label: boolean;
  has_custom_integrations: boolean;
  has_priority_support: boolean;
  
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  institution: {
    id: number;
    name: string;
    slug: string;
  };
  plan: SubscriptionPlan;
  status: 'PENDING' | 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  start_date: string;
  end_date: string | null;
  trial_end_date: string | null;
  next_billing_date: string | null;
  
  // Uso actual
  current_users: number;
  current_branches: number;
  current_products: number;
  current_loans_this_month: number;
  current_storage_gb: number | string; // Puede venir como string desde la API
  
  // Métodos calculados
  is_trial: boolean;
  is_within_limits: boolean;
  days_until_renewal: number | null;
  usage_percentage: {
    users: number;
    branches: number;
    products: number;
    loans: number;
    storage: number;
  };
  
  cancellation_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoSubscriptionResponse {
  has_subscription: false;
  message: string;
  institution?: unknown;
  available_plans_url?: string;
}

export type MySubscriptionResponse = Subscription | NoSubscriptionResponse;

export const hasActiveSubscription = (
  subscription: MySubscriptionResponse
): subscription is Subscription => !('has_subscription' in subscription);

export interface CreateSubscriptionData {
  plan_id: number;
  billing_cycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  start_trial?: boolean;
}

export interface ActivateSubscriptionData {
  payment_method: string;
  transaction_id: string;
}

export interface SuspendSubscriptionData {
  reason: string;
}

export interface CancelSubscriptionData {
  reason: string;
}

/**
 * Obtiene la lista de planes de suscripción disponibles
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await apiClient.get<{ results?: SubscriptionPlan[] } | SubscriptionPlan[]>('/saas/plans/');
  return Array.isArray(response) ? response : (response.results || []);
};

/**
 * Obtiene el detalle de un plan específico
 */
export const getSubscriptionPlan = async (id: number): Promise<SubscriptionPlan> => {
  return apiClient.get<SubscriptionPlan>(`/saas/plans/${id}/`);
};

/**
 * Obtiene la suscripción actual del usuario autenticado
 */
export const getMySubscription = async (): Promise<MySubscriptionResponse> => {
  return apiClient.get<MySubscriptionResponse>('/saas/my-subscription/');
};

/**
 * Cambia el plan de suscripción de la institución actual
 */
export const changeMySubscriptionPlan = async (planId: number): Promise<Subscription> => {
  return apiClient.post<Subscription>('/saas/my-subscription/change-plan/', { plan_id: planId });
};

/**
 * Obtiene la lista de todas las suscripciones (solo SaaS Admin)
 */
export const getSubscriptions = async (): Promise<Subscription[]> => {
  const response = await apiClient.get<{ results?: Subscription[] } | Subscription[]>('/saas/subscriptions/');
  return Array.isArray(response) ? response : (response.results || []);
};

/**
 * Crea una nueva suscripción (solo SaaS Admin)
 */
export const createSubscription = async (data: CreateSubscriptionData): Promise<Subscription> => {
  return apiClient.post<Subscription>('/saas/subscriptions/', data);
};

/**
 * Activa una suscripción
 */
export const activateSubscription = async (
  id: number,
  data: ActivateSubscriptionData
): Promise<Subscription> => {
  return apiClient.post<Subscription>(`/saas/subscriptions/${id}/activate/`, data);
};

/**
 * Suspende una suscripción
 */
export const suspendSubscription = async (
  id: number,
  data: SuspendSubscriptionData
): Promise<Subscription> => {
  return apiClient.post<Subscription>(`/saas/subscriptions/${id}/suspend/`, data);
};

/**
 * Cancela una suscripción
 */
export const cancelSubscription = async (
  id: number,
  data: CancelSubscriptionData
): Promise<Subscription> => {
  return apiClient.post<Subscription>(`/saas/subscriptions/${id}/cancel/`, data);
};

/**
 * Calcula el precio mensual de un plan según su ciclo de facturación
 */
export const calculateMonthlyPrice = (plan: SubscriptionPlan): number => {
  const price = parseFloat(plan.price);
  
  switch (plan.billing_cycle) {
    case 'MONTHLY':
      return price;
    case 'QUARTERLY':
      return price / 3;
    case 'ANNUAL':
      return price / 12;
    default:
      return price;
  }
};

/**
 * Obtiene el descuento porcentual de un plan anual vs mensual
 */
export const getAnnualDiscount = (plan: SubscriptionPlan): number => {
  // Si el plan es anual, retornar 20% de descuento por defecto
  if (plan.billing_cycle === 'ANNUAL') {
    return 20;
  }
  // Si es mensual, calcular el descuento si se paga anualmente
  const monthlyTotal = parseFloat(plan.price) * 12;
  const annualPrice = monthlyTotal * 0.8; // 20% de descuento
  const discount = ((monthlyTotal - annualPrice) / monthlyTotal) * 100;
  return Math.round(discount);
};

/**
 * Crea un nuevo plan de suscripción (solo SaaS Admin)
 */
export const createSubscriptionPlan = async (data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  return apiClient.post<SubscriptionPlan>('/saas/plans/', data);
};

/**
 * Actualiza un plan de suscripción existente (solo SaaS Admin)
 */
export const updateSubscriptionPlan = async (
  id: number,
  data: Partial<SubscriptionPlan>
): Promise<SubscriptionPlan> => {
  return apiClient.patch<SubscriptionPlan>(`/saas/plans/${id}/`, data);
};

/**
 * Elimina (desactiva) un plan de suscripción (solo SaaS Admin)
 */
export const deleteSubscriptionPlan = async (id: number): Promise<void> => {
  return apiClient.delete<void>(`/saas/plans/${id}/`);
};
