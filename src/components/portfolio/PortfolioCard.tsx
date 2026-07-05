
'use client';

import { PortfolioItem } from '@/lib/portfolio-data';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface PortfolioCardProps {
  item: PortfolioItem;
  onClick: (item: PortfolioItem) => void;
}

export function PortfolioCard({ item, onClick }: PortfolioCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -10 }}
      className="group cursor-pointer relative rounded-[2rem] overflow-hidden bg-card shadow-sm hover:shadow-2xl transition-all duration-500"
      onClick={() => onClick(item)}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Top Badge: Subcategory */}
        <div className="absolute top-6 left-6 z-10">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full">
            {item.subcategory}
          </span>
        </div>
      </div>
      <div className="p-5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">{item.category}</p>
        <h3 className="mt-2 text-xl md:text-2xl font-body font-bold leading-tight text-foreground group-hover:text-primary transition-colors duration-300">{item.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
      </div>
    </motion.div>
  );
}
