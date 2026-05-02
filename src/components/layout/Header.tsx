import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { LoadingState } from '../ui/LoadingState';

interface HeaderProps {
  onMenuClick?: () => void;
}

/**
 * Header con información del usuario y opciones
 */
export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, institution, tenantBranding } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayName = tenantBranding?.display_name || institution?.name || 'Sistema';
  const logoUrl = tenantBranding?.logo_url || null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowDropdown(false);
    
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
    }
  };

  const handleProfile = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  const getInitials = () => {
    if (!user) return '?';
    const firstInitial = user.first_name?.charAt(0) || '';
    const lastInitial = user.last_name?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || user.email.charAt(0).toUpperCase();
  };

  // Manejar clics fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      {/* Loading overlay cuando está cerrando sesión */}
      {isLoggingOut && (
        <LoadingState message="Cerrando sesión... Por favor espera" overlay={true} size="lg" />
      )}

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* Logo/Institución */}
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6 text-slate-700" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md overflow-hidden bg-(--tenant-primary)">
                {logoUrl ? (
                  <img src={logoUrl} alt={displayName} className="h-full w-full object-contain bg-white p-1" />
                ) : (
                  <span className="text-(--tenant-on-primary) font-bold text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="font-semibold text-slate-900 text-lg">
                {displayName}
              </span>
            </div>
          </div>

          {/* Usuario */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200"
              type="button"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-md bg-(--tenant-primary)">
                <span className="text-white font-semibold text-sm">
                  {getInitials()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-slate-900">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-slate-500">
                  {user?.email}
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                  showDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-slate-200 py-2 z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-(--tenant-primary)">
                      <span className="text-white font-semibold">
                        {getInitials()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={handleProfile}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                    type="button"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <User className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
                    </div>
                    <span className="font-medium">Mi Perfil</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 my-1" />

                {/* Logout button */}
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                    type="button"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                      <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}


