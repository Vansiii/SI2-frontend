import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Building2, 
  Home,
  Key,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  permission?: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

/**
 * Barra lateral de navegación con menú administrativo
 */
export function Sidebar({ isOpen: externalIsOpen, onToggle }: SidebarProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const { hasPermission, userType } = useAuth();
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleSidebar = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  // Definir items del menú (solo para usuarios tenant)
  const menuItems: NavItem[] = [
    {
      to: '/home',
      icon: <Home className="h-5 w-5" />,
      label: 'Inicio',
    },
    {
      to: '/users',
      icon: <Users className="h-5 w-5" />,
      label: 'Usuarios',
      permission: 'users.view',
    },
    {
      to: '/roles',
      icon: <Shield className="h-5 w-5" />,
      label: 'Roles y Permisos',
      permission: 'roles.view',
    },
    // Reportes y Configuración no están implementados aún
    // {
    //   to: '/reports',
    //   icon: <BarChart3 className="h-5 w-5" />,
    //   label: 'Reportes',
    //   permission: 'reports.view',
    // },
    // {
    //   to: '/settings',
    //   icon: <Settings className="h-5 w-5" />,
    //   label: 'Configuración',
    //   permission: 'config.view',
    // },
  ];

  // Items del menú SaaS (solo para superadmin)
  const saasMenuItems: NavItem[] = [
    {
      to: '/saas/dashboard',
      icon: <Building2 className="h-5 w-5" />,
      label: 'Panel SaaS',
    },
    {
      to: '/saas/tenants',
      icon: <Building2 className="h-5 w-5" />,
      label: 'Instituciones',
    },
    {
      to: '/saas/permissions',
      icon: <Key className="h-5 w-5" />,
      label: 'Permisos',
    },
    {
      to: '/saas/permissions/coverage',
      icon: <FileText className="h-5 w-5" />,
      label: 'Reporte Permisos',
    },
  ];

  // Filtrar items según permisos (solo para usuarios tenant)
  const visibleItems = userType === 'saas_admin' 
    ? [] // SaaS admin NO ve módulos de tenant
    : menuItems.filter(item => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
      });

  // Agregar items SaaS si es superadmin
  const allItems = userType === 'saas_admin' 
    ? [...saasMenuItems, ...visibleItems]
    : visibleItems;

  // Si no hay items visibles, no mostrar sidebar
  if (allItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          relative bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-16'}
        `}
      >
        {/* Botón toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 z-50 p-1.5 rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Toggle sidebar"
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </button>

        <nav className="h-full overflow-y-auto py-6 px-3">
          {/* Título de sección para SaaS */}
          {userType === 'saas_admin' && (
            <div className="mb-4">
              {isOpen && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Administración SaaS
                </h3>
              )}
              <div className="space-y-1">
                {saasMenuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={!isOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${!isOpen ? 'justify-center' : ''}`
                    }
                  >
                    {item.icon}
                    {isOpen && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* Título de sección para gestión (solo si hay items visibles) */}
          {visibleItems.length > 0 && (
            <div className={userType === 'saas_admin' ? 'mt-6' : ''}>
              {isOpen && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Gestión
                </h3>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={!isOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${!isOpen ? 'justify-center' : ''}`
                    }
                  >
                    {item.icon}
                    {isOpen && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
