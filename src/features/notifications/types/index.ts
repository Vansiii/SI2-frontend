export interface Notification {
  id: number;
  notification_type: NotificationType;
  notification_type_display: string;
  title: string;
  body: string;
  data_json?: Record<string, unknown>;
  image_url?: string;
  click_action?: string;
  is_read: boolean;
  read_at?: string;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
  time_ago?: string;
}

export type NotificationType =
  | 'MORA_ALERT'
  | 'PAYMENT_REMINDER'
  | 'STATUS_CHANGE'
  | 'NEW_MESSAGE'
  | 'SYSTEM'
  | 'MARKETING'
  | 'GENERAL';

export interface NotificationListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Notification[];
}

export interface UnreadCountResponse {
  count: number;
}

export interface PushToken {
  id: number;
  token: string;
  device_type: 'ANDROID' | 'IOS' | 'WEB';
  device_name?: string;
  device_id?: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
}

export interface SendNotificationPayload {
  user_ids: number[];
  notification_type?: NotificationType;
  title: string;
  body: string;
  data_json?: Record<string, unknown>;
  image_url?: string;
  click_action?: string;
  template_id?: number;
  template_context?: Record<string, unknown>;
}
