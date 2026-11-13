'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types/cart';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { UploadService } from '@/services/upload.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { DiscountProgress, PromotionalOffer } from '@/types/promotions';
import { calculateAutomaticDiscount, DEFAULT_AUTOMATIC_OFFERS } from '@/utils/discount';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateCartItem: (id: string, updates: Partial<Pick<CartItem, 'customPhotos' | 'customText' | 'requiredPhotoSlots' | 'quantity'>>) => void;
  clearCart: (excludeStorageDeletion?: boolean) => void;
  cartTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  giftWrapPrice: number;
  deliverySettings: {
    lampDeliveryCharge?: number;
    mdfDeliveryCharge?: number;
    largeFrameDeliveryCharge?: number;
    tnDeliveryMultiplier?: number;
    otherDeliveryMultiplier?: number;
  } | null;
  automaticDiscount: number;
  discountProgress: DiscountProgress;
  finalCartTotal: number;
  promotionalOffers: PromotionalOffer[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const sanitizeCartItems = (items: CartItem[]): any[] => {
  return items.map(item => {
    const sanitized: any = {};
    Object.keys(item).forEach(key => {
      const val = (item as any)[key];
      if (val !== undefined) {
        sanitized[key] = val;
      }
    });
    return sanitized;
  });
};

const arePhotosEqual = (p1?: any[], p2?: any[]): boolean => {
  if (!p1 && !p2) return true;
  if (!p1 || !p2) return false;
  if (p1.length !== p2.length) return false;
  const urls1 = p1.map(p => p.imageUrl).sort();
  const urls2 = p2.map(p => p.imageUrl).sort();
  return urls1.every((url, i) => url === urls2[i]);
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { auth, storage, firestore, user, isUserLoading } = useFirebase();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [giftWrapPrice, setGiftWrapPrice] = useState(50);
  const [deliverySettings, setDeliverySettings] = useState<any>(null);
  const [promotionalOffers, setPromotionalOffers] = useState<PromotionalOffer[]>(DEFAULT_AUTOMATIC_OFFERS);
  const [isAutoDiscountEnabled, setIsAutoDiscountEnabled] = useState(true);

  // Load global settings for Gift Wrap price & Delivery Settings & Promotional Offers
  useEffect(() => {
    if (!firestore) return;
    const fetchSettings = async () => {
      try {
        const { doc, getDoc, collection, onSnapshot } = await import("firebase/firestore");
        const settingsRef = doc(firestore, 'settings', 'global');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (typeof data.giftWrapPrice === 'number') {
            setGiftWrapPrice(data.giftWrapPrice);
          }
          if (typeof data.automaticDiscountsEnabled === 'boolean') {
            setIsAutoDiscountEnabled(data.automaticDiscountsEnabled);
          }
          setDeliverySettings({
            lampDeliveryCharge: data.lampDeliveryCharge,
            mdfDeliveryCharge: data.mdfDeliveryCharge,
            largeFrameDeliveryCharge: data.largeFrameDeliveryCharge,
            tnDeliveryMultiplier: data.tnDeliveryMultiplier,
            otherDeliveryMultiplier: data.otherDeliveryMultiplier,
          });
        }

        // Realtime subscription to promotional offers
        const offersRef = collection(firestore, 'promotional_offers');
        const unsub = onSnapshot(offersRef, (snap) => {
          if (!snap.empty) {
            const list = snap.docs
              .map((d) => ({ offerId: d.id, ...(d.data() as any) } as PromotionalOffer))
              .filter((o) => o.active !== false)
              .sort((a, b) => a.minimumAmount - b.minimumAmount);
            if (list.length > 0) {
              setPromotionalOffers(list);
            }
          }
        }, (err) => {
          console.warn("Using default promotional offers:", err);
        });

        return () => unsub();
      } catch (err) {
        console.error("Error fetching global settings:", err);
      }
    };
    fetchSettings();
  }, [firestore]);

  const uploadService = React.useMemo(() => new UploadService(storage, auth), [storage, auth]);

  // Load and merge cart on mount / auth state change
  useEffect(() => {
    if (isUserLoading) return;

    const initCart = async () => {
      if (user) {
        const userOwnerId = user.uid;

        try {
          const userCartRef = doc(firestore, 'carts', userOwnerId);
          const userSnap = await getDoc(userCartRef);
          let rawItems = userSnap.exists() ? (userSnap.data().items || []) : [];

          // Self-healing: Deduplicate items retrieved from Firestore
          const uniqueItems: CartItem[] = [];
          rawItems.forEach((item: CartItem) => {
            const isDuplicate = uniqueItems.some(
              (uItem) =>
                uItem.productId === item.productId &&
                uItem.selectedSize === item.selectedSize &&
                arePhotosEqual(uItem.customPhotos, item.customPhotos) &&
                uItem.customText === item.customText
            );
            if (isDuplicate) {
              const existing = uniqueItems.find(
                (uItem) =>
                  uItem.productId === item.productId &&
                  uItem.selectedSize === item.selectedSize &&
                  arePhotosEqual(uItem.customPhotos, item.customPhotos) &&
                  uItem.customText === item.customText
              );
              if (existing) {
                existing.quantity += item.quantity;
              }
            } else {
              // Ensure ID is unique in this load
              if (uniqueItems.some((uItem) => uItem.id === item.id)) {
                item.id = Math.random().toString(36).substring(7);
              }
              uniqueItems.push(item);
            }
          });
          let userItems = uniqueItems;

          // Merge guest cart items currently in the React state
          if (cart.length > 0) {
            const merged = [...userItems];
            cart.forEach((localItem) => {
              const existing = merged.find(
                (uItem: CartItem) =>
                  uItem.productId === localItem.productId &&
                  uItem.selectedSize === localItem.selectedSize &&
                  arePhotosEqual(uItem.customPhotos, localItem.customPhotos) &&
                  uItem.customText === localItem.customText
              );
              if (existing) {
                existing.quantity = Math.max(existing.quantity, localItem.quantity);
              } else {
                merged.push(localItem);
              }
            });
            userItems = merged;
            
            // Sync merged state to Firestore immediately
            await setDoc(userCartRef, {
              userId: userOwnerId,
              items: sanitizeCartItems(userItems),
              updatedAt: serverTimestamp()
            });
          }

          setCart(userItems);
        } catch (e) {
          console.error("Error loading/merging user cart from Firestore:", e);
        }
        setIsLoaded(true);
      } else {
        const savedCart = localStorage.getItem('pgk-cart-v2');
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed)) {
              // Self-healing: Deduplicate items from localStorage
              const uniqueItems: CartItem[] = [];
              parsed.forEach((item: CartItem) => {
                const isDuplicate = uniqueItems.some(
                  (uItem) =>
                    uItem.productId === item.productId &&
                    uItem.selectedSize === item.selectedSize &&
                    arePhotosEqual(uItem.customPhotos, item.customPhotos) &&
                    uItem.customText === item.customText
                );
                if (isDuplicate) {
                  const existing = uniqueItems.find(
                    (uItem) =>
                      uItem.productId === item.productId &&
                      uItem.selectedSize === item.selectedSize &&
                      arePhotosEqual(uItem.customPhotos, item.customPhotos) &&
                      uItem.customText === item.customText
                  );
                  if (existing) {
                    existing.quantity += item.quantity;
                  }
                } else {
                  if (uniqueItems.some((uItem) => uItem.id === item.id)) {
                    item.id = Math.random().toString(36).substring(7);
                  }
                  uniqueItems.push(item);
                }
              });
              setCart(uniqueItems);
            }
          } catch (err) {
            console.error(err);
          }
        }
        setIsLoaded(true);
      }
    };

    initCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading, firestore]);

  // Sync cart to Firestore on updates
  useEffect(() => {
    if (!isLoaded) return;

    const syncCart = async () => {
      localStorage.setItem('pgk-cart-v2', JSON.stringify(cart));

      if (!user) return;

      try {
        const cartRef = doc(firestore, 'carts', user.uid);
        await setDoc(cartRef, {
          userId: user.uid,
          items: sanitizeCartItems(cart),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("Failed to sync cart to Firestore:", e);
      }
    };

    syncCart();
  }, [cart, isLoaded, user, firestore]);

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (i) => i.productId === product.id && 
               i.selectedSize === product.selectedSize &&
               arePhotosEqual(i.customPhotos, product.customPhotos) &&
               i.customText === product.customText
      );
      if (existingItem) {
        return prevCart.map((i) =>
          i.productId === product.id && 
          i.selectedSize === product.selectedSize &&
          arePhotosEqual(i.customPhotos, product.customPhotos) &&
          i.customText === product.customText
            ? { ...i, quantity: i.quantity + (product.quantity || 1) }
            : i
        );
      }
      const newItem: CartItem = {
        id: Math.random().toString(36).substring(7),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity || 1,
      };
      if (product.selectedSize !== undefined) {
        newItem.selectedSize = product.selectedSize;
      }
      if (product.category !== undefined) {
        newItem.category = product.category;
      }
      if (product.customPhotos !== undefined) {
        newItem.customPhotos = product.customPhotos;
      }
      if (product.customText !== undefined) {
        newItem.customText = product.customText;
      }
      if (product.requiredPhotoSlots !== undefined) {
        newItem.requiredPhotoSlots = product.requiredPhotoSlots;
      }
      if (product.deliveryCharge !== undefined) {
        newItem.deliveryCharge = product.deliveryCharge;
      }
      if (product.weight !== undefined) {
        newItem.weight = product.weight;
      }
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => {
      const itemToRemove = prevCart.find((i) => i.id === id);
      if (itemToRemove && itemToRemove.customPhotos) {
        itemToRemove.customPhotos.forEach((photo) => {
          uploadService.deletePhoto(photo.fileName).catch((err) => {
            console.error("Failed to delete removed photo:", err);
          });
        });
      }
      return prevCart.filter((i) => i.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const updateCartItem = (
    id: string,
    updates: Partial<Pick<CartItem, 'customPhotos' | 'customText' | 'requiredPhotoSlots' | 'quantity'>>
  ) => {
    setCart((prevCart) =>
      prevCart.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  const clearCart = (excludeStorageDeletion = false) => {
    if (!excludeStorageDeletion) {
      cart.forEach((item) => {
        if (item.customPhotos) {
          item.customPhotos.forEach((photo) => {
            uploadService.deletePhoto(photo.fileName).catch((err) => {
              console.error("Failed to delete photo from cleared cart:", err);
            });
          });
        }
      });
    }
    setCart([]);
  };

  const resolvedCart = cart.map(item => {
    if (item.id === 'upsell_wrap' || item.productId === 'upsell_wrap') {
      return { ...item, price: giftWrapPrice };
    }
    return item;
  });

  const cartTotal = resolvedCart.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = resolvedCart.reduce((count, item) => count + item.quantity, 0);

  // No automatic discounts: discounts must be explicitly selected at checkout
  const automaticDiscount = 0;
  const autoDiscountResult = calculateAutomaticDiscount(
    cartTotal,
    promotionalOffers,
    false // strictly disabled: no automatic discounts
  );
  const discountProgress = autoDiscountResult.progress;
  const finalCartTotal = cartTotal;

  return (
    <CartContext.Provider
      value={{ 
        cart: resolvedCart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        updateCartItem,
        clearCart, 
        cartTotal, 
        itemCount,
        isCartOpen,
        setIsCartOpen,
        giftWrapPrice,
        deliverySettings,
        automaticDiscount,
        discountProgress,
        finalCartTotal,
        promotionalOffers,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
