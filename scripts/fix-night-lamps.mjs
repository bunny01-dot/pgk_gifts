/**
 * fix-night-lamps.mjs
 * One-time fix: Set all Night Lamp prices to ₹102, except the two premium ones (~₹512).
 * Also fixes wrong category name "Light Lamps" → "Night Lamps".
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
const app = getApps()[0] ?? initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: pk,
}) });
const db = getFirestore(app);

// ── Fixes to apply ──────────────────────────────────────────────────────────
// IDs to fix price to ₹102 (and category if needed)
const FIX_TO_102 = [
  { id: 'PZVF69qBW5z9PYIVaffb', name: 'Deluxe Panda Night Lamp'  },  // was ₹512 wrongly
  { id: 'zzb2HODFdfR8xAcTMxzM', name: 'Grand Edition Night Light' },  // was ₹512 wrongly
  { id: 't3zVNmw7UICFOmGQM1ZU', name: 'Panda Light Lamp'          },  // was ₹513 + wrong category
];

// IDs that only need category fix (price is already correct)
const FIX_CATEGORY_ONLY = [
  { id: 'cyx8MqSdo0O4FmJNrZom', name: 'Sleeping Panda Lamp' },  // Light Lamps → Night Lamps
];

const batch = db.batch();

for (const item of FIX_TO_102) {
  const ref = db.collection('products').doc(item.id);
  batch.update(ref, { price: 102, category: 'Night Lamps' });
  console.log(`  💰 "${item.name}"  → ₹102 + category: Night Lamps`);
}

for (const item of FIX_CATEGORY_ONLY) {
  const ref = db.collection('products').doc(item.id);
  batch.update(ref, { category: 'Night Lamps' });
  console.log(`  🏷️  "${item.name}"  → category: Night Lamps (price unchanged)`);
}

console.log('\n⬆️  Committing fixes...');
await batch.commit();
console.log('\n✅ All Night Lamp issues fixed!\n');
console.log('Kept at ~₹512 (premium):');
console.log('  ✅ Panda Night Lamp (Scarf Edition) — ₹512');
console.log('  ✅ Silicone Bunny Rabbit Lamp       — ₹512\n');
