import 'server-only';

import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { AppCheck, getAppCheck } from 'firebase-admin/app-check';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let adminApp: App | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  let privateKey = requiredEnv('FIREBASE_PRIVATE_KEY');
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const app = getApps()[0] || initializeApp({
    credential: cert({
      projectId: requiredEnv('FIREBASE_PROJECT_ID'),
      clientEmail: requiredEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey,
    }),
  });
  
  adminApp = app;
  return adminApp;
}

export function getAdminAuth(): Auth {
  if (!auth) {
    auth = getAuth(getAdminApp());
  }
  return auth;
}

export function getAdminDb(): Firestore {
  if (!db) {
    db = getFirestore(getAdminApp());
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch (e) {
      // settings might have already been set on this instance
    }
  }
  return db;
}

let appCheck: AppCheck | undefined = undefined;

export function getAdminAppCheck(): AppCheck {
  if (!appCheck) {
    appCheck = getAppCheck(getAdminApp());
  }
  return appCheck;
}
