import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

async function listAllCoupons() {
  console.log('\n==========================================');
  console.log('📋 CURRENT STORE COUPONS IN FIRESTORE');
  console.log('==========================================\n');

  console.log('--- 1. customer_coupons collection ---');
  const custSnap = await db.collection('customer_coupons').get();
  console.log(`Total documents: ${custSnap.size}`);
  custSnap.forEach((doc) => {
    console.log(`- Code: ${doc.id}`);
    console.log(`  Details:`, JSON.stringify(doc.data(), null, 2));
  });

  console.log('\n--- 2. coupons collection (Legacy/Generic) ---');
  const legacySnap = await db.collection('coupons').get();
  console.log(`Total documents: ${legacySnap.size}`);
  legacySnap.forEach((doc) => {
    console.log(`- Code: ${doc.id}`);
    console.log(`  Details:`, JSON.stringify(doc.data(), null, 2));
  });

  console.log('\n--- 3. Direct Hardcoded Validation Fallbacks in Code ---');
  console.log('- Code: PGK15');
  console.log('  Discount: Flat ₹50 OFF');
  console.log('  Minimum Purchase: ₹300');
  console.log('- Code: PGK100');
  console.log('  Discount: Flat ₹100 OFF');
  console.log('  Minimum Purchase: ₹700 (auto-adjusts to PGK15 if ₹300-₹699)');
}

listAllCoupons().catch(console.error);
