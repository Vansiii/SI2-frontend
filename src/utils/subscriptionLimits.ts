/**
 * Utilidades para verificar límites de suscripción
 */

import {
  getMySubscription,
  hasActiveSubscription,
  type Subscription,
} from '../features/saas/services/subscriptionsApi';

export interface LimitCheckResult {
  allowed: boolean;
  message?: string;
  currentUsage: number;
  maxLimit: number;
  usagePercentage: number;
  shouldWarn: boolean;
}

/**
 * Verifica si se puede crear un nuevo recurso según los límites de la suscripción
 */
export async function checkResourceLimit(
  resourceType: 'users' | 'branches' | 'products' | 'loans' | 'storage',
  incrementBy: number = 1
): Promise<LimitCheckResult> {
  try {
    const subscription = await getMySubscription();
    
    if (!subscription || !hasActiveSubscription(subscription)) {
      return {
        allowed: false,
        message: 'No tienes una suscripción activa. Por favor, selecciona un plan.',
        currentUsage: 0,
        maxLimit: 0,
        usagePercentage: 0,
        shouldWarn: false,
      };
    }

    const result = getResourceLimitInfo(subscription, resourceType, incrementBy);
    
    return result;
  } catch (error) {
    console.error('Error checking resource limit:', error);
    // En caso de error, permitir la acción pero registrar el error
    return {
      allowed: true,
      message: 'No se pudo verificar el límite. Procede con precaución.',
      currentUsage: 0,
      maxLimit: 0,
      usagePercentage: 0,
      shouldWarn: true,
    };
  }
}

/**
 * Obtiene información sobre el límite de un recurso específico
 */
export function getResourceLimitInfo(
  subscription: Subscription,
  resourceType: 'users' | 'branches' | 'products' | 'loans' | 'storage',
  incrementBy: number = 1
): LimitCheckResult {
  let currentUsage: number;
  let maxLimit: number;
  let resourceName: string;

  switch (resourceType) {
    case 'users':
      currentUsage = subscription.current_users;
      maxLimit = subscription.plan.max_users;
      resourceName = 'usuarios';
      break;
    case 'branches':
      currentUsage = subscription.current_branches;
      maxLimit = subscription.plan.max_branches;
      resourceName = 'sucursales';
      break;
    case 'products':
      currentUsage = subscription.current_products;
      maxLimit = subscription.plan.max_products;
      resourceName = 'productos';
      break;
    case 'loans':
      currentUsage = subscription.current_loans_this_month;
      maxLimit = subscription.plan.max_loans_per_month;
      resourceName = 'solicitudes este mes';
      break;
    case 'storage':
      currentUsage =
        typeof subscription.current_storage_gb === 'number'
          ? subscription.current_storage_gb
          : Number.parseFloat(subscription.current_storage_gb) || 0;
      maxLimit = subscription.plan.max_storage_gb;
      resourceName = 'GB de almacenamiento';
      break;
    default:
      return {
        allowed: false,
        message: 'Tipo de recurso no válido',
        currentUsage: 0,
        maxLimit: 0,
        usagePercentage: 0,
        shouldWarn: false,
      };
  }

  const newUsage = currentUsage + incrementBy;
  const usagePercentage = (newUsage / maxLimit) * 100;
  const allowed = newUsage <= maxLimit;
  const shouldWarn = usagePercentage >= 80 && usagePercentage < 100;

  let message: string | undefined;

  if (!allowed) {
    message = `Has alcanzado el límite de ${resourceName} (${maxLimit}) de tu plan ${subscription.plan.name}. Actualiza tu plan para continuar.`;
  } else if (shouldWarn) {
    message = `Estás cerca del límite de ${resourceName}. Uso actual: ${newUsage}/${maxLimit} (${usagePercentage.toFixed(0)}%). Considera actualizar tu plan.`;
  }

  return {
    allowed,
    message,
    currentUsage: newUsage,
    maxLimit,
    usagePercentage,
    shouldWarn,
  };
}

/**
 * Obtiene el color del badge según el porcentaje de uso
 */
export function getUsageColor(percentage: number): string {
  if (percentage >= 90) return 'red';
  if (percentage >= 75) return 'yellow';
  return 'green';
}

/**
 * Obtiene el mensaje de alerta según el porcentaje de uso
 */
export function getUsageAlertMessage(
  resourceType: string,
  currentUsage: number,
  maxLimit: number,
  percentage: number
): string | null {
  if (percentage >= 100) {
    return `Has alcanzado el límite de ${resourceType}. Actualiza tu plan para continuar.`;
  }
  if (percentage >= 90) {
    return `Estás muy cerca del límite de ${resourceType} (${currentUsage}/${maxLimit}). Actualiza tu plan pronto.`;
  }
  if (percentage >= 80) {
    return `Estás acercándote al límite de ${resourceType} (${currentUsage}/${maxLimit}).`;
  }
  return null;
}

/**
 * Formatea el nombre del recurso para mostrar
 */
export function formatResourceName(resourceType: string): string {
  const names: Record<string, string> = {
    users: 'usuarios',
    branches: 'sucursales',
    products: 'productos',
    loans: 'solicitudes',
    storage: 'almacenamiento',
  };
  return names[resourceType] || resourceType;
}
