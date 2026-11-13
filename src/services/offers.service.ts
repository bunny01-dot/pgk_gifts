'use client';

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { Offer } from '@/types/offer';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export class OffersService {
  constructor(private db: Firestore) {}

  /**
   * Fetches all offers sorted by creation date (for Admin portal)
   */
  async getAllOffers(): Promise<Offer[]> {
    const offersRef = collection(this.db, 'offers');
    const q = query(offersRef, orderBy('createdAt', 'desc'));

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Offer));
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'offers',
          operation: 'list'
        }));
      } else {
        console.error("Firestore error in getAllOffers:", e);
      }
      return [];
    }
  }

  /**
   * Fetches active, unexpired offers for the Home page display
   */
  async getActiveOffers(): Promise<Offer[]> {
    const offersRef = collection(this.db, 'offers');
    // We query active == true first, then filter by date locally to avoid complex composite index issues
    const q = query(offersRef, where('active', '==', true), orderBy('createdAt', 'desc'));

    try {
      const snapshot = await getDocs(q);
      const now = new Date();
      const rawOffers = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Offer));
      
      return rawOffers.filter(offer => {
        if (!offer.active) return false;
        if (offer.endDate) {
          const end = new Date(offer.endDate);
          if (end.getTime() < now.getTime()) return false;
        }
        if (offer.startDate) {
          const start = new Date(offer.startDate);
          if (start.getTime() > now.getTime()) return false;
        }
        return true;
      });
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'offers',
          operation: 'list'
        }));
      } else {
        console.error("Firestore error in getActiveOffers:", e);
      }
      return [];
    }
  }

  /**
   * Create a new offer
   */
  async createOffer(data: Omit<Offer, 'id'>): Promise<string> {
    const offersRef = collection(this.db, 'offers');
    try {
      const docRef = await addDoc(offersRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'offers',
          operation: 'create',
          requestResourceData: data
        }));
      }
      throw e;
    }
  }

  /**
   * Update an existing offer
   */
  async updateOffer(id: string, data: Partial<Offer>): Promise<void> {
    const docRef = doc(this.db, 'offers', id);
    try {
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `offers/${id}`,
          operation: 'update',
          requestResourceData: data
        }));
      }
      throw e;
    }
  }

  /**
   * Delete an offer
   */
  async deleteOffer(id: string): Promise<void> {
    const docRef = doc(this.db, 'offers', id);
    try {
      await deleteDoc(docRef);
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `offers/${id}`,
          operation: 'delete'
        }));
      }
      throw e;
    }
  }
}
