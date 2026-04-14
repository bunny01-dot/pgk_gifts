import { collection, doc, setDoc, query, where, getDocs, orderBy, Firestore } from 'firebase/firestore';
import { Review } from '@/types/review';

export class ReviewsService {
  constructor(private db: Firestore) {}

  async getReviewsForProduct(productId: string): Promise<Review[]> {
    try {
      const reviewsRef = collection(this.db, 'reviews');
      const q = query(reviewsRef, where('productId', '==', productId));
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      // Sort manually since Firebase needs a composite index if we do where + orderBy
      return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
    const reviewsRef = collection(this.db, 'reviews');
    const newDocRef = doc(reviewsRef);
    
    const reviewData: Review = {
      ...review,
      id: newDocRef.id,
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(newDocRef, reviewData);
    return newDocRef.id;
  }
}
