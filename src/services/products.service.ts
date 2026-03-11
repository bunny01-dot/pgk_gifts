
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

export class ProductsService {
  constructor(private db: Firestore) {}

  async getAllProducts(category?: string): Promise<Product[]> {
    const productsRef = collection(this.db, 'products');
    let q = query(productsRef, orderBy('createdAt', 'desc'));
    
    if (category && category !== 'All') {
      q = query(productsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
    }

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'products',
        operation: 'list'
      }));
      return [];
    }
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const productsRef = collection(this.db, 'products');
    const q = query(productsRef, where('featured', '==', true), orderBy('createdAt', 'desc'));
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'products',
        operation: 'list'
      }));
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    const docRef = doc(this.db, 'products', id);
    try {
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as Product;
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
    // Non-blocking update
    updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
      .catch((e: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `products/${id}`,
          operation: 'update',
          requestResourceData: data
        }));
      });
  }
}
