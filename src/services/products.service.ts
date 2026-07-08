
'use client';

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy,
  updateDoc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { Product } from '@/types/product';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { adjustProductPrice } from '@/utils/currency';

export class ProductsService {
  constructor(private db: Firestore) {}

  async getAllProducts(category?: string, adjust = true): Promise<Product[]> {
    const productsRef = collection(this.db, 'products');
    let q = query(productsRef, orderBy('createdAt', 'desc'));
    
    if (category && category !== 'All') {
      q = query(productsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
    }

    try {
      const snapshot = await getDocs(q);
      const rawProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      return adjust ? rawProducts.map(p => adjustProductPrice(p)) : rawProducts;
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'products',
        operation: 'list'
      }));
      return [];
    }
  }

  async getFeaturedProducts(adjust = true): Promise<Product[]> {
    const productsRef = collection(this.db, 'products');
    const q = query(productsRef, where('featured', '==', true), orderBy('createdAt', 'desc'));
    try {
      const snapshot = await getDocs(q);
      const rawProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      return adjust ? rawProducts.map(p => adjustProductPrice(p)) : rawProducts;
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'products',
        operation: 'list'
      }));
      return [];
    }
  }

  async getProductById(id: string, adjust = true): Promise<Product | null> {
    const docRef = doc(this.db, 'products', id);
    try {
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      const rawProduct = { id: snapshot.id, ...snapshot.data() } as Product;
      return adjust ? adjustProductPrice(rawProduct) : rawProduct;
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `products/${id}`,
        operation: 'get'
      }));
      return null;
    }
  }

  async updateProduct(id: string, data: Partial<Product>) {
    const docRef = doc(this.db, 'products', id);
    return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
      .catch((e: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `products/${id}`,
          operation: 'update',
          requestResourceData: data
        }));
        throw e;
      });
  }

  async createProduct(data: Omit<Product, 'id'>) {
    const { addDoc, collection } = await import('firebase/firestore');
    const productsRef = collection(this.db, 'products');
    return addDoc(productsRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch((e: any) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'products',
        operation: 'create',
        requestResourceData: data
      }));
      throw e;
    });
  }

  async deleteProduct(id: string) {
    const { deleteDoc, doc } = await import('firebase/firestore');
    const docRef = doc(this.db, 'products', id);
    return deleteDoc(docRef).catch((e: any) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `products/${id}`,
        operation: 'delete'
      }));
      throw e;
    });
  }

  async downloadAndUpload(url: string, path: string): Promise<string> {
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const storage = getStorage();
    const response = await fetch(url);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    try {
      await uploadBytes(storageRef, blob);
      return getDownloadURL(storageRef);
    } catch (uploadErr: any) {
      if (process.env.NODE_ENV !== 'production' && uploadErr.code === 'storage/quota-exceeded') {
        console.warn('Firebase Storage quota exceeded during migration. Using original URL fallback.');
        return url;
      }
      throw uploadErr;
    }
  }

  async migrateAllToFirebase(onStep?: (msg: string) => void) {
    const products = await this.getAllProducts();
    let count = 0;
    for (const p of products) {
      if (p.image && !p.image.includes('firebasestorage') && p.image.startsWith('http')) {
        onStep?.(`Migrating: ${p.name}`);
        try {
          const ext = p.image.split('.').pop()?.split('?')[0] || 'png';
          const newUrl = await this.downloadAndUpload(p.image, `products/${p.id}-${Date.now()}.${ext}`);
          await this.updateProduct(p.id, { image: newUrl });
          count++;
        } catch (e) {
          console.error(`Skipped ${p.name}`, e);
        }
      }
    }
    return count;
  }

  async syncStaticProducts(onStep?: (msg: string) => void) {
    const { PRODUCTS } = await import('@/lib/data');
    const { setDoc, doc, getDoc } = await import('firebase/firestore');
    let count = 0;
    
    for (const p of PRODUCTS) {
      const docRef = doc(this.db, 'products', p.id);
      const snap = await getDoc(docRef);
      const { id, ...data } = p;
      if (!snap.exists()) {
        onStep?.(`Syncing: ${p.name}`);
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        count++;
      } else {
        onStep?.(`Updating: ${p.name}`);
        await setDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        }, { merge: true });
        count++;
      }
    }
    return count;
  }
}
