
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PRODUCTS, Category } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Grid, Sparkles, Heart, Gift, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const CATEGORIES: { name: string; value: Category | 'All'; icon: any }[] = [
  { name: 'All Products', value: 'All', icon: Grid },
  { name: 'Light Lamps', value: 'Light Lamps', icon: Sparkles },
  { name: 'Cute Toys', value: 'Cute Toys', icon: Heart },
  { name: 'Customized Gifts', value: 'Customized Gifts', icon: Gift },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <h1 className="text-5xl md:text-7xl font-headline font-bold leading-tight">Artistic Shop</h1>
          <p className="text-xl text-muted-foreground">
            Discover a world of unique, high-quality personalized gifts crafted with love for your special moments.
          </p>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-8 mb-16">
          <div className="relative max-w-md mx-auto w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Search items..." 
              className="pl-12 h-14 rounded-full border-2 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
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
          <div className="text-center py-24 bg-accent/20 rounded-[3rem]">
            <h3 className="text-3xl font-headline font-bold mb-4">No treasures found</h3>
            <p className="text-muted-foreground text-lg">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
