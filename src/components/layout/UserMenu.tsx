import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LoadingState } from '../ui/LoadingState';

/**
 * Menú de usuario con dropdown
 */
export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevenir múltiples clics
    
    setIsOpen(false); // Cerrar el menú inmediatamente
    setIsLoggingOut(true);
    
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Redirigir de todos modos
      navigate('/login');
    }
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.first_name?.charAt(0) || '';
    const lastInitial = user.last_name?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  };

  return (
    <>
      {/* Overlay de carga al cerrar sesión - Fondo claro */}
      {isLoggingOut && (
        <LoadingState message="Cerrando sesión... Por favor espera" overlay={true} size="lg" />
      )}

      <div className="relative" ref={menuRef}>
        {/* Botón del menú */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="true"
          disabled={isLoggingOut}
        >
          {/* Avatar con iniciales */}
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-medium text-sm">
            {getInitials()}
          </div>

          {/* Nombre del usuario (oculto en mobile) */}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-900">
              {user?.first_name} {user?.last_name}
            </p>
          </div>

          {/* Icono de dropdown */}
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Información del usuario */}
            <div className="px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-medium text-slate-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
            </div>

            {/* Opciones del menú */}
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <User className="h-4 w-4" />
              Ver Perfil
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </>
  );
}


