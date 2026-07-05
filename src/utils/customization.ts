import { Product } from '@/types/product';

/**
 * Calculates the number of photo slots required for customization based on product details.
 */
export function getRequiredPhotoSlots(product: Product): number {
  if (!product) return 0;

  const name = product.name.toLowerCase();
  const id = product.id.toLowerCase();
  const desc = product.description?.toLowerCase() || '';
  const category = (product.category || '').toLowerCase();

  // 1. Explicitly check categories that are NOT customizable
  if (
    category.includes("toys") || 
    category.includes("car dashboard") || 
    category.includes("accessories") ||
    category.includes("hamper") ||
    category.includes("lamp")
  ) {
    return 0;
  }
  
  // Honor manual override if set in database/admin panel first
  if (typeof product.requiredPhotoSlots === 'number') {
    return product.requiredPhotoSlots;
  }

  // Enforce specific slot counts for known multi-photo products even if override is missing/wrong
  if (name.includes("insta collage") || id.includes("insta-collage")) return 9;
  if (name.includes("bird collage") || id.includes("bird-collage")) return 24;
  if (name.includes("heart collage") || id.includes("heart-collage")) return 8;
  if (name.includes("moon collage") || id.includes("moon-collage")) return 6;
  if (name.includes("collage 12 8") || id.includes("collage-frame-12-8")) return 4;
  if (name.includes("mosaic") || id.includes("mosaic")) return 31;
  if (name.includes("rotating") || id.includes("rotating")) return 4;
  if (name.includes("date of birth") || id.includes("date-of-birth")) return 8;
  if (name.includes("farewell") || id.includes("farewell")) return 10;
  
  // 2. Custom photo frames and collages
  if (category.includes("wall decor") || category.includes("mdf wall") || category.includes("frames")) {
    if (name.includes("insta collage") || id.includes("insta-collage")) return 9;
    if (name.includes("bird collage") || id.includes("bird-collage")) return 24;
    if (name.includes("heart collage") || id.includes("heart-collage")) return 8;
    if (name.includes("moon collage") || id.includes("moon-collage")) return 6;
    if (name.includes("collage 12 8") || id.includes("collage-frame-12-8")) return 4;
    if (name.includes("mosaic") || id.includes("mosaic")) return 31;
    if (name.includes("rotating") || id.includes("rotating")) return 4;
    if (name.includes("date of birth") || id.includes("date-of-birth")) return 8;
    if (name.includes("farewell") || id.includes("farewell")) return 10;
    if (name.includes("couple")) return 2;
    if (name.includes("collage")) return 4; // fallback for collage
    
    // Check description for specific slot numbers (e.g. "8 photos", "6 slots")
    const slotMatch = desc.match(/(\d+)\s*(?:photo|slot|image|picture)/i);
    const matchGroup = slotMatch?.[1];
    if (matchGroup) {
      return parseInt(matchGroup, 10);
    }
    
    return 1; // default for frames
  }
  
  // 3. Personalized / Customized Gifts category
  if (category.includes("personalized") || category.includes("customized")) {
    if (name.includes("face roll") || id.includes("face-roll")) return 4;
    if (name.includes("pillow") && name.includes("collage")) return 4;
    if (name.includes("pen") || name.includes("bottle") || name.includes("stand")) {
      if (name.includes("photo") || name.includes("image") || name.includes("picture") || name.includes("collage")) return 1;
      if (name.includes("lamp") || id.includes("lamp")) return 1;
      if (name.includes("keychain") || id.includes("keychain")) return 1;
      if (name.includes("mug") || id.includes("mug")) return 1;
      if (name.includes("mirror")) return 1;
      return 0; // Text/engraving items
    }
    return 1; // default customized item
  }

  // 4. Keychains category
  if (category.includes("keychain")) {
    if (name.includes("face roll") || id.includes("face-roll")) return 4;
    return 1;
  }

  // 5. Generic check for any other category if the item is explicitly custom/photo/frame
  const isCustomOrPhoto = 
    name.includes("photo") || 
    name.includes("collage") || 
    name.includes("frame") || 
    name.includes("custom") || 
    name.includes("personal") ||
    desc.includes("photo") ||
    desc.includes("custom") ||
    desc.includes("personal");

  if (isCustomOrPhoto) {
    return 1;
  }
  
  return 0;
}

/**
 * Resizes and compresses an uploaded image to keep base64 strings lightweight and prevent Firestore limit errors.
 * (Legacy fallback)
 */
export function compressAndResizeImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string); // fallback
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Resizes and compresses an uploaded image into a high-performance JPEG Blob ready for direct binary upload to Firebase Storage.
 */
export function compressAndResizeToBlob(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas image conversion to blob failed'));
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Calculates whether a product requires a text input for personalization (engraving/name print).
 */
export function getRequiredTextLabel(product: Product): string | null {
  if (!product) return null;

  const id = product.id.toLowerCase();
  const name = product.name.toLowerCase();

  if (
    id === 'custom-gift-engraved-wooden-pen-with-gift-box' ||
    id === 'custom-gift-crystal-ballpoint-pen-customized' ||
    id === 'custom-gift-customized-premium-pen-style-1' ||
    id === 'custom-gift-metal-ballpoint-pen-customized'
  ) {
    return "Enter Text for Engraving";
  }

  if (id === 'custom-gift-personalized-water-bottle-750ml') {
    return "Enter Name for Printing";
  }

  // Fallback for general pens or customized keychains/bottles that do not require photo upload
  if (name.includes("pen") && !name.includes("photo") && !name.includes("image")) {
    return "Enter Text for Engraving";
  }
  if (name.includes("bottle") && !name.includes("photo") && !name.includes("image")) {
    return "Enter Name for Printing";
  }

  return null;
}
