/**
 * Utilidades de formateo para reportes manuales
 * 
 * @module manualReportFormatters
 */

/**
 * Formatea un número como moneda colombiana
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  return new Intl.NumberFormat('es-CO').format(value);
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  return `${value.toFixed(2)}%`;
}

/**
 * Formatea una fecha
 */
export function formatDate(value: string | null | undefined, includeTime = false): string {
  if (!value) {
    return '-';
  }
  
  const date = new Date(value);
  
  if (includeTime) {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
  
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Formatea un booleano
 */
export function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  return value ? 'Sí' : 'No';
}

/**
 * Obtiene el color del badge según el valor
 */
export function getBadgeColor(value: string): string {
  const lowerValue = value.toLowerCase();
  
  // Estados positivos
  if (['active', 'activo', 'verified', 'verificado', 'approved', 'aprobado'].includes(lowerValue)) {
    return 'bg-green-100 text-green-800';
  }
  
  // Estados negativos
  if (['inactive', 'inactivo', 'rejected', 'rechazado', 'cancelled', 'cancelado'].includes(lowerValue)) {
    return 'bg-red-100 text-red-800';
  }
  
  // Estados pendientes
  if (['pending', 'pendiente', 'in_review', 'en_revision'].includes(lowerValue)) {
    return 'bg-yellow-100 text-yellow-800';
  }
  
  // Riesgo
  if (lowerValue === 'low' || lowerValue === 'bajo') {
    return 'bg-green-100 text-green-800';
  }
  if (lowerValue === 'medium' || lowerValue === 'medio') {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (lowerValue === 'high' || lowerValue === 'alto') {
    return 'bg-red-100 text-red-800';
  }
  
  // Default
  return 'bg-gray-100 text-gray-800';
}
