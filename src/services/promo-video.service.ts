'use client';

import { 
  collection, 
  getDocs, 
  doc, 
  query, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { PromoVideo } from '@/types/promo-video';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export class PromoVideoService {
  constructor(private db: Firestore) {}

  /**
   * Fetches all promotional videos for Admin dashboard
   */
  async getAllPromoVideos(): Promise<PromoVideo[]> {
    const videosRef = collection(this.db, 'promo_videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'));

    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PromoVideo));
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'promo_videos',
          operation: 'list'
        }));
      } else {
        console.error("Firestore error in getAllPromoVideos:", e);
      }
      return [];
    }
  }

  /**
   * Fetches active promotional videos for Home page player
   * Uses client-side filtering to avoid requiring a composite Firestore index
   */
  async getActivePromoVideos(): Promise<PromoVideo[]> {
    const videosRef = collection(this.db, 'promo_videos');
    // Simple query with no compound index needed — filter active client-side
    const q = query(videosRef, orderBy('createdAt', 'desc'));

    try {
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PromoVideo));
      return all.filter(v => v.active === true);
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'promo_videos',
          operation: 'list'
        }));
      } else {
        console.error("Firestore error in getActivePromoVideos:", e);
      }
      return [];
    }
  }


  /**
   * Add a new promotional video
   */
  async createPromoVideo(data: Omit<PromoVideo, 'id'>): Promise<string> {
    const videosRef = collection(this.db, 'promo_videos');
    try {
      const docRef = await addDoc(videosRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'promo_videos',
          operation: 'create',
          requestResourceData: data
        }));
      }
      throw e;
    }
  }

  /**
   * Update an existing promotional video
   */
  async updatePromoVideo(id: string, data: Partial<PromoVideo>): Promise<void> {
    const docRef = doc(this.db, 'promo_videos', id);
    try {
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `promo_videos/${id}`,
          operation: 'update',
          requestResourceData: data
        }));
      }
      throw e;
    }
  }

  /**
   * Delete a promotional video
   */
  async deletePromoVideo(id: string): Promise<void> {
    const docRef = doc(this.db, 'promo_videos', id);
    try {
      await deleteDoc(docRef);
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `promo_videos/${id}`,
          operation: 'delete'
        }));
      }
      throw e;
    }
  }
}
