'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { firestore, user, isUserLoading } = useFirebase();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load and merge wishlist on mount / auth state change
  useEffect(() => {
    if (isUserLoading) return;

    const initWishlist = async () => {
      if (user && firestore) {
        try {
          const userWishlistRef = doc(firestore, 'wishlists', user.uid);
          const snap = await getDoc(userWishlistRef);
          let userItems = snap.exists() ? (snap.data().items || []) : [];

          // Merge local wishlist items
          const savedWishlist = localStorage.getItem('pgk-wishlist');
          if (savedWishlist) {
            try {
              const localItems = JSON.parse(savedWishlist);
              if (Array.isArray(localItems)) {
                const merged = [...userItems];
                localItems.forEach((localItem: Product) => {
                  if (!merged.some(uItem => uItem.id === localItem.id)) {
                    merged.push(localItem);
                  }
                });
                userItems = merged;

                // Sync merged back to firestore
                await setDoc(userWishlistRef, {
                  userId: user.uid,
                  items: userItems,
                  updatedAt: serverTimestamp()
                });
              }
            } catch (err) {
              console.error(err);
            }
          }
          setWishlist(userItems);
        } catch (e) {
          console.error("Error loading/merging user wishlist from Firestore:", e);
        }
        setIsLoaded(true);
      } else {
        const savedWishlist = localStorage.getItem('pgk-wishlist');
        if (savedWishlist) {
          try {
            const parsed = JSON.parse(savedWishlist);
            if (Array.isArray(parsed)) {
              setWishlist(parsed);
            }
          } catch (err) {
            console.error(err);
          }
        }
        setIsLoaded(true);
      }
    };

    initWishlist();
  }, [user, isUserLoading, firestore]);

  // Sync wishlist to localStorage/Firestore
  useEffect(() => {
    if (!isLoaded) return;

    const syncWishlist = async () => {
      localStorage.setItem('pgk-wishlist', JSON.stringify(wishlist));

      if (!user || !firestore) return;

      try {
        const wishlistRef = doc(firestore, 'wishlists', user.uid);
        await setDoc(wishlistRef, {
          userId: user.uid,
          items: wishlist,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("Failed to sync wishlist to Firestore:", e);
      }
    };

    syncWishlist();
  }, [wishlist, isLoaded, user, firestore]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
