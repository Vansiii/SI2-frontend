/**
 * Utilidades de formateo para reportes
 */
import type { ReportCategory, ReportStatus, ValidationStatus } from '../types';

/**
 * Formatea el tamaño de archivo en formato legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Formatea duración en segundos a formato legible
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
};

/**
 * Obtiene el label de una categoría de reporte
 */
export const getCategoryLabel = (category: ReportCategory): string => {
  const labels: Record<ReportCategory, string> = {
    CREDITS: 'Créditos',
    CUSTOMERS: 'Clientes',
    DOCUMENTS: 'Documentos',
    IDENTITY_VERIFICATION: 'Verificación de Identidad',
    TENANTS: 'Tenants',
    USERS: 'Usuarios',
    PLANS: 'Planes',
    SUBSCRIPTIONS: 'Suscripciones',
  };

  return labels[category] || category;
};

/**
 * Obtiene el color de badge para un estado de reporte
 */
export const getStatusColor = (
  status: ReportStatus
): 'gray' | 'blue' | 'green' | 'red' => {
  const colors: Record<ReportStatus, 'gray' | 'blue' | 'green' | 'red'> = {
    PENDING: 'gray',
    PROCESSING: 'blue',
    COMPLETED: 'green',
    FAILED: 'red',
  };

  return colors[status] || 'gray';
};

/**
 * Obtiene el label de un estado de reporte
 */
export const getStatusLabel = (status: ReportStatus): string => {
  const labels: Record<ReportStatus, string> = {
    PENDING: 'Pendiente',
    PROCESSING: 'Procesando',
    COMPLETED: 'Completado',
    FAILED: 'Fallido',
  };

  return labels[status] || status;
};

/**
 * Obtiene el color de badge para un estado de validación
 */
export const getValidationStatusColor = (
  status: ValidationStatus
): 'green' | 'yellow' | 'red' => {
  const colors: Record<ValidationStatus, 'green' | 'yellow' | 'red'> = {
    VALID: 'green',
    NEEDS_REVIEW: 'yellow',
    INVALID: 'red',
  };

  return colors[status] || 'gray' as any;
};

/**
 * Obtiene el label de un estado de validación
 */
export const getValidationStatusLabel = (status: ValidationStatus): string => {
  const labels: Record<ValidationStatus, string> = {
    VALID: 'Válido',
    NEEDS_REVIEW: 'Requiere Revisión',
    INVALID: 'Inválido',
  };

  return labels[status] || status;
};

/**
 * Formatea fecha a formato local
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formatea fecha y hora a formato local
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Trunca texto largo
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
