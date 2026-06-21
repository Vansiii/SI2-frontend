import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Badge, Popover, Typography, Box, Button, Divider } from '@mui/material';
import { Bell, BellRing } from 'lucide-react';
import { useUnreadCount } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { useAdminNotifications } from '../../../contexts/AdminNotificationsContext';

interface NotificationBellProps {
  onViewAll?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onViewAll }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { count, invalidate } = useUnreadCount();
  const prevCountRef = useRef(count);
  const { isSubscribed, isLoading, subscribe } = useAdminNotifications();

  useEffect(() => {
    if (count !== prevCountRef.current) {
      invalidate();
      prevCountRef.current = count;
    }
  }, [count, invalidate]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    invalidate();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} sx={{ ml: 1 }}>
        <Badge
          badgeContent={count > 99 ? '99+' : count}
          color="error"
          invisible={count === 0}
        >
          {count > 0 ? <BellRing size={20} /> : <Bell size={20} />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 480,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Notificaciones
          </Typography>
          {count > 0 && (
            <Typography variant="caption" color="primary">
              {count} sin leer
            </Typography>
          )}
        </Box>
        <Divider />

        {count === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Bell size={48} color="#9e9e9e" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No tienes notificaciones
            </Typography>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Notificaciones Push
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {isSubscribed
                  ? 'Recibirás alertas cuando llegue una nueva solicitud.'
                  : 'Activa las notificaciones push para recibir alertas en tu navegador.'}
              </Typography>
              {!isSubscribed && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={subscribe}
                  disabled={isLoading}
                  sx={{ mt: 1 }}
                >
                  Activar Notificaciones
                </Button>
              )}
              {isSubscribed && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                  ✓ Notificaciones push activadas
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <>
            <NotificationItem compact />
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                onClick={() => {
                  handleClose();
                  onViewAll?.();
                }}
              >
                Ver todas las notificaciones
              </Button>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
};
