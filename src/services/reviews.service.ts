import { collection, doc, setDoc, query, where, getDocs, serverTimestamp, Firestore } from 'firebase/firestore';
import { Review } from '@/types/review';
import { toDate } from '@/utils/date';

export class ReviewsService {
  constructor(private db: Firestore) {}

  async getReviewsForProduct(productId: string): Promise<Review[]> {
    try {
      const reviewsRef = collection(this.db, 'reviews');
      const q = query(reviewsRef, where('productId', '==', productId));
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      // Sort manually since Firebase needs a composite index if we do where + orderBy
      return reviews.sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime());
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async addReview(review: Omit<Review, 'id' | 'createdAt' | 'authorUid'>, authorUid: string): Promise<string> {
    const reviewsRef = collection(this.db, 'reviews');
    const reviewId = `${authorUid}_${review.productId}`;
    const newDocRef = doc(reviewsRef, reviewId);
    
    const reviewData = {
      ...review,
      id: reviewId,
      authorUid,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(newDocRef, reviewData);
    return reviewId;
  }
}
