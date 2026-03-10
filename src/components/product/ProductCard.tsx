'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/types/product';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/currency';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Card className="overflow-hidden border-none shadow-soft hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-[2.5rem] bg-card flex flex-col h-full relative">
        <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted m-4 rounded-[2rem]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          
          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-all duration-500 delay-75">
            <Button variant="secondary" size="icon" className="rounded-full shadow-xl bg-white/90 backdrop-blur-sm h-10 w-10">
              <Heart className="w-4 h-4 text-primary" />
            </Button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-16 group-hover:translate-y-0 transition-all duration-500 w-[80%]">
            <Button variant="secondary" className="w-full rounded-full shadow-2xl bg-white/90 backdrop-blur-md h-12 font-bold gap-2">
              <Eye className="w-4 h-4" /> Quick View
            </Button>
          </div>
        </Link>

        <CardContent className="p-8 pt-2 flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">{product.category}</p>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-bold text-foreground">4.9</span>
            </div>
          </div>
          
          <Link href={`/products/${product.id}`}>
            <h3 className="font-headline text-2xl font-bold line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          
          <p className="font-headline text-3xl font-bold text-primary mt-2">
            {formatPrice(product.price)}
          </p>
        </CardContent>

        <CardFooter className="p-8 pt-0">
          <Button onClick={handleAddToCart} className="w-full rounded-full gap-3 h-14 text-base font-bold shadow-lg shadow-primary/10 group/btn">
            <ShoppingBag className="w-5 h-5 transition-transform group-hover/btn:-rotate-12" />
            Add to Bag
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
