
'use client';

import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product, CONTACT_INFO } from '@/lib/data';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const whatsappMessage = encodeURIComponent(`Hello PGK Studio,\nI want to order this product: ${product.name}`);
  const whatsappLink = `${CONTACT_INFO.whatsapp}&text=${whatsappMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden group border-none shadow-soft hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
          <p className="text-muted-foreground text-sm mb-2">{product.category}</p>
          <p className="font-headline text-xl font-bold text-primary">{product.price}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full rounded-full gap-2">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <ShoppingCart className="w-4 h-4" />
              Order on WhatsApp
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
