/**
 * Tipos e Interfaces Globales
 */

// ============================================
// Usuario
// ============================================

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at?: string;
}

export interface UserProfile {
  user_type: 'saas_admin' | 'tenant_user';
  phone: string;
  position: string;
  department: string;
  timezone: string;
  language: string;
}

export interface UserWithDetails extends User {
  is_active: boolean;
  date_joined: string;
  profile: UserProfile;
  institution: Institution | null;
  roles: RoleInfo[];
}

export interface RoleInfo {
  id: number;
  name: string;
  description: string;
  institution?: string; // Nombre de la institución (solo para SaaS admins)
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  code: string;
  module?: string;
  is_active: boolean;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  institution: number | null;
  permissions: Permission[];
}

export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role_ids: number[];
  phone?: string;
  position?: string;
  department?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  position?: string;
  department?: string;
  is_active?: boolean;
}

export interface AssignRolesData {
  role_ids: number[];
}

// ============================================
// Institución Financiera
// ============================================

export interface Institution {
  id: string;
  name: string;
  slug: string;
  institution_type: 'banking' | 'microfinance' | 'cooperative' | 'fintech';
}

// ============================================
// Autenticación
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  institution: Institution;
  role: string;
  user_type?: 'saas_admin' | 'tenant_user';
  roles?: string[];
  permissions?: string[];
  requires_2fa?: boolean;
  challenge_token?: string;
  method?: 'totp' | 'email';
  expires_in?: number;
}

export interface LoginErrorResponse {
  error: string;
  attempts_remaining?: number;
  blocked_until?: string;
  minutes_remaining?: number;
}

export interface TwoFactorVerifyRequest {
  challenge_token: string;
  totp_code: string;
  is_backup_code?: boolean;
}

export interface TwoFactorVerifyResponse {
  access: string;
  refresh: string;
  user: User;
  institution: Institution;
  role: string;
  user_type?: 'saas_admin' | 'tenant_user';
  roles?: string[];
  permissions?: string[];
}

export interface TwoFactorErrorResponse {
  error: string;
  attempts_remaining?: number;
}

// ============================================
// Recuperación de Contraseña
// ============================================

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetRequestResponse {
  message: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordResetConfirmResponse {
  message: string;
}

// ============================================
// 2FA (Autenticación de Dos Factores)
// ============================================

export interface TwoFactorEnableResponse {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface TwoFactorVerifySetupRequest {
  totp_code: string;
}

export interface TwoFactorVerifySetupResponse {
  message: string;
}

export interface TwoFactorStatus {
  is_enabled: boolean;
  enabled_at: string | null;
  backup_codes_remaining: number;
  method?: 'totp' | 'email';
}

export interface TwoFactorDisableRequest {
  password: string;
}

export interface TwoFactorDisableResponse {
  message: string;
}

// ============================================
// Contexto de Autenticación
// ============================================

export interface AuthContextType {
  user: User | null;
  institution: Institution | null;
  role: string | null;
  userType: 'saas_admin' | 'tenant_user' | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  updateSession: (
    user: User,
    institution: Institution,
    role: string,
    authMetadata?: {
      userType?: 'saas_admin' | 'tenant_user';
      roles?: string[];
      permissions?: string[];
    }
  ) => void;
  hasPermission: (permission: string) => boolean;
}

// ============================================
// Errores de API
// ============================================

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
  code?: string;
}
