import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { useAuth } from '../../features/auth/hooks/useAuth';

/**
 * Barra de navegación superior del dashboard
 */
export function AppBar() {
  const navigate = useNavigate();
  const { institution } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Institución - Clickeable para ir al home */}
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-600 shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            {institution && (
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  {institution.name}
                </h1>
              </div>
            )}
          </button>

          {/* Menú de Usuario */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
