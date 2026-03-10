
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/lib/data';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your shopping bag.`,
      action: (
        <ToastAction altText="Go to cart" onClick={() => router.push('/cart')}>
          View Cart
        </ToastAction>
      ),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden group border-none shadow-soft hover:shadow-xl transition-all duration-300 rounded-[2rem] bg-card">
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button variant="secondary" className="rounded-full shadow-lg h-12 w-12 p-0">
                <Eye className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Link>
        <CardContent className="p-6">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-lg line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          <p className="text-muted-foreground text-sm mb-2 uppercase tracking-wider font-bold text-[10px]">{product.category}</p>
          <p className="font-headline text-2xl font-bold text-primary">₹{product.price}</p>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button onClick={handleAddToCart} className="w-full rounded-full gap-2 h-12">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
