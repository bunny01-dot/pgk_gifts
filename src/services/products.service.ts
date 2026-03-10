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
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { Product } from '@/types/product';

export class ProductsService {
  constructor(private db: Firestore) {}

  async getAllProducts(category?: string): Promise<Product[]> {
    const productsRef = collection(this.db, 'products');
    let q = query(productsRef, orderBy('createdAt', 'desc'));
    
    if (category && category !== 'All') {
      q = query(productsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const productsRef = collection(this.db, 'products');
    const q = query(productsRef, where('featured', '==', true), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async getProductById(id: string): Promise<Product | null> {
    const docRef = doc(this.db, 'products', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Product;
  }

  async updateProduct(id: string, data: Partial<Product>) {
    const docRef = doc(this.db, 'products', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  }
}
