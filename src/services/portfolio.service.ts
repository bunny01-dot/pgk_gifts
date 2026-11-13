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
import { PortfolioItem } from '@/lib/portfolio-data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export class PortfolioService {
  constructor(private db: Firestore) {}

  async getAllPortfolioItems(): Promise<PortfolioItem[]> {
    const portfolioRef = collection(this.db, 'portfolio');
    const q = query(portfolioRef, orderBy('createdAt', 'desc'));
    
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate() 
            : new Date()
        } as unknown as PortfolioItem;
      });
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'portfolio',
          operation: 'list'
        }));
      } else {
        console.error("Firestore error in getAllPortfolioItems:", e);
      }
      return [];
    }
  }

  async getPortfolioItemById(id: string): Promise<PortfolioItem | null> {
    const docRef = doc(this.db, 'portfolio', id);
    try {
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
          ? data.createdAt.toDate() 
          : new Date()
      } as unknown as PortfolioItem;
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `portfolio/${id}`,
          operation: 'get'
        }));
      } else {
        console.error(`Firestore error in getPortfolioItemById(${id}):`, e);
      }
      return null;
    }
  }

  async updatePortfolioItem(id: string, data: Partial<PortfolioItem>) {
    const docRef = doc(this.db, 'portfolio', id);
    return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
      .catch((e: any) => {
        if (e?.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `portfolio/${id}`,
            operation: 'update',
            requestResourceData: data
          }));
        } else {
          console.error(`Firestore error in updatePortfolioItem(${id}):`, e);
        }
        throw e;
      });
  }

  async createPortfolioItem(data: Omit<PortfolioItem, 'id' | 'createdAt'>) {
    const { addDoc, collection } = await import('firebase/firestore');
    const portfolioRef = collection(this.db, 'portfolio');
    return addDoc(portfolioRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch((e: any) => {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'portfolio',
          operation: 'create',
          requestResourceData: data
        }));
      } else {
        console.error("Firestore error in createPortfolioItem:", e);
      }
      throw e;
    });
  }

  async deletePortfolioItem(id: string) {
    const { deleteDoc, doc } = await import('firebase/firestore');
    const docRef = doc(this.db, 'portfolio', id);
    return deleteDoc(docRef).catch((e: any) => {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `portfolio/${id}`,
          operation: 'delete'
        }));
      } else {
        console.error(`Firestore error in deletePortfolioItem(${id}):`, e);
      }
      throw e;
    });
  }
}
