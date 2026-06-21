import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export async function initializeFirebase(): Promise<{ app: FirebaseApp; messaging: Messaging } | null> {
  if (app && messaging) {
    return { app, messaging };
  }

  try {
    console.log('Initializing Firebase with config:', {
      apiKey: firebaseConfig.apiKey ? 'set' : 'missing',
      projectId: firebaseConfig.projectId,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId ? 'set' : 'missing',
    });

    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    messaging = getMessaging(app);

    console.log('Firebase initialized successfully');
    return { app, messaging };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const result = await initializeFirebase();
      if (!result) return null;

      const { getToken } = await import('firebase/messaging');
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        console.error('VAPID key not configured');
        return null;
      }

      const token = await getToken(result.messaging, { vapidKey });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

export function onMessageListener(callback: (payload: unknown) => void): () => void {
  if (!messaging) {
    return () => {};
  }

  import('firebase/messaging').then(({ onMessage }) => {
    if (messaging) {
      onMessage(messaging, callback);
    }
  });

  return () => {};
}
