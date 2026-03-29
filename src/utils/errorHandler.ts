/**
 * Error Handler
 * Manejo centralizado de errores de API
 */

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
  code?: string;
}

/**
 * Clase de error personalizada para errores de API
 */
export class ApiErrorClass extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  code?: string;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

/**
 * Mapeo de campos del backend (snake_case) al frontend (camelCase)
 */
const fieldMapping: Record<string, string> = {
  email: 'email',
  password: 'password',
  first_name: 'firstName',
  last_name: 'lastName',
  company_name: 'companyName',
  institution_type: 'institutionType',
  new_password: 'newPassword',
  confirm_password: 'confirmPassword',
  totp_code: 'totpCode',
};

/**
 * Extrae errores de campo de la respuesta del backend
 */
export function extractFieldErrors(payload: any): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!payload || typeof payload !== 'object') {
    return errors;
  }

  Object.entries(payload).forEach(([field, value]) => {
    // Mapear campo del backend al frontend
    const mappedField = fieldMapping[field] || field;

    // Normalizar mensaje de error
    const errorMessage = normalizeErrorMessage(value);

    if (errorMessage) {
      errors[mappedField] = errorMessage;
    }
  });

  return errors;
}

/**
 * Normaliza un mensaje de error a string
 */
function normalizeErrorMessage(value: any): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] || 'Error de validación';
  }

  if (typeof value === 'object' && value !== null) {
    // Si es un objeto con mensaje
    if (value.message) {
      return value.message;
    }
    // Si es un objeto con array de errores
    if (Array.isArray(value.errors)) {
      return value.errors[0] || 'Error de validación';
    }
  }

  return 'Error de validación';
}

/**
 * Extrae el mensaje de error principal
 */
export function extractErrorMessage(payload: any, fieldErrors: Record<string, string>): string {
  // Si hay un mensaje de error general
  if (payload?.error) {
    return payload.error;
  }

  if (payload?.message) {
    return payload.message;
  }

  if (payload?.detail) {
    return payload.detail;
  }

  // Si solo hay errores de campo, usar el primero
  const firstFieldError = Object.values(fieldErrors)[0];
  if (firstFieldError) {
    return firstFieldError;
  }

  return 'Ha ocurrido un error';
}

/**
 * Normaliza un error de API a formato estándar
 */
export function normalizeApiError(error: any): ApiError {
  // Error de red
  if (!error.response) {
    return {
      status: 0,
      message: 'Error de conexión. Verifica tu conexión a internet.',
      fieldErrors: {},
    };
  }

  const status = error.response.status;
  const payload = error.response.data;

  // Extraer errores de campo
  const fieldErrors = extractFieldErrors(payload);

  // Extraer mensaje principal
  const message = extractErrorMessage(payload, fieldErrors);

  return {
    status,
    message,
    fieldErrors,
    code: payload?.code,
  };
}
