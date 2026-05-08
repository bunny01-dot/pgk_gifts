'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

type FirebaseServices = ReturnType<typeof initializeFirebase>;

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // Delay SDK initialization until after mount so Auth is created in the browser runtime.
    setFirebaseServices(initializeFirebase());
  }, []);

  if (!firebaseServices) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      messaging={firebaseServices.messaging}
    >
      {children}
    </FirebaseProvider>
  );
}
