
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Heart, Share2, ZoomIn, ShoppingBag, ShieldCheck, Truck, Star, Check, Loader2, PlayCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS, CONTACT_INFO } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ToastAction } from '@/components/ui/toast';
import { formatPrice, adjustProductPrice } from '@/utils/currency';
import { useFirebase, useFirestore, useUser } from '@/firebase';
import { Product } from '@/types/product';
import { Review } from '@/types/review';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRequiredPhotoSlots, getRequiredTextLabel } from '@/utils/customization';
import { UploadService } from '@/services/upload.service';
import { CustomPhoto } from '@/types/cart';
import { useMemo } from 'react';
import { toDate } from '@/utils/date';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, updateCartItem, cart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useUser();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ authorName: '', rating: 5, text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firestore = useFirestore();
  const { auth, storage } = useFirebase();
  const uploadService = useMemo(() => new UploadService(storage, auth), [storage, auth]);
  const [product, setProduct] = useState<Product | null>(
    (() => {
      const p = PRODUCTS.find((p) => p.id === id);
      return p ? adjustProductPrice(p as any) : null;
    })()
  );
  const [loading, setLoading] = useState(!product);

  const requiredSlots = product ? getRequiredPhotoSlots(product) : 0;
  const isMosaic = !!(product && (product.name.toLowerCase().includes('mosaic') || product.id.toLowerCase().includes('mosaic')));
  const isCollage = !!(product && (product.name.toLowerCase().includes('collage') || product.id.toLowerCase().includes('collage')));
  const needsMainImage = !!(product && (product.needsMainImage || isMosaic || isCollage));

  // True when this customer already has this product in their bag with missing photos
  // (they came here from the checkout warning to upload photos)
  const isUpdateMode = cart.some(
    (i) =>
      i.productId === (product?.id ?? '') &&
      i.selectedSize === (product?.sizes ? selectedSize : undefined) &&
      (i.requiredPhotoSlots ?? 0) > 0 &&
      (i.customPhotos?.length ?? 0) < (i.requiredPhotoSlots ?? 0)
  );

  const [uploadedPhotos, setUploadedPhotos] = useState<(CustomPhoto | null)[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [customText, setCustomText] = useState('');
  const [showFrameText, setShowFrameText] = useState(false);
  const [interstitialMessage, setInterstitialMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const textLabel = product ? getRequiredTextLabel(product) : null;

  // All required photo slots are filled (computed after uploadedPhotos is declared)
  const photosReady =
    requiredSlots > 0
      ? uploadedPhotos.filter(Boolean).length >= requiredSlots
      : true;

  const hasInitializedPhotos = useRef(false);

  useEffect(() => {
    hasInitializedPhotos.current = false;
    setCustomText('');
    setShowFrameText(false);
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('requiredUpload') === 'true') {
        const slots = product ? getRequiredPhotoSlots(product) : 0;
        const msg = slots === 1 ? "This item needs photo uploaded" : "This item needs photos uploaded";
        setInterstitialMessage(msg);
        
        // Remove the parameter so refresh doesn't trigger it again
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);

        const timer = setTimeout(() => {
          setInterstitialMessage(null);
          const uploadSection = document.getElementById('photo-upload-section');
          if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            uploadSection.classList.add('ring-4', 'ring-primary/30', 'scale-[1.01]');
            setTimeout(() => {
              uploadSection.classList.remove('ring-4', 'ring-primary/30', 'scale-[1.01]');
            }, 2000);
          }
        }, 1800);
        return () => clearTimeout(timer);
      }
    }
  }, [id, product]);

  useEffect(() => {
    if (product && !hasInitializedPhotos.current) {
      const slots = getRequiredPhotoSlots(product);
      setUploadedPhotos(Array(slots).fill(null));
      hasInitializedPhotos.current = true;
    }
  }, [product]);

  const handlePhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    const fileList = Array.from(files);

    try {
      const uploadPromises = fileList.map(async (file, offset) => {
        const targetIdx = index + offset;

        const handleProgress = (progress: number) => {
          setUploadProgress((prev) => ({
            ...prev,
            [targetIdx]: progress,
          }));
        };

        const customPhoto = await uploadService.uploadPhoto(file, handleProgress);
        return { index: targetIdx, photo: customPhoto };
      });

      const results = await Promise.all(uploadPromises);

      setUploadedPhotos((prev) => {
        const updated = [...prev];
        results.forEach((res) => {
          if (!res) return;
          const { index: slotIdx, photo } = res;
          if (slotIdx < updated.length) {
            updated[slotIdx] = photo;
          } else {
            updated.push(photo);
          }
        });
        return updated;
      });

      toast({
        title: "Photos Uploaded",
        description: `Successfully uploaded ${results.filter(Boolean).length} photo(s) to secure cloud storage.`,
      });
    } catch (err: any) {
      console.error("Failed to upload image", err);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: err.message || "Failed to upload one or more images. Please try again."
      });
    } finally {
      setIsProcessingPhotos(false);
      setUploadProgress({});
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const photoToDelete = uploadedPhotos[index];
    if (photoToDelete) {
      // Remove from state instantly for responsive UI
      setUploadedPhotos((prev) => {
        const updated = [...prev];
        if (index >= requiredSlots) {
          updated.splice(index, 1);
        } else {
          updated[index] = null;
        }
        return updated;
      });

      try {
        await uploadService.deletePhoto(photoToDelete.fileName);
      } catch (err) {
        console.error("Failed to delete photo from storage", err);
      }
    }
  };

  useEffect(() => {
    if (!firestore || !id) return;
    const loadProduct = async () => {
      try {
        const { ProductsService } = await import('@/services/products.service');
        const svc = new ProductsService(firestore);
        const dynamicProduct = await svc.getProductById(id as string);
        if (dynamicProduct) {
          const localProduct = PRODUCTS.find((p) => p.id === id);
          const localProductAdjusted = localProduct ? adjustProductPrice(localProduct as any) : null;
          if (localProductAdjusted) {
            setProduct({
              ...localProductAdjusted,
              ...dynamicProduct,
              requiredPhotoSlots: dynamicProduct.requiredPhotoSlots !== undefined && dynamicProduct.requiredPhotoSlots !== null
                ? dynamicProduct.requiredPhotoSlots
                : localProductAdjusted.requiredPhotoSlots
            } as Product);
          } else {
            setProduct(dynamicProduct as Product);
          }
        }

        const { ReviewsService } = await import('@/services/reviews.service');
        const revSvc = new ReviewsService(firestore);
        const fetchedReviews = await revSvc.getReviewsForProduct(id as string);
        setReviews(fetchedReviews);
      } catch (err) {
        console.error("Failed to load live product data", err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [firestore, id]);

  useEffect(() => {
    if (product?.sizes?.length && !selectedSize) {
      const firstSize = product.sizes[0];
      if (firstSize) {
        setSelectedSize(firstSize.name);
      }
    }
  }, [product, selectedSize]);

  const currentPrice = product?.sizes && selectedSize
    ? (product.sizes.find(s => s.name === selectedSize)?.price || product.price)
    : (product?.price || 0);

  const allImages = product?.images?.length ? product.images : (product?.image ? [product.image] : []);
  const displayImage = allImages[currentImageIndex] || '/placeholder.png';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-headline font-bold">Product not found</h2>
          <Button onClick={() => router.push('/shop')} className="rounded-full h-14 px-8">Back to Shop</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (redirect = false) => {
    if (product && textLabel) {
      if (!customText.trim()) {
        toast({
          variant: "destructive",
          title: "Personalization Text Required",
          description: `Please enter the text/name to be engraved or printed.`,
        });
        return;
      }
    }

    const photos = uploadedPhotos.filter(Boolean) as any[];
    const resolvedText = (textLabel || (requiredSlots > 0 && showFrameText)) ? customText.trim() : undefined;

    // If there's already a cart item for this product+size that is missing photos,
    // UPDATE it instead of adding a second line item.
    const existingIncompleteItem = cart.find(
      (i) =>
        i.productId === (product?.id ?? '') &&
        i.selectedSize === (product?.sizes ? selectedSize : undefined) &&
        (i.requiredPhotoSlots ?? 0) > 0 &&
        (i.customPhotos?.length ?? 0) < (i.requiredPhotoSlots ?? 0)
    );

    if (existingIncompleteItem) {
      setIsSaving(true); // lock UI immediately so buttons don't flash back
      updateCartItem(existingIncompleteItem.id, {
        customPhotos: photos,
        ...(resolvedText !== undefined ? { customText: resolvedText } : {}),
      });
      toast({
        title: photos.length > 0 ? "Photos Updated!" : "Item Updated",
        description: photos.length > 0
          ? "Your photos have been added to the item already in your bag."
          : "Your bag item has been updated.",
      });
      if (redirect) {
        router.push('/checkout');
      }
      return;
    }

    // No existing item — add fresh
    addToCart({
      ...product,
      price: currentPrice,
      selectedSize: product.sizes ? selectedSize : undefined,
      quantity,
      requiredPhotoSlots: requiredSlots,
      customPhotos: photos,
      customText: resolvedText,
    });
    
    toast({
      title: "Added to Bag",
      description: `${product.name} has been added to your shopping bag.`,
    });
    
    if (redirect) {
      router.push('/checkout');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleRemoveReview = (index: number) => {
     // Optional future functionality
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !newReview.authorName || !newReview.text) return;
    if (!user) {
      toast({ variant: 'destructive', title: 'Sign in required', description: 'Please sign in before posting a review.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { ReviewsService } = await import('@/services/reviews.service');
      const revSvc = new ReviewsService(firestore);
      const newId = await revSvc.addReview({
        productId: id as string,
        ...newReview
      }, user.uid);
      setReviews([{ id: newId, productId: id as string, authorUid: user.uid, createdAt: new Date().toISOString(), ...newReview }, ...reviews]);
      setNewReview({ authorName: '', rating: 5, text: '' });
      toast({ title: 'Review Posted', description: 'Thank you for sharing your experience!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not post review.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && (document.referrer === '' || !document.referrer.includes(window.location.host))) {
      router.push('/shop');
    } else {
      router.back();
    }
  };

  return (
    <>
      <AnimatePresence>
        {interstitialMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="max-w-md space-y-6"
            >
              {/* Pulsing Photo Icon */}
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse shadow-inner">
                <Camera className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-headline font-bold text-foreground">
                  {interstitialMessage}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Taking you to the customization section...
                </p>
              </div>

              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen pt-24 md:pt-40 pb-28 md:pb-40 bg-background">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="mb-5 md:mb-12 hover:bg-accent/50 rounded-full text-foreground group h-10 md:h-14 px-4 md:px-6 text-sm md:text-xl font-bold"
        >
          <ArrowLeft className="mr-2 md:mr-3 w-4 h-4 md:w-6 md:h-6 group-hover:-translate-x-2 transition-transform" /> Back to Catalog
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-24">
          {/* Image Gallery with High-End Zoom */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 md:space-y-8"
          >
            <div 
              ref={imageRef}
              className="relative aspect-square rounded-3xl md:rounded-[4rem] overflow-hidden bg-muted shadow-xl md:shadow-2xl cursor-zoom-in group border-none"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-200 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                priority
              />
              {!isZoomed && (
                <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 flex gap-3 md:gap-4">
                  {product.videoUrl && (
                    <a href={product.videoUrl} target="_blank" rel="noreferrer" className="bg-primary/90 text-primary-foreground backdrop-blur-md px-3 py-2 md:p-5 rounded-2xl md:rounded-3xl shadow-2xl hover:bg-primary transition-colors flex items-center gap-2 md:gap-3 text-xs md:text-base font-bold">
                       <PlayCircle className="w-4 h-4 md:w-8 md:h-8" /> Watch Demo
                    </a>
                  )}
                  <div className="hidden md:block bg-card/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-8 h-8 text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 snap-x hide-scrollbar">
                 {allImages.map((img, i) => (
                   <button 
                     key={i} 
                     onClick={() => setCurrentImageIndex(i)}
                     className={`relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 snap-center focus:outline-none transition-all duration-300 ${currentImageIndex === i ? 'ring-4 ring-primary shadow-xl scale-105' : 'opacity-60 hover:opacity-100'}`}
                   >
                     <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
                   </button>
                 ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6 md:gap-12"
          >
            <div className="space-y-4 md:space-y-8">
              <div className="flex flex-wrap items-center gap-3 md:gap-5">
                <Badge variant="secondary" className="rounded-full px-3 md:px-6 py-1.5 md:py-2 uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-[10px] md:text-xs bg-accent text-primary border-none">
                  {product.category}
                </Badge>
                {product.dimensions && (
                  <Badge variant="outline" className="rounded-full px-3 md:px-6 py-1.5 md:py-2 uppercase tracking-widest font-bold text-[10px] md:text-xs border-primary/20 text-primary bg-primary/5">
                    Size: {product.dimensions}
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  <span className="text-xs md:text-sm font-bold text-foreground ml-1 md:ml-2">5.0</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-7xl font-headline font-bold text-foreground leading-tight md:leading-none tracking-tight md:tracking-tighter">{product.name}</h1>
              <div className="flex flex-wrap items-end gap-2 md:gap-6">
                <span className="text-3xl md:text-6xl font-headline font-bold text-primary">{formatPrice(currentPrice)}</span>
                <span className="text-[10px] md:text-sm text-muted-foreground mb-1 md:mb-3 font-bold uppercase tracking-widest">Shipping Included</span>
              </div>
            </div>

            <p className="text-base md:text-3xl text-muted-foreground leading-relaxed max-w-xl font-headline italic">
              &ldquo;{product.description}&rdquo;
            </p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Select Frame Size</span>
                  {selectedSize && (
                    <span className="text-xs font-bold text-primary">Selected: {selectedSize}</span>
                  )}
                </div>

                {product.sizes.length > 8 ? (
                  <div className="space-y-3">
                    <Select value={selectedSize} onValueChange={(val) => setSelectedSize(val)}>
                      <SelectTrigger className="w-full h-14 rounded-2xl bg-card border-2 border-border focus:border-primary font-bold text-base px-5">
                        <SelectValue placeholder="Choose a custom frame size..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl p-2 shadow-2xl bg-card border-border max-h-72 overflow-y-auto">
                        {product.sizes.map((sz) => (
                          <SelectItem key={sz.name} value={sz.name} className="rounded-xl h-12 text-sm font-bold">
                            {sz.name} — {formatPrice(sz.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-secondary/20 rounded-2xl border border-border/40">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz.name}
                          type="button"
                          onClick={() => setSelectedSize(sz.name)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            selectedSize === sz.name
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'border-border bg-card hover:border-primary/50 text-foreground'
                          }`}
                        >
                          {sz.name} ({formatPrice(sz.price)})
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz.name}
                        type="button"
                        onClick={() => setSelectedSize(sz.name)}
                        className={`px-6 py-3 rounded-full text-sm md:text-lg font-bold border-2 transition-all duration-300 ${
                          selectedSize === sz.name
                            ? 'border-primary bg-primary/10 text-primary shadow-md scale-105'
                            : 'border-border bg-card hover:border-primary/50 text-foreground'
                        }`}
                      >
                        {sz.name} ({formatPrice(sz.price)})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom Text Personalization Section */}
            {product && textLabel && (
              <div className="space-y-4 p-6 rounded-3xl bg-secondary/30 border border-border/80 shadow-inner">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <span>✍️</span> {textLabel}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      This item will be personalized with the text you enter below.
                    </p>
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="Type your engraving/printing text here..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="h-12 bg-background border-border rounded-xl focus-visible:ring-primary font-medium"
                  maxLength={100}
                />
              </div>
            )}

            {/* Custom Photo Upload Section */}
            {product && requiredSlots > 0 && (
              <div id="photo-upload-section" className="space-y-4 p-6 rounded-3xl bg-secondary/30 border border-border/80 shadow-inner transition-all duration-300">

                {/* Context banner: shown only when customer came from checkout to upload */}
                {isUpdateMode && (
                  <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/50 dark:border-amber-700/40 rounded-2xl px-4 py-3">
                    <span className="text-lg shrink-0">📦</span>
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-relaxed">
                      You have this item in your bag. Upload your photos below and save — we&apos;ll take you straight back to checkout.
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <span>📸</span> Upload Your Photos
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {requiredSlots > 0 
                        ? `This item requires ${requiredSlots} ${requiredSlots === 1 ? 'photo' : 'photos'}.`
                        : 'Upload custom photos to personalize this item (optional).'}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full px-3 py-1 bg-background text-[10px] font-black uppercase tracking-wider">
                    {uploadedPhotos.filter(Boolean).length} / {uploadedPhotos.length} Uploaded
                  </Badge>
                </div>

                {/* Separate Main Image Slot for Mosaic/Collage Frames */}
                {product && needsMainImage && (
                  <div className="p-4 rounded-2xl bg-background border border-primary/20 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <span>✨</span> {isMosaic ? "Main Photo (This will be the central focus of your mosaic)" : "Main Photo (This will be the central focus of your collage)"}
                    </span>
                    <div className="relative w-full aspect-[2/1] sm:aspect-[3/1] rounded-xl overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary transition-colors bg-secondary/20 flex items-center justify-center p-2 group">
                      {uploadedPhotos[0] ? (
                        <>
                          <Image src={uploadedPhotos[0].imageUrl} alt="Main Image" fill className="object-cover" />
                          <button
                            onClick={() => handleRemovePhoto(0)}
                            type="button"
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-sm font-bold z-10"
                          >
                            ✕
                          </button>
                          <button
                            onClick={() => {
                              const mainPhoto = uploadedPhotos[0];
                              if (mainPhoto) {
                                setUploadedPhotos((prev) => prev.map(() => mainPhoto));
                                toast({
                                  title: "Applied to All Slots",
                                  description: "This photo has been applied to all customization slots.",
                                });
                              }
                            }}
                            type="button"
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-full shadow-md z-10 whitespace-nowrap transition-colors"
                          >
                            Apply to All
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center p-4 text-muted-foreground hover:text-primary transition-colors">
                          {uploadProgress[0] !== undefined ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-8 h-8 animate-spin text-primary" />
                              <span className="text-xs font-black text-primary">{uploadProgress[0]}%</span>
                            </div>
                          ) : (
                            <>
                              <span className="text-2xl md:text-3xl font-bold">+</span>
                              <span className="text-xs font-bold uppercase tracking-wider mt-1">Upload Main Image</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isProcessingPhotos}
                            onChange={(e) => handlePhotoUpload(0, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Collage Slots Grid */}
                <div className="space-y-3">
                  {product && needsMainImage && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                      {isMosaic 
                        ? `🖼️ Background Photos (${uploadedPhotos.length - 1} slots)` 
                        : `🖼️ Collage Photos (${uploadedPhotos.length - 1} slots)`}
                    </span>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {uploadedPhotos.map((_, idx) => {
                      if (needsMainImage && idx === 0) return null;

                      const photo = uploadedPhotos[idx];
                      const hasImage = !!photo;
                      const slotProgress = uploadProgress[idx];
                      
                      return (
                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors bg-background flex flex-col items-center justify-center p-1 group">
                          {hasImage ? (
                            <>
                              <Image src={photo.imageUrl} alt={`Uploaded ${idx + 1}`} fill className="object-cover" />
                              <button
                                onClick={() => handleRemovePhoto(idx)}
                                type="button"
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-xs font-bold"
                              >
                                ✕
                              </button>
                              <button
                                onClick={() => {
                                  setUploadedPhotos((prev) => prev.map(() => photo));
                                  toast({
                                    title: "Applied to All Slots",
                                    description: "This photo has been applied to all customization slots.",
                                  });
                                }}
                                type="button"
                                className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary/90 text-primary-foreground text-[8px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full shadow-md z-10 whitespace-nowrap transition-colors"
                              >
                                Apply to All
                              </button>
                            </>
                          ) : (
                            <>
                              {idx >= requiredSlots && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setUploadedPhotos((prev) => {
                                      const updated = [...prev];
                                      updated.splice(idx, 1);
                                      return updated;
                                    });
                                  }}
                                  type="button"
                                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-[10px] font-bold z-10"
                                >
                                  ✕
                                </button>
                              )}
                              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center p-2 text-muted-foreground hover:text-primary transition-colors">
                                {slotProgress !== undefined ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    <span className="text-[9px] font-black text-primary">{slotProgress}%</span>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-lg md:text-2xl font-bold">+</span>
                                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider mt-1">
                                      {needsMainImage ? `Photo ${idx}` : `Slot ${idx + 1}`}
                                    </span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  multiple
                                  disabled={isProcessingPhotos}
                                  onChange={(e) => handlePhotoUpload(idx, e)}
                                />
                              </label>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {product && (
                      <button
                        type="button"
                        onClick={() => setUploadedPhotos((prev) => [...prev, null])}
                        className="relative aspect-square rounded-2xl border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-all bg-background flex flex-col items-center justify-center text-primary cursor-pointer"
                      >
                        <span className="text-xl md:text-2xl font-bold">+</span>
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider mt-1">Add Slot</span>
                      </button>
                    )}
                  </div>
                </div>

                {uploadedPhotos.length > 0 && (
                  uploadedPhotos.filter(Boolean).length < uploadedPhotos.length ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                      <span>⚠️</span> Please upload all {uploadedPhotos.length} images.
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1.5">
                      <span>✓</span> All slots filled! Ready to add to bag.
                    </p>
                  )
                )}
              </div>
            )}

            {/* Optional Custom Text for Frame Section */}
            {product && requiredSlots > 0 && (
              <div className="space-y-4 p-6 rounded-3xl bg-secondary/30 border border-border/80 shadow-inner">
                {!showFrameText ? (
                  <button
                    type="button"
                    onClick={() => setShowFrameText(true)}
                    className="flex items-center gap-2 text-primary hover:text-primary/85 font-bold text-sm transition-colors py-2 px-4 rounded-full border border-primary/20 hover:bg-primary/5 bg-background shadow-sm"
                  >
                    <span className="text-base font-bold">+</span> Add Custom Text to Print on Frame (Optional)
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                        <span>✍️</span> Text to Print on Frame
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowFrameText(false);
                          setCustomText('');
                        }}
                        className="text-xs text-destructive hover:text-destructive/80 font-bold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <Input
                      type="text"
                      placeholder="e.g. Happy Anniversary, Best Mom, etc."
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="h-12 bg-background border-border rounded-xl focus-visible:ring-primary font-medium"
                      maxLength={100}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-8">
               <div className="flex items-center gap-4 md:gap-6 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-accent/5 border border-primary/5">
                  <div className="w-11 h-11 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                    <Truck className="w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Express Delivery</p>
                    <p className="text-sm md:text-lg font-bold">2-4 Business Days</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 md:gap-6 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-accent/5 border border-primary/5">
                  <div className="w-11 h-11 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Studio Grade</p>
                    <p className="text-sm md:text-lg font-bold">Quality Inspected</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-5 md:gap-10 pt-5 md:pt-8 border-t border-dashed">
              <div className="hidden md:flex items-center gap-8">
                <div className="flex items-center border-2 rounded-full px-8 h-20 bg-card shadow-soft">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 font-bold text-3xl hover:text-primary transition-colors">-</button>
                  <span className="w-20 text-center font-bold text-3xl font-headline">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 font-bold text-3xl hover:text-primary transition-colors">+</button>
                </div>
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => product && toggleWishlist(product)}
                    className={`rounded-full h-20 w-20 border-2 ${product && isInWishlist(product.id) ? 'text-red-500 hover:text-red-600' : ''}`}
                  >
                    <Heart className={`w-8 h-8 ${product && isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full h-20 w-20 border-2"><Share2 className="w-8 h-8" /></Button>
                </div>
              </div>

              {/* Desktop Buttons — context-aware */}
              {(isUpdateMode || isSaving) ? (
                // UPDATE MODE: customer came from checkout to upload photos
                <div className="hidden md:flex flex-col gap-3 mb-4">
                  <Button
                    onClick={() => handleAddToCart(true)}
                    disabled={!photosReady}
                    className={`h-24 rounded-full text-2xl md:text-3xl font-headline font-bold shadow-2xl transition-all ${
                      photosReady
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20 text-white'
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {photosReady ? (
                      <><Check className="mr-4 w-8 h-8" /> Save Photos &amp; Return to Checkout</>
                    ) : (
                      <><Camera className="mr-4 w-8 h-8" /> Upload Photos to Continue</>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {photosReady
                      ? 'All photos uploaded — ready to complete your order.'
                      : `${uploadedPhotos.filter(Boolean).length} of ${requiredSlots} photos uploaded.`}
                  </p>
                </div>
              ) : (
                // NORMAL MODE: fresh add
                <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                  <Button onClick={() => handleAddToCart()} variant="outline" className="h-24 rounded-full text-3xl font-headline font-bold border-2">
                    <ShoppingBag className="mr-4 w-8 h-8" /> Add to Bag
                  </Button>
                  <Button onClick={() => handleAddToCart(true)} className="h-24 rounded-full text-3xl font-headline font-bold shadow-2xl shadow-primary/20">
                    Buy Now
                  </Button>
                </div>
              )}

              {/* WhatsApp Fast Customization Contact */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl md:rounded-[2rem] p-4 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="text-center sm:text-left">
                  <h4 className="font-bold text-base md:text-xl text-green-700 dark:text-green-400 mb-1">Have a custom design in mind?</h4>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Our artists are online to check your photos instantly.</p>
                </div>
                <Button asChild className="h-10 md:h-14 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm md:text-base font-bold px-5 md:px-8 shadow-xl shadow-green-600/20 shrink-0 border-none">
                  <a href={`${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(`Hi PGK Gifts! I have a question about customizing the ${product.name}.`)}`} target="_blank" rel="noopener noreferrer">
                     Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-12 md:mt-32 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 md:pb-6 mb-6 md:mb-12">
             <h2 className="text-2xl md:text-4xl font-headline font-bold">Customer Reviews</h2>
             <div className="flex items-center gap-2">
                <Star className="w-5 h-5 md:w-8 md:h-8 text-yellow-500 fill-current" />
                <span className="text-lg md:text-2xl font-bold font-headline">{reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "5.0"}</span>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <div className="space-y-4 md:space-y-8">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground italic">No reviews yet. Be the first to share your experience!</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-secondary/20 p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-border/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg">{review.authorName}</p>
                        <p className="text-xs text-muted-foreground">{toDate(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                           <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                  </div>
                ))
              )}
            </div>

            <div className="bg-card p-5 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl md:shadow-2xl border border-white/5 h-fit md:sticky md:top-32">
              <h3 className="text-xl md:text-2xl font-headline font-bold mb-5 md:mb-8">Share Your Thoughts</h3>
              <form onSubmit={submitReview} className="space-y-5 md:space-y-6">
                <div>
                  <Label>Overall Rating</Label>
                  <div className="flex gap-2 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button 
                        key={i} 
                        type="button" 
                        onClick={() => setNewReview({...newReview, rating: i + 1})}
                        className={`transition-transform hover:scale-110 ${i < newReview.rating ? 'text-yellow-500' : 'text-muted-foreground/30'}`}
                      >
                        <Star className={`w-7 h-7 md:w-8 md:h-8 ${i < newReview.rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Your Name</Label>
                  <Input 
                    required 
                    value={newReview.authorName}
                    onChange={e => setNewReview({...newReview, authorName: e.target.value})}
                    placeholder="Verified Buyer" 
                    className="h-12 mt-2 bg-secondary/50 rounded-xl border-none focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <Label>Review</Label>
                  <Textarea 
                    required 
                    value={newReview.text}
                    onChange={e => setNewReview({...newReview, text: e.target.value})}
                    placeholder="How does it look in your space?" 
                    className="mt-2 bg-secondary/50 rounded-xl border-none focus-visible:ring-primary resize-none"
                    rows={4}
                  />
                </div>
                <Button disabled={isSubmitting} type="submit" className="w-full h-11 md:h-14 rounded-full text-sm md:text-lg font-bold shadow-xl shadow-primary/20">
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Post Review"}
                </Button>
              </form>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Mobile Checkout Bar — context-aware */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-2xl border-t px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-15px_50px_rgba(0,0,0,0.15)]">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            {(isUpdateMode || isSaving) ? 'Updating Order' : 'Investment'}
          </span>
          <span className="text-xl font-headline font-bold text-primary">{formatPrice(currentPrice * quantity)}</span>
        </div>
        <div className="flex gap-3 flex-1">
          {(isUpdateMode || isSaving) ? (
            <Button
              onClick={() => handleAddToCart(true)}
              disabled={!photosReady}
              className={`flex-1 rounded-full h-11 text-sm font-bold shadow-xl px-0 ${
                photosReady
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'opacity-60'
              }`}
            >
              {photosReady ? '✓ Save & Checkout' : 'Upload Photos'}
            </Button>
          ) : (
            <>
              <Button onClick={() => handleAddToCart()} variant="outline" className="flex-1 rounded-full h-11 text-sm font-bold border px-0">
                Bag
              </Button>
              <Button onClick={() => handleAddToCart(true)} className="flex-1 rounded-full h-11 text-sm font-bold shadow-xl px-0">
                Buy Now
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  </>
  );
}
