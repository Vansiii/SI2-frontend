import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { initializeFirebase, requestNotificationPermission } from '@/lib/firebase/firebase';
import { notificationsApi } from '@/features/notifications/services/notificationsApi';

interface AdminNotificationsContextType {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  token: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

const AdminNotificationsContext = createContext<AdminNotificationsContextType | null>(null);

interface AdminNotificationsProviderProps {
  children: ReactNode;
}

export function AdminNotificationsProvider({ children }: AdminNotificationsProviderProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      try {
        console.log('AdminNotificationsProvider: checking support...');
        
        if (typeof window === 'undefined' || !('Notification' in window)) {
          console.log('Notifications not supported in this browser');
          setIsSupported(false);
          setIsLoading(false);
          return;
        }

        console.log('Browser supports notifications, initializing Firebase...');
        const result = await initializeFirebase();
        console.log('Firebase initialized:', result);
        setIsSupported(!!result);

        if (!result) {
          setIsLoading(false);
          return;
        }

        const existingToken = localStorage.getItem('fcm_web_token');
        console.log('Existing token:', existingToken ? 'found' : 'not found');

        if (existingToken) {
          setToken(existingToken);
          setIsSubscribed(true);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error in AdminNotificationsProvider:', err);
        setError(String(err));
        setIsSupported(false);
        setIsLoading(false);
      }
    };

    checkSupport();
  }, []);

  useEffect(() => {
    if (!isSubscribed || !token) return;

    const setupMessageListener = async () => {
      const { onMessageListener } = await import('@/lib/firebase/firebase');
      onMessageListener((payload: unknown) => {
        console.log('FCM message received:', payload);
        const p = payload as { notification?: { title?: string; body?: string; data?: Record<string, string> } };
        if (p.notification) {
          toast(p.notification.title || 'Nueva notificación', {
            description: p.notification.body,
            duration: 10000,
          });
        }
      });
    };

    setupMessageListener();
  }, [isSubscribed, token]);

  const subscribe = async () => {
    if (!isSupported) return;

    try {
      setIsLoading(true);

      const fcmToken = await requestNotificationPermission();
      if (!fcmToken) {
        toast.error('No se pudo obtener el token de notificaciones. Verifica que el VAPID key esté configurado.');
        return;
      }

      const registered = await notificationsApi.registerToken({
        token: fcmToken,
        device_type: 'WEB',
        device_name: (navigator.userAgent || 'Unknown').substring(0, 100),
      });

      if (registered) {
        localStorage.setItem('fcm_web_token', fcmToken);
        setToken(fcmToken);
        setIsSubscribed(true);
        toast.success('Notificaciones habilitadas');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Error al suscribirse a notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      await notificationsApi.unregisterToken(token);

      localStorage.removeItem('fcm_web_token');
      setToken(null);
      setIsSubscribed(false);
      toast.success('Notificaciones deshabilitadas');
    } catch (error) {
      console.error('Error unsubscribing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminNotificationsContext.Provider
      value={{
        isSupported,
        isSubscribed,
        isLoading,
        token,
        subscribe,
        unsubscribe,
      }}
    >
      {error && (
        <div style={{ color: 'red', padding: 10, border: '1px solid red', margin: 10 }}>
          Notification Error: {error}
        </div>
      )}
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications(): AdminNotificationsContextType {
  const context = useContext(AdminNotificationsContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within AdminNotificationsProvider');
  }
  return context;
}
