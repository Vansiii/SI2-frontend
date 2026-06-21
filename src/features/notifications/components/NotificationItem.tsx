import React from 'react';
import { Box, Typography, Chip, Icon } from '@mui/material';
import { AlertTriangle, CreditCard, ArrowLeftRight, MessageSquare, Settings, Megaphone, Bell } from 'lucide-react';
import type { Notification, NotificationType } from '../types';

interface NotificationItemProps {
  notification?: Notification;
  compact?: boolean;
  onClick?: () => void;
}

const getNotificationIcon = (type: NotificationType): React.ReactNode => {
  const iconProps = { size: 20 };

  switch (type) {
    case 'MORA_ALERT':
      return <Icon component={() => <AlertTriangle {...iconProps} color="warning" />} />;
    case 'PAYMENT_REMINDER':
      return <Icon component={() => <CreditCard {...iconProps} color="info" />} />;
    case 'STATUS_CHANGE':
      return <Icon component={() => <ArrowLeftRight {...iconProps} color="secondary" />} />;
    case 'NEW_MESSAGE':
      return <Icon component={() => <MessageSquare {...iconProps} color="success" />} />;
    case 'SYSTEM':
      return <Icon component={() => <Settings {...iconProps} color="disabled" />} />;
    case 'MARKETING':
      return <Icon component={() => <Megaphone {...iconProps} color="error" />} />;
    default:
      return <Icon component={() => <Bell {...iconProps} color="primary" />} />;
  }
};

const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'MORA_ALERT':
      return '#ff9800';
    case 'PAYMENT_REMINDER':
      return '#2196f3';
    case 'STATUS_CHANGE':
      return '#9c27b0';
    case 'NEW_MESSAGE':
      return '#4caf50';
    case 'SYSTEM':
      return '#9e9e9e';
    case 'MARKETING':
      return '#f44336';
    default:
      return '#1976d2';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  compact = false,
  onClick,
}) => {
  if (compact) {
    return (
      <Box
        sx={{
          p: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={onClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: `${getNotificationColor('GENERAL')}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={20} color={getNotificationColor('GENERAL')} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              Nueva notificación
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Tienes {notification?.notification_type || 'GENERAL'} sin leer
            </Typography>
          </Box>
          {!notification?.is_read && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                flexShrink: 0,
              }}
            />
          )}
        </Box>
      </Box>
    );
  }

  if (!notification) return null;

  return (
    <Box
      sx={{
        p: 2,
        cursor: 'pointer',
        bgcolor: notification.is_read ? 'transparent' : 'action.hover',
        '&:hover': { bgcolor: 'action.selected' },
        transition: 'background-color 0.2s',
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${getNotificationColor(notification.notification_type)}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {getNotificationIcon(notification.notification_type)}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: notification.is_read ? 400 : 700 }} noWrap>
              {notification.title}
            </Typography>
            {!notification.is_read && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  flexShrink: 0,
                }}
              />
            )}
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {notification.body}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip
              label={notification.notification_type_display}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: `${getNotificationColor(notification.notification_type)}20`,
                color: getNotificationColor(notification.notification_type),
              }}
            />
            <Typography variant="caption" color="text.disabled">
              {notification.time_ago || formatTimeAgo(notification.created_at)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} hr`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('es-ES');
}
