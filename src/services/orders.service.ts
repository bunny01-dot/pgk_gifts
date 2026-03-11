
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
import { Order, OrderStatus } from '@/types/order';
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

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const orderRef = doc(this.db, 'orders', orderId);
    // Non-blocking write
    updateDoc(orderRef, { status })
      .catch((e: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `orders/${orderId}`,
          operation: 'update',
          requestResourceData: { status }
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
}
