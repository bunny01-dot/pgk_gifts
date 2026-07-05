'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

type FirebaseServices = ReturnType<typeof initializeFirebase>;

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // Delay SDK initialization until after mount so Auth is created in the browser runtime.
    const services = initializeFirebase();
    setFirebaseServices(services);

    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV !== 'production') {
        (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (siteKey && siteKey !== '6Ld-placeholder-recaptcha-key') {
        try {
          initializeAppCheck(services.firebaseApp, {
            provider: new ReCaptchaV3Provider(siteKey),
            isTokenAutoRefreshEnabled: true,
          });
        } catch (err) {
          console.warn('Firebase App Check failed to initialize:', err);
        }
      } else {
        console.log('Firebase App Check skipped: ReCAPTCHA site key not configured.');
      }
    }
  }, []);

  if (!firebaseServices) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
      messaging={firebaseServices.messaging}
    >
      {children}
    </FirebaseProvider>
  );
}
