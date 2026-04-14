
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Heart, Share2, ZoomIn, ShoppingBag, ShieldCheck, Truck, Star, Check, Loader2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS, CONTACT_INFO } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ToastAction } from '@/components/ui/toast';
import { formatPrice } from '@/utils/currency';
import { useFirestore } from '@/firebase';
import { Product } from '@/types/product';
import { Review } from '@/types/review';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ authorName: '', rating: 5, text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { firestore } = useFirestore() || {};
  const [product, setProduct] = useState<Product | null>(PRODUCTS.find((p) => p.id === id) as any || null);
  const [loading, setLoading] = useState(!product);

  useEffect(() => {
    if (!firestore || !id) return;
    const loadProduct = async () => {
      try {
        const { ProductsService } = await import('@/services/products.service');
        const svc = new ProductsService(firestore);
        const dynamicProduct = await svc.getProductById(id as string);
        if (dynamicProduct) setProduct(dynamicProduct as Product);

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
          <h2 className="text-4xl font-headline font-bold">Product not found</h2>
          <Button onClick={() => router.push('/shop')} className="rounded-full h-14 px-8">Back to Shop</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (redirect = false) => {
    addToCart({
      ...product,
      quantity,
    });
    
    if (redirect) {
      router.push('/checkout');
    } else {
      toast({
        title: "Added to Bag",
        description: `${product.name} (x${quantity}) is ready for checkout.`,
        action: (
          <div className="flex gap-2">
            <ToastAction altText="View Bag" onClick={() => setIsCartOpen(true)}>
              View Bag
            </ToastAction>
            <Button size="sm" variant="outline" className="h-8 rounded-full text-[10px] font-bold" onClick={() => router.push('/cart')}>
              Checkout
            </Button>
          </div>
        ),
      });
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
    setIsSubmitting(true);
    try {
      const { ReviewsService } = await import('@/services/reviews.service');
      const revSvc = new ReviewsService(firestore);
      const newId = await revSvc.addReview({
        productId: id as string,
        ...newReview
      });
      setReviews([{ id: newId, productId: id as string, createdAt: new Date().toISOString(), ...newReview }, ...reviews]);
      setNewReview({ authorName: '', rating: 5, text: '' });
      toast({ title: 'Review Posted', description: 'Thank you for sharing your experience!' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not post review.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-40 bg-background">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-12 hover:bg-accent/50 rounded-full text-foreground group h-14 px-6 text-xl font-bold"
        >
          <ArrowLeft className="mr-3 w-6 h-6 group-hover:-translate-x-2 transition-transform" /> Back to Catalog
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Image Gallery with High-End Zoom */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div 
              ref={imageRef}
              className="relative aspect-square rounded-[4rem] overflow-hidden bg-muted shadow-2xl cursor-zoom-in group border-none"
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
                <div className="absolute bottom-10 right-10 flex gap-4">
                  {product.videoUrl && (
                    <a href={product.videoUrl} target="_blank" rel="noreferrer" className="bg-primary/90 text-primary-foreground backdrop-blur-md p-5 rounded-3xl shadow-2xl hover:bg-primary transition-colors flex items-center gap-3 font-bold">
                       <PlayCircle className="w-8 h-8" /> Watch Demo
                    </a>
                  )}
                  <div className="bg-card/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">
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
            className="flex flex-col gap-12"
          >
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <Badge variant="secondary" className="rounded-full px-6 py-2 uppercase tracking-[0.3em] font-bold text-xs bg-accent text-primary border-none">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-sm font-bold text-foreground ml-2">5.0 (Vouched)</span>
                </div>
              </div>
              <h1 className="text-7xl font-headline font-bold text-foreground leading-none tracking-tighter">{product.name}</h1>
              <div className="flex items-end gap-6">
                <span className="text-6xl font-headline font-bold text-primary">{formatPrice(product.price)}</span>
                <span className="text-sm text-muted-foreground mb-3 font-bold uppercase tracking-widest">Global Shipping Included</span>
              </div>
            </div>

            <p className="text-3xl text-muted-foreground leading-relaxed max-w-xl font-headline italic">
              "{product.description}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-accent/5 border border-primary/5">
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Express Delivery</p>
                    <p className="text-lg font-bold">2-4 Business Days</p>
                  </div>
               </div>
               <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-accent/5 border border-primary/5">
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Studio Grade</p>
                    <p className="text-lg font-bold">Quality Inspected</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-10 pt-8 border-t border-dashed">
              <div className="flex items-center gap-8">
                <div className="flex items-center border-2 rounded-full px-8 h-20 bg-card shadow-soft">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 font-bold text-3xl hover:text-primary transition-colors">-</button>
                  <span className="w-20 text-center font-bold text-3xl font-headline">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 font-bold text-3xl hover:text-primary transition-colors">+</button>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" size="icon" className="rounded-full h-20 w-20 border-2"><Heart className="w-8 h-8" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full h-20 w-20 border-2"><Share2 className="w-8 h-8" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                <Button onClick={() => handleAddToCart()} variant="outline" className="h-24 rounded-full text-3xl font-headline font-bold border-2">
                  <ShoppingBag className="mr-4 w-8 h-8" /> Add to Bag
                </Button>
                <Button onClick={() => handleAddToCart(true)} className="h-24 rounded-full text-3xl font-headline font-bold shadow-2xl shadow-primary/20">
                  Buy Now
                </Button>
              </div>

              {/* WhatsApp Fast Customization Contact */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <h4 className="font-bold text-xl text-green-700 dark:text-green-400 mb-1">Have a custom design in mind?</h4>
                  <p className="text-sm font-medium text-muted-foreground">Our artists are online to check your photos instantly.</p>
                </div>
                <Button asChild className="h-14 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold px-8 shadow-xl shadow-green-600/20 shrink-0 border-none">
                  <a href={`${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(`Hi PGK Gifts! I have a question about customizing the ${product.name}.`)}`} target="_blank" rel="noopener noreferrer">
                     Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-32 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b pb-6 mb-12">
             <h2 className="text-4xl font-headline font-bold">Customer Reviews</h2>
             <div className="flex items-center gap-2">
                <Star className="w-8 h-8 text-yellow-500 fill-current" />
                <span className="text-2xl font-bold font-headline">{reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "5.0"}</span>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-8">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground italic">No reviews yet. Be the first to share your experience!</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-secondary/20 p-8 rounded-[2rem] border border-border/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg">{review.authorName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                           <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">"{review.text}"</p>
                  </div>
                ))
              )}
            </div>

            <div className="bg-card p-10 rounded-[3rem] shadow-2xl border border-white/5 h-fit sticky top-32">
              <h3 className="text-2xl font-headline font-bold mb-8">Share Your Thoughts</h3>
              <form onSubmit={submitReview} className="space-y-6">
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
                        <Star className={`w-8 h-8 ${i < newReview.rating ? 'fill-current' : ''}`} />
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
                <Button disabled={isSubmitting} type="submit" className="w-full h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20">
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Post Review"}
                </Button>
              </form>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Mobile Checkout Bar - Higher Visibility */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/90 backdrop-blur-2xl border-t p-6 flex items-center justify-between gap-6 shadow-[0_-15px_50px_rgba(0,0,0,0.15)]">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Investment</span>
          <span className="text-3xl font-headline font-bold text-primary">{formatPrice(product.price * quantity)}</span>
        </div>
        <div className="flex gap-3 flex-1">
          <Button onClick={() => handleAddToCart()} variant="outline" className="flex-1 rounded-full h-16 text-lg font-bold border-2 px-0">
            Bag
          </Button>
          <Button onClick={() => handleAddToCart(true)} className="flex-1 rounded-full h-16 text-lg font-bold shadow-xl px-0">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
