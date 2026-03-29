import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

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
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-base font-medium text-gray-900">Cerrando sesión...</p>
          </div>
        </div>
      )}

      <div className="relative" ref={menuRef}>
        {/* Botón del menú */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
          </div>

          {/* Icono de dropdown */}
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Información del usuario */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
            </div>

            {/* Opciones del menú */}
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
