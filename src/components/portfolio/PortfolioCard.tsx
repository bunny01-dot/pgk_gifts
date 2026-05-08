
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
      className="group cursor-pointer relative rounded-[2rem] overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500"
      onClick={() => onClick(item)}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Subtle Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Top Badge: Subcategory */}
        <div className="absolute top-6 left-6 z-10">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full">
            {item.subcategory}
          </span>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              {item.category}
            </p>
            <h3 className="text-2xl md:text-3xl font-headline font-bold leading-tight group-hover:text-primary transition-colors duration-300">
              {item.title}
            </h3>
            
            <div className="h-px w-0 bg-primary group-hover:w-full transition-all duration-700 opacity-50" />
            
            <p className="text-sm text-white/70 line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
              {item.description}
            </p>
          </motion.div>
        </div>

        {/* Interactive Corner - View Detail Hint */}
        <div className="absolute bottom-10 right-10 w-12 h-12 rounded-full bg-primary/20 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
