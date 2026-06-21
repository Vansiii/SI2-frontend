import { apiClient } from '@/utils/apiClient';
import type {
  Notification,
  NotificationListResponse,
  UnreadCountResponse,
  PushToken,
} from '../types';

export const notificationsApi = {
  getNotifications: async (params?: {
    page?: number;
    page_size?: number;
    notification_type?: string;
    is_read?: boolean;
  }): Promise<NotificationListResponse> => {
    const response = await apiClient.get<NotificationListResponse>('/notifications/', params);
    return response;
  },

  getNotification: async (id: number): Promise<Notification> => {
    const response = await apiClient.get<Notification>(`/notifications/${id}/`);
    return response;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read/`);
    return response;
  },

  markAllAsRead: async (): Promise<{ updated: number }> => {
    const response = await apiClient.post<{ updated: number }>('/notifications/mark_all_read/');
    return response;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get<UnreadCountResponse>('/notifications/unread_count/');
    return response;
  },

  registerToken: async (data: {
    token: string;
    device_type: 'ANDROID' | 'IOS' | 'WEB';
    device_name?: string;
    device_id?: string;
  }): Promise<PushToken> => {
    const response = await apiClient.post<PushToken>('/notifications/register-token/', data);
    return response;
  },

  unregisterToken: async (token: string): Promise<void> => {
    await apiClient.delete('/notifications/unregister-token/', {
      params: { token },
    });
  },
};
