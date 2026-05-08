import { PRODUCTS } from './src/lib/data';
import { initializeFirebase } from './src/firebase/index';
import { doc, updateDoc } from 'firebase/firestore';

async function run() {
  const { firestore } = initializeFirebase();

  for (const product of PRODUCTS) {
    const docRef = doc(firestore, 'products', product.id);
    try {
      await updateDoc(docRef, { category: product.category });
      console.log(`Updated ${product.name} to ${product.category}`);
    } catch (e) {
      console.error(`Failed to update ${product.name}:`, e);
    }
  }
}

run().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(console.error);
