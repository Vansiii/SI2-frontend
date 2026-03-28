export interface SaasRegistrationData {
  companyName: string;
  industry: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterUserResponse {
  message: string;
  institution: {
    id: number;
    name: string;
    slug: string;
    institution_type: string;
  };
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface RegistrationFieldErrors {
  companyName?: string;
  industry?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}
