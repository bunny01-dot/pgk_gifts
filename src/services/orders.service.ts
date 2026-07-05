
'use client';

import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  query, 
  orderBy,
  updateDoc,
  Firestore,
  onSnapshot
} from 'firebase/firestore';
import { Order, OrderStatus, ReturnRequest } from '@/types/order';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export class OrdersService {
  constructor(private db: Firestore) {}

  async getAllOrders(): Promise<Order[]> {
    const ordersRef = collection(this.db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'orders',
        operation: 'list'
      }));
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const docRef = doc(this.db, 'orders', orderId);
    try {
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Order;
      }
      return null;
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `orders/${orderId}`,
        operation: 'get'
      }));
      return null;
    }
  }

  async getOrderByTrackingId(trackingId: string): Promise<Order | null> {
    try {
      return this.getOrderById(trackingId);
    } catch (e: any) {
      return null;
    }
  }

  async updateOrderStatus(
    orderId: string, 
    status: OrderStatus,
    courierDetails?: { courierName?: string; trackingNumber?: string; trackingUrl?: string }
  ) {
    const orderRef = doc(this.db, 'orders', orderId);
    const updateData: any = { status };
    if (courierDetails) {
      if (courierDetails.courierName !== undefined) updateData.courierName = courierDetails.courierName;
      if (courierDetails.trackingNumber !== undefined) updateData.trackingNumber = courierDetails.trackingNumber;
      if (courierDetails.trackingUrl !== undefined) updateData.trackingUrl = courierDetails.trackingUrl;
    }
    // Non-blocking write
    updateDoc(orderRef, updateData)
      .catch((e: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `orders/${orderId}`,
          operation: 'update',
          requestResourceData: updateData
        }));
      });
  }

  subscribeToOrders(callback: (orders: Order[]) => void) {
    const ordersRef = collection(this.db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(
      q, 
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        callback(orders);
      },
      (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'orders',
          operation: 'list'
        }));
      }
    );
  }

  async submitReturnRequest(orderId: string, request: Omit<ReturnRequest, 'createdAt'>) {
    const orderRef = doc(this.db, 'orders', orderId);
    return updateDoc(orderRef, {
      returnRequest: {
        ...request,
        createdAt: new Date().toISOString()
      }
    });
  }

  async submitFeedback(orderId: string, rating: number, comment: string) {
    const orderRef = doc(this.db, 'orders', orderId);
    return updateDoc(orderRef, {
      feedback: {
        rating,
        comment,
        createdAt: new Date().toISOString()
      }
    });
  }

  async getOrdersByUserEmail(email: string): Promise<Order[]> {
    const ordersRef = collection(this.db, 'orders');
    try {
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      // Filtering manually to avoid indexing complexities for now, 
      // though typically where('customerEmail', '==', email) is preferred.
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Order))
        .filter(order => order.customerEmail === email);
    } catch (e: any) {
      return [];
    }
  }

  async getMyOrders(userId: string, email?: string): Promise<Order[]> {
    const ordersRef = collection(this.db, 'orders');
    const { where } = await import('firebase/firestore');
    try {
      const q = query(ordersRef, where('createdBy', '==', userId));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      if (email) {
        const qEmail = query(ordersRef, where('customerEmail', '==', email));
        const emailSnap = await getDocs(qEmail);
        emailSnap.docs.forEach(doc => {
          if (!list.some(item => item.id === doc.id)) {
            list.push({ id: doc.id, ...doc.data() } as Order);
          }
        });
      }

      return list.sort((a, b) => {
        const parseDate = (d: any) => {
          if (!d) return 0;
          if (typeof d === 'string') return new Date(d).getTime();
          if (typeof d.toDate === 'function') return d.toDate().getTime();
          if (typeof d.seconds === 'number') return d.seconds * 1000;
          return new Date(d).getTime();
        };
        return parseDate(b.createdAt) - parseDate(a.createdAt);
      });
    } catch (e: any) {
      console.error("Error fetching my orders:", e);
      return [];
    }
  }
}
