
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB3yOIHtLgi-wB32WxiXGDgebcU5_rMjJc",
  authDomain: "studio-9926110666-40bc2.firebaseapp.com",
  projectId: "studio-9926110666-40bc2",
  storageBucket: "studio-9926110666-40bc2.firebasestorage.app",
  messagingSenderId: "661527725223",
  appId: "1:661527725223:web:f2f9227874292bd610c782"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
