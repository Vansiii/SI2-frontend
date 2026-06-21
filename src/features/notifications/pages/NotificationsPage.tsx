import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  Button,
  Chip,
  Skeleton,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import { CheckCircle, Bell } from 'lucide-react';
import { useNotifications, useUnreadCount } from '../hooks/useNotifications';
import { NotificationItem } from '../components/NotificationItem';

export const NotificationsPage: React.FC = () => {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const { count: unreadCount, invalidate: invalidateUnread } = useUnreadCount();
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    isRead: tab === 'unread' ? false : undefined,
    pageSize: 50,
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'all' | 'unread') => {
    setTab(newValue);
  };

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
    invalidateUnread();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    invalidateUnread();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Notificaciones
        </Typography>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckCircle size={18} />}
            onClick={handleMarkAllAsRead}
          >
            Marcar todas como leídas
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 56,
            },
          }}
        >
          <Tab
            value="all"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Bell size={18} />
                Todas
                {unreadCount > 0 && (
                  <Chip label={unreadCount} size="small" color="primary" sx={{ height: 20 }} />
                )}
              </Box>
            }
          />
          <Tab
            value="unread"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Bell size={18} />
                Sin leer
                {unreadCount > 0 && (
                  <Chip label={unreadCount} size="small" color="error" sx={{ height: 20 }} />
                )}
              </Box>
            }
          />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ p: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
              ))}
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Bell size={64} color="#9e9e9e" style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">
                {tab === 'all'
                  ? 'No tienes notificaciones'
                  : 'No tienes notificaciones sin leer'}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {tab === 'all'
                  ? 'Te notificaremos cuando haya novedades'
                  : 'Las notificaciones que leas aparecerán aquí'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                      cursor: 'pointer',
                    }}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                    secondaryAction={
                      !notification.is_read && (
                        <Tooltip title="Marcar como leída">
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                          >
                            <CheckCircle size={20} />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  >
                    <NotificationItem notification={notification} />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
