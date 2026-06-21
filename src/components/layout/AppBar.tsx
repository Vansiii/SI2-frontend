import { Building2, Bell, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Popover, Box, Typography, Button } from '@mui/material';
import { UserMenu } from './UserMenu';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useAdminNotifications } from '../../contexts/AdminNotificationsContext';
import { useState } from 'react';

/**
 * Barra de navegación superior del dashboard
 */
export function AppBar() {
  const navigate = useNavigate();
  const { institution, tenantBranding } = useAuth();
  const { isSubscribed, isLoading, subscribe, unsubscribe } = useAdminNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const displayName = tenantBranding?.display_name || institution?.name || 'Sistema';
  const logoUrl = tenantBranding?.logo_url || null;

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log('Bell clicked! anchorEl:', event.currentTarget);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Institución - Clickeable para ir al home */}
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-(--tenant-primary) shadow-lg overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={displayName} className="h-full w-full object-contain bg-white p-1" />
              ) : (
                <Building2 className="h-6 w-6 text-(--tenant-on-primary)" />
              )}
            </div>
            {displayName && (
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-slate-900">
                  {displayName}
                </h1>
              </div>
            )}
          </button>

          <div className="flex items-center gap-2">
            {/* Notificaciones push - siempre mostrar si está cargando o soportado */}
            <IconButton
              onClick={handleBellClick}
              size="small"
              title={isSubscribed ? 'Desactivar notificaciones' : 'Activar notificaciones'}
              sx={{ color: isSubscribed ? 'primary.main' : 'grey.500' }}
            >
              {isSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
            </IconButton>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ p: 2, minWidth: 280, border: '3px solid red', bgcolor: 'yellow' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', fontSize: 16 }}>
                  *** POPUP DE NOTIFICACIONES ***
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  isSubscribed: {String(isSubscribed)} | isLoading: {String(isLoading)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {isSubscribed
                    ? 'Recibirás notificaciones push cuando llegue una nueva solicitud de crédito.'
                    : 'Activa las notificaciones para recibir alertas en tu navegador.'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={isSubscribed ? unsubscribe : subscribe}
                    disabled={isLoading}
                  >
                    {isSubscribed ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button size="small" onClick={handleClose}>
                    Cerrar
                  </Button>
                </Box>
              </Box>
            </Popover>

            {/* Menú de Usuario */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}


