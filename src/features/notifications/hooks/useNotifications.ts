import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../services/notificationsApi';
import type { NotificationListResponse } from '../types';

export const useNotifications = (options?: {
  pageSize?: number;
  notificationType?: string;
  isRead?: boolean;
}) => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: [
      'notifications',
      options?.notificationType,
      options?.isRead,
    ],
    queryFn: () =>
      notificationsApi.getNotifications({
        page: 1,
        page_size: options?.pageSize || 20,
        notification_type: options?.notificationType,
        is_read: options?.isRead,
      }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['notifications', options?.notificationType, options?.isRead],
        (old: NotificationListResponse | undefined) => {
          if (!old?.results) return old;
          return {
            ...old,
            results: old.results.map((n) =>
              n.id === data.id ? { ...n, is_read: true } : n
            ),
          };
        }
      );
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData(
        ['notifications', options?.notificationType, options?.isRead],
        (old: NotificationListResponse | undefined) => {
          if (!old?.results) return old;
          return {
            ...old,
            results: old.results.map((n) => ({ ...n, is_read: true })),
          };
        }
      );
    },
  });

  return {
    notifications: notificationsQuery.data?.results || [],
    totalCount: notificationsQuery.data?.count || 0,
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
};

export const useUnreadCount = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  };

  return {
    count: query.data?.count || 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
    invalidate,
  };
};
