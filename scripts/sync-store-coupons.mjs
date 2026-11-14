import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

const envFile = readFileSync(envPath, 'utf8');
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}
process.env.FIREBASE_PRIVATE_KEY = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

const app = getApps()[0] || initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  })
});
const db = getFirestore(app);

async function syncCoupons() {
  console.log('Syncing official coupons in Firestore...');

  // 1. PGK15 (Flat ₹50 OFF on orders >= ₹300)
  await db.collection('coupons').doc('PGK15').set({
    code: 'PGK15',
    type: 'flat',
    value: 50,
    minOrderAmount: 300,
    active: true,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log('✅ PGK15 synced (Flat ₹50 OFF, Min ₹300)');

  // 2. PGK100 (Flat ₹100 OFF on orders >= ₹700)
  await db.collection('coupons').doc('PGK100').set({
    code: 'PGK100',
    type: 'flat',
    value: 100,
    minOrderAmount: 700,
    active: true,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log('✅ PGK100 synced (Flat ₹100 OFF, Min ₹700)');

  // 3. Deactivate retired coupons
  await db.collection('coupons').doc('BUNNY15').set({
    active: false,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log('✅ BUNNY15 deactivated');

  await db.collection('coupons').doc('WELCOME10').set({
    active: false,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log('✅ WELCOME10 deactivated');

  console.log('Done syncing coupons!');
}

syncCoupons().catch(console.error);
