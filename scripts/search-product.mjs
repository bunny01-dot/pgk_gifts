/**
 * Quick lookup: search Firestore products by keyword
 * Run: node scripts/search-product.mjs unicorn
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

const keyword = (process.argv[2] ?? '').toLowerCase();
const snap = await db.collection('products').get();
const matches = snap.docs.filter(d => (d.data().name ?? '').toLowerCase().includes(keyword));

if (matches.length === 0) {
  console.log(`No products found matching "${keyword}"`);
} else {
  console.log(`\nFound ${matches.length} match(es) for "${keyword}":\n`);
  for (const d of matches) {
    const data = d.data();
    console.log(`  ID      : ${d.id}`);
    console.log(`  Name    : ${data.name}`);
    console.log(`  Price   : ₹${data.price}`);
    console.log(`  Category: ${data.category}`);
    if (data.sizes) console.log(`  Sizes   : ${JSON.stringify(data.sizes)}`);
    console.log();
  }
}
