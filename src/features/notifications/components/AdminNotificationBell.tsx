import { Button, Popover } from '@mui/material';
import { Bell, BellOff } from 'lucide-react';
import { useAdminNotifications } from '@/contexts/AdminNotificationsContext';

export function AdminNotificationBell() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = useAdminNotifications();

  if (!isSupported) {
    return null;
  }

  return (
    <Popover
      anchorEl={null}
      open={false}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <div style={{ padding: 16, minWidth: 200 }}>
        <p style={{ marginBottom: 8 }}>
          {isSubscribed
            ? 'Recibirás notificaciones de nuevas solicitudes.'
            : 'Activa las notificaciones para recibir alertas.'}
        </p>
        <Button
          variant="contained"
          size="small"
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading}
          startIcon={isSubscribed ? <BellOff size={16} /> : <Bell size={16} />}
        >
          {isSubscribed ? 'Desactivar' : 'Activar'}
        </Button>
      </div>
    </Popover>
  );
}
