export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  text: string;
  photoUrl?: string; // Optional user-uploaded UGC photo
  createdAt: any;
}
