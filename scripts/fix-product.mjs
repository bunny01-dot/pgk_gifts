/**
 * fix-product.mjs
 * Fix a single product's price and category by Firestore document ID.
 * Run: node scripts/fix-product.mjs
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

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
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  if (!process.env[key]) process.env[key] = val;
}

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let pk = (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: pk }) });
const db = getFirestore(app);

// ── Fix Magical Unicorn Lamp ──────────────────────────────────────────────
const docId   = 'kZx0jA1C6mIkx1qt51gG';
const updates = {
  price: 102,                 // ₹99 net target (102 / 0.9764 ≈ 99)
  category: 'Night Lamps',   // Fix old "Light Lamps" category name
};

const ref = db.collection('products').doc(docId);
const snap = await ref.get();

if (!snap.exists) {
  console.error(`❌ Document "${docId}" not found.`);
  process.exit(1);
}

const before = snap.data();
console.log(`\n🔍 Before:`);
console.log(`   Name    : ${before.name}`);
console.log(`   Price   : ₹${before.price}`);
console.log(`   Category: ${before.category}`);

await ref.update(updates);

console.log(`\n✅ After:`);
console.log(`   Price   : ₹${updates.price}`);
console.log(`   Category: ${updates.category}`);
console.log(`\n✔ "Magical Unicorn Lamp" fixed.\n`);
