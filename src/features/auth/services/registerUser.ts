import type {
  RegisterUserResponse,
  RegistrationFieldErrors,
  SaasRegistrationData,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '/api';

const backendToFrontendFieldMap: Record<string, keyof RegistrationFieldErrors> = {
  company_name: 'companyName',
  companyName: 'companyName',
  institution_type: 'industry',
  institutionType: 'industry',
  first_name: 'firstName',
  firstName: 'firstName',
  last_name: 'lastName',
  lastName: 'lastName',
  email: 'email',
  password: 'password',
  confirm_password: 'confirmPassword',
  confirmPassword: 'confirmPassword',
  non_field_errors: 'form',
  nonFieldErrors: 'form',
  detail: 'form',
};

export class RegisterUserApiError extends Error {
  fieldErrors: RegistrationFieldErrors;

  constructor(message: string, fieldErrors: RegistrationFieldErrors = {}) {
    super(message);
    this.name = 'RegisterUserApiError';
    this.fieldErrors = fieldErrors;
  }
}

function normalizeErrorMessage(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item))
      .join(' ')
      .trim();
  }

  return String(value).trim();
}

function extractFieldErrors(payload: unknown): RegistrationFieldErrors {
  const errors: RegistrationFieldErrors = {};

  if (!payload || typeof payload !== 'object') {
    return errors;
  }

  Object.entries(payload as Record<string, unknown>).forEach(([field, value]) => {
    if (value == null) {
      return;
    }

    const mappedField = backendToFrontendFieldMap[field] ?? 'form';
    const errorMessage = normalizeErrorMessage(value);

    if (errorMessage) {
      errors[mappedField] = errorMessage;
    }
  });

  return errors;
}

function extractErrorMessage(payload: unknown, fieldErrors: RegistrationFieldErrors): string {
  if (fieldErrors.form) {
    return fieldErrors.form;
  }

  const priorityFields: Array<keyof RegistrationFieldErrors> = [
    'email',
    'password',
    'confirmPassword',
    'companyName',
    'industry',
    'firstName',
    'lastName',
  ];

  const firstFieldMessage = priorityFields
    .map((field) => fieldErrors[field])
    .find((message) => typeof message === 'string' && message.length > 0);

  if (firstFieldMessage) {
    return firstFieldMessage;
  }

  if (payload && typeof payload === 'object' && 'message' in payload) {
    return String((payload as { message: unknown }).message);
  }

  return 'No se pudo completar el registro. Intenta nuevamente.';
}

export async function registerUser(payload: SaasRegistrationData): Promise<RegisterUserResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      companyName: payload.companyName,
      institutionType: payload.industry,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    }),
  });

  const responsePayload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const fieldErrors = extractFieldErrors(responsePayload);
    const message = extractErrorMessage(responsePayload, fieldErrors);
    throw new RegisterUserApiError(message, fieldErrors);
  }

  return responsePayload as RegisterUserResponse;
}
