import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Institution, LoginCredentials, LoginResponse, AuthContextType } from '../types';
import { getAccessToken, clearTokens, saveTokens } from '../utils/tokenManager';
import { apiClient } from '../utils/apiClient';

// Crear el contexto
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [role, setRole] = useState<string | null>(null);
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

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedInstitution) {
          setInstitution(JSON.parse(storedInstitution));
        }
        if (storedRole) {
          setRole(storedRole);
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
  const updateSession = (userData: User, institutionData: Institution, userRole: string) => {
    saveSession(userData, institutionData, userRole);
  };

  const value: AuthContextType = {
    user,
    institution,
    role,
    isAuthenticated: !!user && !!getAccessToken(),
    isLoading,
    login,
    logout,
    updateUser,
    updateSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
