
'use client';

import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { useFirebase, useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from './use-toast';

export function useNotifications() {
  const { messaging } = useFirebase();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | 'default'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestPermission = async () => {
    try {
      const msg = await messaging();
      if (!msg) return null;

      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // You'll need to generate a VAPID key in Firebase Console -> Project Settings -> Cloud Messaging
        // and put it here. I'll use a placeholder or tell the user.
        const fcmToken = await getToken(msg, {
          vapidKey: 'BOjyrjhpkHVJ-oG2lhCCVhbkB352qpLAyMro-YkAF-ecMqk_Uzuy7bx6W0vGAWzDA_vkXBdnGt4s5pyKa4RH2wA'
        });

        if (fcmToken) {
          setToken(fcmToken);
          if (user && firestore) {
            await setDoc(doc(firestore, 'notification_tokens', user.uid), {
              token: fcmToken,
              email: user.email,
              userId: user.uid,
              updatedAt: serverTimestamp(),
              platform: 'web'
            });
          }
          return fcmToken;
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
    return null;
  };

  useEffect(() => {
    let unsubscribe: any;

    const setupListener = async () => {
      const msg = await messaging();
      if (msg) {
        unsubscribe = onMessage(msg, (payload) => {
          toast({
            title: payload.notification?.title || 'New Notification',
            description: payload.notification?.body || 'You have a new message.',
          });
        });
      }
    };

    setupListener();
    return () => unsubscribe?.();
  }, [messaging, toast]);

  return { token, requestPermission, permission };
}
