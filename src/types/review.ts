import { DatabaseDate } from "./common";

export interface Review {
  id: string;
  productId: string;
  authorUid?: string;
  authorName: string;
  rating: number;
  text: string;
  photoUrl?: string; // Optional user-uploaded UGC photo
  createdAt: DatabaseDate;
}
