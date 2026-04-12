import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Building2, 
  Home,
  LayoutDashboard,
  PieChart,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Package,
  CreditCard
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
      to: '/clients',
      icon: <UserCircle className="h-5 w-5" />,
      label: 'Clientes',
      permission: 'clients.view',
    },
    {
      to: '/products',
      icon: <Package className="h-5 w-5" />,
      label: 'Productos Crediticios',
      permission: 'products.view',
    },
    {
      to: '/loans',
      icon: <CreditCard className="h-5 w-5" />,
      label: 'Solicitudes',
      permission: 'loans.view',
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
    {
      to: '/subscription/current',
      icon: <Building2 className="h-5 w-5" />,
      label: 'Mi Suscripción',
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
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Panel SaaS',
    },
    {
      to: '/saas/tenants',
      icon: <Building2 className="h-5 w-5" />,
      label: 'Instituciones',
    },
    {
      to: '/saas/plans',
      icon: <Package className="h-5 w-5" />,
      label: 'Planes de Suscripción',
    },
    {
      to: '/saas/permissions',
      icon: <Shield className="h-5 w-5" />,
      label: 'Permisos',
    },
    {
      to: '/saas/permissions/coverage',
      icon: <PieChart className="h-5 w-5" />,
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
          relative bg-white/80 backdrop-blur-xl border-r border-slate-200
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Botón toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-8 z-50 p-1.5 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 transition-colors"
          aria-label="Toggle sidebar"
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-600" />
          )}
        </button>

        <nav className="h-full overflow-y-auto py-6 px-3">
          {/* Título de sección para SaaS */}
          {userType === 'saas_admin' && (
            <div className="mb-4">
              {isOpen && (
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Administración SaaS
                </h3>
              )}
              <div className="space-y-1">
                {saasMenuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/saas/permissions'}
                    title={!isOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 shadow-md shadow-blue-500/20 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
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
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
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
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 shadow-md shadow-blue-500/20 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
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
