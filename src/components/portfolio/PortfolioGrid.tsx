
'use client';

import { useState } from 'react';
import { PortfolioItem, PortfolioCategory } from '@/lib/portfolio-data';
import { PortfolioCard } from './PortfolioCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PortfolioGridProps {
  items: PortfolioItem[];
  onItemClick: (item: PortfolioItem) => void;
}

const CATEGORIES: (PortfolioCategory | 'All')[] = [
  'All',
  'Light & Lamp Gifts',
  'Photo Frames & Wall Decor',
  'Customized Gifts',
  'Cute Gift Items',
  'Car Dashboard & Idols',
  'Crystal Gifts',
  'Corporate & Name Boards'
];

export function PortfolioGrid({ items, onItemClick }: PortfolioGridProps) {
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory | 'All'>('All');

  const filteredItems = activeFilter === 'All' 
    ? items 
    : items.filter(item => item.category === activeFilter);

  return (
    <div className="space-y-16">
      {/* Premium Filter Bar */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-4">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`
              relative px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500
              ${activeFilter === category 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-border'}
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* The Gallery Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <PortfolioCard 
              key={item.id} 
              item={item} 
              onClick={onItemClick} 
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-40 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border/50"
        >
          <p className="text-xl font-headline font-bold text-muted-foreground">
            No masterpieces in this collection yet
          </p>
          <p className="text-sm mt-2 text-muted-foreground/60">
            Check back soon for our latest creations.
          </p>
        </motion.div>
      )}
    </div>
  );
}
