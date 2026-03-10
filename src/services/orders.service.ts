import { 
  collection, 
  getDocs, 
  doc, 
  query, 
  orderBy,
  updateDoc,
  Firestore,
  onSnapshot
} from 'firebase/firestore';
import { Order, OrderStatus } from '@/types/order';

export class OrdersService {
  constructor(private db: Firestore) {}

  async getAllOrders(): Promise<Order[]> {
    const ordersRef = collection(this.db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const orderRef = doc(this.db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  }

  // Real-time listener for admin dashboard
  subscribeToOrders(callback: (orders: Order[]) => void) {
    const ordersRef = collection(this.db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      callback(orders);
    });
  }
}
