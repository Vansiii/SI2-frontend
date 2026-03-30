import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LoadingState } from '../ui/LoadingState';
import { MainLayout } from './MainLayout';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Componente que protege rutas que requieren autenticación
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Verificando sesión..." />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar el contenido con layout
  return <MainLayout>{children}</MainLayout>;
}
