/**
 * remove-duplicates.mjs
 *
 * Removes duplicate Firestore products.
 * Strategy: Keep the document with the MOST DATA (longest JSON) — usually
 * the admin-portal entry with images/descriptions. If tied, keep the one
 * whose ID looks like an auto-generated Firestore ID (not a slug).
 *
 * Run with: node scripts/remove-duplicates.mjs
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

// Normalize product name for grouping
function normalize(name) {
  return (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Firestore auto-generated IDs are 20 chars of [a-zA-Z0-9] — detect slug-style IDs
function isSlugId(id) {
  return id.includes('-') || id.includes('_');
}

// Score a document — higher = more complete / preferred to KEEP
function score(doc) {
  const data = doc.data();
  let s = 0;
  if (data.images && data.images.length > 0) s += 100;   // has gallery images
  if (data.description && data.description.length > 50) s += 50; // detailed description
  if (data.tags && data.tags.length > 0) s += 20;         // has tags
  if (data.sizes && data.sizes.length > 0) s += 30;       // has sizes
  if (!isSlugId(doc.id)) s += 40;                         // prefer auto-generated IDs (admin portal)
  s += JSON.stringify(data).length / 100;                  // more data = better
  return s;
}

async function main() {
  console.log('\n🔍 Fetching all products...\n');
  const snapshot = await db.collection('products').get();
  console.log(`📦 Total: ${snapshot.size} documents\n`);

  // Group by normalized name
  const groups = {};
  for (const doc of snapshot.docs) {
    const key = normalize(doc.data().name);
    if (!groups[key]) groups[key] = [];
    groups[key].push(doc);
  }

  const duplicateGroups = Object.entries(groups).filter(([, docs]) => docs.length > 1);
  console.log(`⚠️  Found ${duplicateGroups.length} duplicate group(s). Cleaning up...\n`);

  let deletedCount = 0;
  const batchSize = 400;
  let currentBatch = db.batch();
  let batchCount = 0;

  for (const [, docs] of duplicateGroups) {
    // Sort descending by score — first item is the one to KEEP
    docs.sort((a, b) => score(b) - score(a));

    const keep = docs[0];
    const toDelete = docs.slice(1);

    console.log(`  ✅ Keep  "${keep.data().name}"  [${keep.id}]  score=${score(keep).toFixed(1)}`);
    for (const d of toDelete) {
      console.log(`  🗑️  Delete                          [${d.id}]  score=${score(d).toFixed(1)}`);
      currentBatch.delete(d.ref);
      batchCount++;
      deletedCount++;

      // Firestore batch limit is 500 ops
      if (batchCount >= batchSize) {
        console.log(`\n  ⬆️  Committing batch of ${batchCount}...`);
        await currentBatch.commit();
        currentBatch = db.batch();
        batchCount = 0;
      }
    }
    console.log();
  }

  if (batchCount > 0) {
    console.log(`\n⬆️  Committing final batch of ${batchCount}...`);
    await currentBatch.commit();
  }

  console.log(`\n✅ Done!`);
  console.log(`   Deleted  : ${deletedCount} duplicate document(s)`);
  console.log(`   Remaining: ${snapshot.size - deletedCount} unique product(s)\n`);
}

main().catch(err => { console.error('\n❌ Script failed:', err); process.exit(1); });
