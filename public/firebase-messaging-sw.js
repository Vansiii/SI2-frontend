importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDemo',
  projectId: 'fincore-98011',
  messagingSenderId: '409264124649',
  appId: '1:409264124649:web:YOUR_APP_ID',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Background message received:', payload);
  const notificationTitle = payload.notification?.title || 'Nueva notificación';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons.svg',
    badge: '/icons.svg',
    data: payload.data,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  event.waitUntil(
    clients.openWindow(window.location.origin)
  );
});