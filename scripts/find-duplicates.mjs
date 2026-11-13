/**
 * find-duplicates.mjs
 * Lists all duplicate products in Firestore grouped by normalized name.
 * Run with: node scripts/find-duplicates.mjs
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

try {
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
} catch (e) { console.error('❌ Could not load .env.local:', e.message); process.exit(1); }

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let privateKey = process.env.FIREBASE_PRIVATE_KEY ?? '';
privateKey = privateKey.replace(/\\n/g, '\n');

const app = getApps()[0] ?? initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey,
}) });
const db = getFirestore(app);

function normalize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  const snapshot = await db.collection('products').get();
  console.log(`\n📦 Total products in Firestore: ${snapshot.size}\n`);

  // Group by normalized name
  const groups = {};
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const key = normalize(data.name ?? '');
    if (!groups[key]) groups[key] = [];
    groups[key].push({ id: doc.id, name: data.name, price: data.price, category: data.category });
  }

  const duplicates = Object.entries(groups).filter(([, docs]) => docs.length > 1);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  console.log(`⚠️  Found ${duplicates.length} duplicate group(s):\n`);
  for (const [key, docs] of duplicates) {
    console.log(`  "${docs[0].name}"  (${docs.length} copies)`);
    for (const d of docs) {
      console.log(`    → ID: ${d.id}  |  ₹${d.price}  |  ${d.category}`);
    }
    console.log();
  }
}

main().catch(err => { console.error('❌', err); process.exit(1); });
