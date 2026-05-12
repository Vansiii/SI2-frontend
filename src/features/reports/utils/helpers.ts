/**
 * Utilidades y helpers para reportes manuales
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { FilterDefinitionExtended } from '../types';

// ============================================================================
// FORMATEO DE VALORES
// ============================================================================

/**
 * Formatea un valor de celda según su tipo
 */
export function formatCellValue(value: any, columnName: string): string {
  // Null o undefined
  if (value === null || value === undefined) {
    return '-';
  }

  // Booleanos
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  // Fechas (detectar por nombre de columna o formato ISO)
  if (isDateColumn(columnName) || isISODate(value)) {
    try {
      const date = new Date(value);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch {
      return String(value);
    }
  }

  // Fechas con hora
  if (isDateTimeColumn(columnName)) {
    try {
      const date = new Date(value);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return String(value);
    }
  }

  // Montos (detectar por nombre de columna)
  if (isCurrencyColumn(columnName)) {
    return formatCurrency(value);
  }

  // Porcentajes
  if (isPercentageColumn(columnName)) {
    return formatPercentage(value);
  }

  // Números
  if (typeof value === 'number') {
    return formatNumber(value);
  }

  // Strings
  return String(value);
}

/**
 * Formatea un valor como moneda
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '-';
  }

  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '-';
  }

  return new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numValue);
}

/**
 * Formatea un valor como porcentaje
 */
export function formatPercentage(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '-';
  }

  return new Intl.NumberFormat('es-BO', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue / 100);
}

// ============================================================================
// DETECCIÓN DE TIPOS DE COLUMNAS
// ============================================================================

/**
 * Detecta si una columna es de tipo fecha
 */
export function isDateColumn(columnName: string): boolean {
  const datePatterns = [
    'date',
    'fecha',
    'birth_date',
    'start_date',
    'end_date',
    'due_date',
    'payment_date'
  ];

  const lowerName = columnName.toLowerCase();
  return datePatterns.some(pattern => lowerName.includes(pattern));
}

/**
 * Detecta si una columna es de tipo fecha y hora
 */
export function isDateTimeColumn(columnName: string): boolean {
  const dateTimePatterns = [
    'created_at',
    'updated_at',
    'deleted_at',
    'timestamp',
    'datetime'
  ];

  const lowerName = columnName.toLowerCase();
  return dateTimePatterns.some(pattern => lowerName.includes(pattern));
}

/**
 * Detecta si una columna es de tipo moneda
 */
export function isCurrencyColumn(columnName: string): boolean {
  const currencyPatterns = [
    'amount',
    'monto',
    'price',
    'precio',
    'cost',
    'costo',
    'total',
    'balance',
    'saldo',
    'payment',
    'pago',
    'fee',
    'comision',
    'interest',
    'interes'
  ];

  const lowerName = columnName.toLowerCase();
  return currencyPatterns.some(pattern => lowerName.includes(pattern));
}

/**
 * Detecta si una columna es de tipo porcentaje
 */
export function isPercentageColumn(columnName: string): boolean {
  const percentagePatterns = [
    'rate',
    'tasa',
    'percentage',
    'porcentaje',
    'percent',
    'interest_rate',
    'discount'
  ];

  const lowerName = columnName.toLowerCase();
  return percentagePatterns.some(pattern => lowerName.includes(pattern));
}

/**
 * Detecta si un string es una fecha ISO
 */
export function isISODate(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  // Patrón ISO 8601: YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
  const isoPattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  return isoPattern.test(value);
}

// ============================================================================
// TRADUCCIÓN DE LABELS
// ============================================================================

/**
 * Traduce el nombre de una columna a español
 */
export function getColumnLabel(columnName: string): string {
  const translations: Record<string, string> = {
    // IDs
    'id': 'ID',
    'uuid': 'UUID',
    
    // Fechas
    'created_at': 'Fecha de Creación',
    'updated_at': 'Fecha de Actualización',
    'deleted_at': 'Fecha de Eliminación',
    'submitted_at': 'Fecha de Envío',
    'reviewed_at': 'Fecha de Revisión',
    'approved_at': 'Fecha de Aprobación',
    'rejected_at': 'Fecha de Rechazo',
    'disbursed_at': 'Fecha de Desembolso',
    'date': 'Fecha',
    'start_date': 'Fecha de Inicio',
    'end_date': 'Fecha de Fin',
    'due_date': 'Fecha de Vencimiento',
    'birth_date': 'Fecha de Nacimiento',
    
    // Solicitudes de Crédito
    'application_number': 'Número de Solicitud',
    'application_id': 'ID de Solicitud',
    'risk_level': 'Nivel de Riesgo',
    'credit_score': 'Puntaje de Crédito',
    'requested_amount': 'Monto Solicitado',
    'approved_amount': 'Monto Aprobado',
    'disbursed_amount': 'Monto Desembolsado',
    'purpose': 'Propósito',
    'notes': 'Notas',
    'observation_reason': 'Motivo de Observación',
    'rejection_reason': 'Motivo de Rechazo',
    
    // Créditos
    'loan_id': 'ID de Crédito',
    'loan_number': 'Número de Crédito',
    'amount': 'Monto',
    'principal_amount': 'Monto Principal',
    'interest_rate': 'Tasa de Interés',
    'approved_interest_rate': 'Tasa de Interés Aprobada',
    'term_months': 'Plazo (meses)',
    'approved_term_months': 'Plazo Aprobado (meses)',
    'monthly_payment': 'Cuota Mensual',
    'status': 'Estado',
    'payment_frequency': 'Frecuencia de Pago',
    'debt_to_income_ratio': 'Ratio Deuda/Ingreso',
    
    // Clientes
    'customer_id': 'ID de Cliente',
    'customer_name': 'Nombre del Cliente',
    'client_id': 'ID de Cliente',
    'client_name': 'Nombre del Cliente',
    'client_document': 'Documento del Cliente',
    'client_email': 'Email del Cliente',
    'client_phone': 'Teléfono del Cliente',
    'client_type': 'Tipo de Cliente',
    'first_name': 'Nombre',
    'last_name': 'Apellido',
    'email': 'Correo Electrónico',
    'phone': 'Teléfono',
    'mobile_phone': 'Teléfono Móvil',
    'document_number': 'Número de Documento',
    'document_type': 'Tipo de Documento',
    'address': 'Dirección',
    'city': 'Ciudad',
    'department': 'Departamento',
    'country': 'País',
    
    // Productos
    'product_id': 'ID de Producto',
    'product_name': 'Nombre del Producto',
    'product_code': 'Código de Producto',
    'product_type': 'Tipo de Producto',
    
    // Sucursales
    'branch_id': 'ID de Sucursal',
    'branch_name': 'Nombre de Sucursal',
    'branch_code': 'Código de Sucursal',
    'branch_city': 'Ciudad de Sucursal',
    
    // Usuarios
    'user_id': 'ID de Usuario',
    'username': 'Nombre de Usuario',
    'full_name': 'Nombre Completo',
    'assigned_to_name': 'Asignado a',
    'reviewed_by_name': 'Revisado Por',
    'approved_by_name': 'Aprobado Por',
    'created_by_name': 'Creado Por',
    'role': 'Rol',
    'is_active': 'Activo',
    
    // Tenants
    'tenant_id': 'ID de Tenant',
    'tenant_name': 'Nombre de Tenant',
    'tenant_code': 'Código de Tenant',
    
    // Documentos
    'document_id': 'ID de Documento',
    'document_name': 'Nombre de Documento',
    'file_name': 'Nombre de Archivo',
    'file_size': 'Tamaño de Archivo',
    'mime_type': 'Tipo de Archivo',
    'documents_status': 'Estado de Documentos',
    
    // Verificación
    'verification_id': 'ID de Verificación',
    'verification_status': 'Estado de Verificación',
    'identity_verification_status': 'Estado de Verificación de Identidad',
    'verified_at': 'Fecha de Verificación',
    'verified_by': 'Verificado Por',
    'kyc_status': 'Estado KYC',
    
    // Empleo
    'employment_type': 'Tipo de Empleo',
    'employment_status': 'Estado Laboral',
    'employer_name': 'Nombre del Empleador',
    'job_title': 'Cargo',
    'monthly_income': 'Ingreso Mensual',
    
    // Contadores y Agregaciones
    'count': 'Cantidad',
    'total': 'Total',
    'total_amount': 'Monto Total',
    'total_applications': 'Total de Solicitudes',
    'approved_count': 'Aprobadas',
    'rejected_count': 'Rechazadas',
    'pending_count': 'Pendientes',
    'approval_rate': 'Tasa de Aprobación',
    'average': 'Promedio',
    'avg_credit_score': 'Puntaje de Crédito Promedio',
    'sum': 'Suma',
    
    // Agrupaciones temporales
    'month': 'Mes',
    'quarter': 'Trimestre',
    'year': 'Año',
    'day': 'Día',
    'week': 'Semana'
  };

  return translations[columnName] || formatFieldName(columnName);
}

/**
 * Formatea un nombre de campo a formato legible
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Obtiene la etiqueta de un filtro
 */
export function getFilterLabel(fieldName: string): string {
  const filterLabels: Record<string, string> = {
    'status': 'Estado',
    'branch_id': 'Sucursal',
    'product_id': 'Producto',
    'customer_id': 'Cliente',
    'date_from': 'Fecha Desde',
    'date_to': 'Fecha Hasta',
    'amount_min': 'Monto Mínimo',
    'amount_max': 'Monto Máximo',
    'is_active': 'Activo',
    'document_type': 'Tipo de Documento',
    'verification_status': 'Estado de Verificación'
  };

  return filterLabels[fieldName] || getColumnLabel(fieldName);
}

// ============================================================================
// CÁLCULO DE TAMAÑOS
// ============================================================================

/**
 * Calcula el tamaño estimado de los datos en bytes
 */
export function calculateEstimatedSize(data: Record<string, any>[]): number {
  if (!data || data.length === 0) {
    return 0;
  }

  // Estimar tamaño del JSON
  const jsonString = JSON.stringify(data);
  return new Blob([jsonString]).size;
}

/**
 * Formatea un tamaño de archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// VALIDACIONES
// ============================================================================

/**
 * Valida el valor de un filtro
 */
export function validateFilterValue(
  value: any,
  definition: FilterDefinitionExtended
): { valid: boolean; error?: string } {
  // Requerido
  if (definition.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: 'Este campo es requerido' };
  }

  // Si no es requerido y está vacío, es válido
  if (!definition.required && (value === null || value === undefined || value === '')) {
    return { valid: true };
  }

  // Validar según tipo
  switch (definition.type) {
    case 'integer':
      if (!Number.isInteger(Number(value))) {
        return { valid: false, error: 'Debe ser un número entero' };
      }
      break;

    case 'decimal':
      if (isNaN(Number(value))) {
        return { valid: false, error: 'Debe ser un número válido' };
      }
      break;

    case 'date':
    case 'datetime':
      if (!(value instanceof Date) && isNaN(Date.parse(value))) {
        return { valid: false, error: 'Debe ser una fecha válida' };
      }
      break;

    case 'choice':
      if (definition.values) {
        const validValues = definition.values.map(v => v.value);
        if (Array.isArray(value)) {
          const allValid = value.every(v => validValues.includes(v));
          if (!allValid) {
            return { valid: false, error: 'Valor no válido' };
          }
        } else if (!validValues.includes(value)) {
          return { valid: false, error: 'Valor no válido' };
        }
      }
      break;
  }

  return { valid: true };
}
