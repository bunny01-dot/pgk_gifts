
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PRODUCTS, Category } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Grid, Sparkles, Heart, Gift } from 'lucide-react';

const CATEGORIES: { name: string; value: Category | 'All'; icon: any }[] = [
  { name: 'All Products', value: 'All', icon: Grid },
  { name: 'Night Lamps', value: 'Night Lamps', icon: Sparkles },
  { name: 'Cute Toys', value: 'Cute Toys', icon: Heart },
  { name: 'Customized Gifts', value: 'Customized Gifts', icon: Gift },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  const filteredProducts = activeCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen pt-32">
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-headline font-bold">Our Catalog</h1>
          <p className="text-xl text-muted-foreground">
            Browse our wide range of personalized gifts, artistic frames, and unique light lamps designed to make every occasion special.
          </p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              variant={activeCategory === cat.value ? 'default' : 'outline'}
              className={`rounded-full px-8 py-6 h-14 text-lg font-bold transition-all ${activeCategory === cat.value ? 'shadow-xl' : ''}`}
            >
              <cat.icon className="mr-2 w-5 h-5" /> {cat.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-accent/20 rounded-[3rem]">
            <h3 className="text-2xl font-headline font-bold mb-4">No products found</h3>
            <p className="text-muted-foreground">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
