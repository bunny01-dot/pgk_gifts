export interface CustomPhoto {
  imageUrl: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  selectedSize?: string;
  customPhotos?: CustomPhoto[];
  customText?: string;
  deliveryCharge?: 'complimentary' | 'regular' | number | undefined;
  weight?: number | null | undefined;
}
