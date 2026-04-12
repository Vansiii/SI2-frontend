import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Institution, LoginCredentials, LoginResponse, AuthContextType } from '../types';
import { getAccessToken, clearTokens, saveTokens } from '../utils/tokenManager';
import { apiClient } from '../utils/apiClient';

type SessionAuthMetadata = {
  userType?: 'saas_admin' | 'tenant_user';
  roles?: string[];
  permissions?: string[];
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userType, setUserType] = useState<'saas_admin' | 'tenant_user' | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de sesión al iniciar
  useEffect(() => {
    loadSession();
  }, []);

  /**
   * Carga la sesión desde localStorage
   */
  const loadSession = () => {
    try {
      const token = getAccessToken();
      
      if (token) {
        const storedUser = localStorage.getItem('user');
        const storedInstitution = localStorage.getItem('institution');
        const storedRole = localStorage.getItem('role');
        const storedUserType = localStorage.getItem('userType');
        const storedRoles = localStorage.getItem('roles');
        const storedPermissions = localStorage.getItem('permissions');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedInstitution) {
          setInstitution(JSON.parse(storedInstitution));
        }
        if (storedRole) {
          setRole(storedRole);
        }
        if (storedUserType) {
          setUserType(storedUserType as 'saas_admin' | 'tenant_user');
        }
        if (storedRoles) {
          setRoles(JSON.parse(storedRoles));
        }
        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions));
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Guarda los datos de sesión en localStorage
   */
  const saveSession = (userData: User, institutionData: Institution, userRole: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('institution', JSON.stringify(institutionData));
    localStorage.setItem('role', userRole);
    
    setUser(userData);
    setInstitution(institutionData);
    setRole(userRole);
  };

  const syncAuthMetadata = (authMetadata?: SessionAuthMetadata) => {
    if (!authMetadata) {
      return;
    }

    if (authMetadata.userType) {
      setUserType(authMetadata.userType);
      localStorage.setItem('userType', authMetadata.userType);
    }

    if (authMetadata.roles) {
      setRoles(authMetadata.roles);
      localStorage.setItem('roles', JSON.stringify(authMetadata.roles));
    }

    if (authMetadata.permissions) {
      setPermissions(authMetadata.permissions);
      localStorage.setItem('permissions', JSON.stringify(authMetadata.permissions));
    }
  };

  /**
   * Login del usuario
   */
  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/auth/login/',
        credentials,
        { skipAuth: true }
      );

      // Si no requiere 2FA, guardar sesión
      if (!response.requires_2fa) {
        saveTokens(response.access, response.refresh);
        saveSession(response.user, response.institution, response.role);
        
        // Guardar permisos y tipo de usuario
        const userTypeValue = response.user_type || 'tenant_user';
        const rolesValue = response.roles || [];
        const permissionsValue = response.permissions || [];

        syncAuthMetadata({
          userType: userTypeValue,
          roles: rolesValue,
          permissions: permissionsValue,
        });
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout del usuario
   */
  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        // Intentar hacer logout en el backend
        await apiClient.post('/auth/logout/', { refresh: refreshToken }).catch(() => {
          // Si falla, continuar con logout local
        });
      }
    } finally {
      // Limpiar sesión local siempre
      clearTokens();
      setUser(null);
      setInstitution(null);
      setRole(null);
      setUserType(null);
      setRoles([]);
      setPermissions([]);
      
      // Limpiar localStorage
      localStorage.removeItem('userType');
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');
    }
  };

  /**
   * Actualiza los datos del usuario
   */
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Actualiza toda la sesión (usuario, institución y rol)
   */
  const updateSession = (
    userData: User,
    institutionData: Institution,
    userRole: string,
    authMetadata?: SessionAuthMetadata
  ) => {
    saveSession(userData, institutionData, userRole);
    syncAuthMetadata(authMetadata);
  };

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: string): boolean => {
    // Superadmin SaaS tiene todos los permisos
    if (userType === 'saas_admin') {
      return true;
    }
    
    // Verificar si el permiso está en la lista
    return permissions.includes(permission) || permissions.includes('*');
  };

  const value: AuthContextType = {
    user,
    institution,
    role,
    userType,
    roles,
    permissions,
    isAuthenticated: !!user && !!getAccessToken(),
    isLoading,
    login,
    logout,
    updateUser,
    updateSession,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// Exportaciones
export { AuthContext, AuthProvider };