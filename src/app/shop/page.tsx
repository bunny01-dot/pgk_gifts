
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS, Category } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Grid, Sparkles, Heart, Gift, Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const CATEGORIES: { name: string; value: Category | 'All'; icon: any }[] = [
  { name: 'All', value: 'All', icon: Grid },
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
    <div className="min-h-screen pt-40 pb-32 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-20 space-y-6"
        >
          <Badge variant="outline" className="px-4 py-1 rounded-full uppercase tracking-widest font-bold border-primary text-primary">Discover</Badge>
          <h1 className="text-6xl md:text-7xl font-headline font-bold leading-tight">Artistic Shop</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Every piece in our catalog is carefully curated to ensure it brings a smile to your loved ones. Browse our collection of magic and memories.
          </p>
        </motion.div>

        {/* Filter Controls */}
        <div className="flex flex-col gap-10 mb-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search for treasures..." 
                className="pl-14 h-16 rounded-full border-2 bg-card text-lg focus:ring-primary shadow-soft"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  variant={activeCategory === cat.value ? 'default' : 'ghost'}
                  className={`rounded-full px-8 py-6 h-14 text-sm font-bold uppercase tracking-widest transition-all ${activeCategory === cat.value ? 'shadow-xl shadow-primary/20' : 'text-muted-foreground'}`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              Showing <span className="text-foreground font-bold">{filteredProducts.length}</span> products
            </p>
            <Button variant="outline" className="rounded-full gap-2 font-bold px-6 border-2">
              <SlidersHorizontal className="w-4 h-4" /> Sort By
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-accent/10 rounded-[4rem] border-2 border-dashed border-muted"
          >
            <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Search className="w-10 h-10 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-3xl font-headline font-bold mb-4">No treasures found</h3>
            <p className="text-muted-foreground text-lg max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
            <Button onClick={() => { setActiveCategory('All'); setSearchQuery(''); }} variant="link" className="mt-6 text-primary font-bold text-lg">Clear all filters</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
