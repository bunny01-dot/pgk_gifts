/**
 * update-product-prices.mjs
 *
 * One-time script: Adjusts all Firestore product prices to include the
 * Razorpay gateway fee (2% + 18% GST = 2.36%) baked in.
 *
 * Formula: new_price = Math.ceil(old_price / 0.9764)
 *
 * Run with:  node scripts/update-product-prices.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Load .env.local manually (dotenv doesn't auto-pick .env.local)
// ---------------------------------------------------------------------------
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
  console.log('✅ .env.local loaded');
} catch (e) {
  console.error('❌ Could not load .env.local:', e.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Firebase Admin init
// ---------------------------------------------------------------------------
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId   = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let   privateKey  = process.env.FIREBASE_PRIVATE_KEY ?? '';

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase env vars (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY)');
  process.exit(1);
}

// Handle escaped newlines in private key
privateKey = privateKey.replace(/\\n/g, '\n');

const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db  = getFirestore(app);

// ---------------------------------------------------------------------------
// Price adjustment
// ---------------------------------------------------------------------------
const RAZORPAY_RATE = 0.9764; // keeps 97.64% after 2% + 18% GST on that 2%

function adjustedPrice(price) {
  if (typeof price !== 'number' || price <= 0) return price;
  return Math.ceil(price / RAZORPAY_RATE);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('\n🔍 Fetching all products from Firestore...\n');

  const snapshot = await db.collection('products').get();

  if (snapshot.empty) {
    console.log('⚠️  No products found in Firestore.');
    return;
  }

  console.log(`📦 Found ${snapshot.size} product(s). Calculating price adjustments...\n`);

  const batch = db.batch();
  let updatedCount = 0;
  let skippedCount = 0;

  for (const doc of snapshot.docs) {
    const data  = doc.data();
    const name  = data.name ?? doc.id;
    const oldPrice = data.price;

    // Skip if price is missing or non-positive
    if (typeof oldPrice !== 'number' || oldPrice <= 0) {
      console.log(`  ⏭️  Skipped  "${name}" — no valid price`);
      skippedCount++;
      continue;
    }

    const newPrice = adjustedPrice(oldPrice);

    // Build the update object
    const update = { price: newPrice };

    // Also adjust sizes array if it exists
    if (Array.isArray(data.sizes) && data.sizes.length > 0) {
      update.sizes = data.sizes.map(size => ({
        ...size,
        price: adjustedPrice(size.price),
      }));

      const sizesSummary = update.sizes
        .map(s => `${s.name}: ₹${data.sizes.find(o => o.name === s.name)?.price} → ₹${s.price}`)
        .join(', ');
      console.log(`  💰 "${name}"  ₹${oldPrice} → ₹${newPrice}  |  Sizes: ${sizesSummary}`);
    } else {
      console.log(`  💰 "${name}"  ₹${oldPrice} → ₹${newPrice}`);
    }

    batch.update(doc.ref, update);
    updatedCount++;
  }

  if (updatedCount === 0) {
    console.log('\n✅ Nothing to update — all prices already appear adjusted.');
    return;
  }

  console.log(`\n⬆️  Committing ${updatedCount} update(s) to Firestore...`);
  await batch.commit();

  console.log(`\n✅ Done!`);
  console.log(`   Updated : ${updatedCount} product(s)`);
  console.log(`   Skipped : ${skippedCount} product(s)`);
  console.log(`\n   Customers now pay the fee-inclusive price.`);
  console.log(`   You net your target amount after Razorpay deducts ~2.36%.\n`);
}

main().catch(err => {
  console.error('\n❌ Script failed:', err);
  process.exit(1);
});
