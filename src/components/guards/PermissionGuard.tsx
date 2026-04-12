import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Componente que protege rutas basándose en permisos del usuario.
 * 
 * @param children - Contenido a renderizar si el usuario tiene el permiso
 * @param permission - Permiso requerido (ej: 'users.view', 'users.create')
 * @param fallback - Componente a mostrar si no tiene permiso (opcional)
 * @param redirectTo - Ruta a la que redirigir si no tiene permiso (opcional)
 */
export function PermissionGuard({
  children,
  permission,
  fallback,
  redirectTo = '/home',
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = useAuth();

  // Mientras carga, no mostrar nada
  if (isLoading) {
    return null;
  }

  // Si no tiene permiso
  if (!hasPermission(permission)) {
    // Si hay fallback, mostrarlo
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Si no, redirigir
    return <Navigate to={redirectTo} replace />;
  }

  // Si tiene permiso, mostrar contenido
  return <>{children}</>;
}
