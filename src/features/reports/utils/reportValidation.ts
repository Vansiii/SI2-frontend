/**
 * Utilidades de validación para configuración de reportes
 */
import type { ReportConfig, DateRange } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida configuración de reporte
 */
export const validateReportConfig = (config: ReportConfig): ValidationResult => {
  const errors: string[] = [];

  // Validar scope
  if (!config.scope) {
    errors.push('El scope es requerido');
  }

  // Validar categoría
  if (!config.category) {
    errors.push('La categoría es requerida');
  }

  // Validar tipo de reporte
  if (!config.report_type) {
    errors.push('El tipo de reporte es requerido');
  }

  // Validar rango de fechas si está presente
  if (config.date_range) {
    const dateErrors = validateDateRange(config.date_range);
    errors.push(...dateErrors);
  }

  // Validar columnas
  if (config.columns && config.columns.length === 0) {
    errors.push('Debe seleccionar al menos una columna');
  }

  // Validar filtros
  if (config.filters) {
    config.filters.forEach((filter, index) => {
      if (!filter.field) {
        errors.push(`Filtro ${index + 1}: El campo es requerido`);
      }
      if (!filter.operator) {
        errors.push(`Filtro ${index + 1}: El operador es requerido`);
      }
      if (filter.value === undefined || filter.value === null || filter.value === '') {
        if (filter.operator !== 'is_null' && filter.operator !== 'is_not_null') {
          errors.push(`Filtro ${index + 1}: El valor es requerido`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida rango de fechas
 */
export const validateDateRange = (dateRange: DateRange): string[] => {
  const errors: string[] = [];

  if (dateRange.preset === 'custom') {
    if (!dateRange.start_date) {
      errors.push('La fecha de inicio es requerida para rango personalizado');
    }
    if (!dateRange.end_date) {
      errors.push('La fecha de fin es requerida para rango personalizado');
    }

    if (dateRange.start_date && dateRange.end_date) {
      const start = new Date(dateRange.start_date);
      const end = new Date(dateRange.end_date);

      if (start > end) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }
  }

  return errors;
};

/**
 * Valida archivo de audio
 */
export const validateAudioFile = (file: File): ValidationResult => {
  const errors: string[] = [];

  // Validar tipo MIME
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/ogg', 'audio/mp3'];
  if (!allowedTypes.includes(file.type)) {
    errors.push(
      'Formato de audio no soportado. Formatos permitidos: MP3, WAV, M4A, OGG'
    );
  }

  // Validar tamaño (máximo 25 MB)
  const maxSize = 25 * 1024 * 1024; // 25 MB en bytes
  if (file.size > maxSize) {
    errors.push(
      `Archivo muy grande (${(file.size / (1024 * 1024)).toFixed(2)} MB). Máximo permitido: 25 MB`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida nombre de plantilla
 */
export const validateTemplateName = (name: string): ValidationResult => {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('El nombre de la plantilla es requerido');
  }

  if (name.length > 100) {
    errors.push('El nombre de la plantilla no puede exceder 100 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
