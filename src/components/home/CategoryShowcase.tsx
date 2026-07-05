
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';
import type { Category } from '@/types/product';

const CATEGORIES = [
  {
    title: "Night Lamps",
    subtitle: "Magical Adorable Glow",
    category: "Night Lamps",
    href: "/shop?category=Night%20Lamps",
    thumbnail: "/assets/thumbnail/night lamps thumbnail.jpeg"
  },
  {
    title: "Wall Decor and Photo Frames",
    subtitle: "Personalized Frames",
    category: "Wall Decor and Photo Frames",
    href: "/shop?category=Wall%20Decor%20and%20Photo%20Frames",
    thumbnail: "/assets/thumbnail/wall decor thumnail.jpeg"
  },
  {
    title: "Personalized Gifts",
    subtitle: "Made for You",
    category: "Personalized Gifts",
    href: "/shop?category=Personalized%20Gifts",
  },
  {
    title: "MDF Wall Frames",
    subtitle: "Crafted with Love",
    category: "MDF Wall Frames",
    href: "/shop?category=MDF%20Wall%20Frames",
    thumbnail: "/assets/thumbnail/MDF.webp"
  },
  {
    title: "Unique Gifts",
    subtitle: "One of a Kind",
    category: "Unique Gifts",
    href: "/shop?category=Unique%20Gifts",
  },
  {
    title: "Car Accessories",
    subtitle: "Dashboard Decor",
    category: "Car Dashboard Accessories",
    href: "/shop?category=Car%20Dashboard%20Accessories",
  },
  {
    title: "Hamper Boxes",
    subtitle: "Luxury Gifting",
    category: "Hamper Boxes",
    href: "/shop?category=Hamper%20Boxes",
  },
  {
    title: "Keychains",
    subtitle: "Elite Custom Keepsakes",
    category: "Keychains",
    href: "/shop?category=Keychains",
    thumbnail: "/assets/keychains/acrylic-keychain-style-1.webp"
  }
] satisfies { title: string; subtitle: string; category: Category; href: string; thumbnail?: string }[];

function getCategoryThumbnail(cat: typeof CATEGORIES[number]) {
  if (cat.thumbnail) return cat.thumbnail;
  const category = cat.category;
  return PRODUCTS.find((product) => product.active && product.featured && product.category === category)?.image
    ?? PRODUCTS.find((product) => product.active && product.category === category)?.image
    ?? null;
}

function CategoryPlaceholder({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-center p-4">
      <div className="h-10 w-10 rounded-full border border-primary/20 bg-background/70 mb-3" />
      <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Coming Soon</p>
      <p className="mt-1 text-sm md:text-base font-headline font-bold text-foreground">{title}</p>
    </div>
  );
}

export function CategoryShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const items = container.querySelectorAll('.category-card');
    
    // Safety check for index boundaries
    const safeIndex = Math.max(0, Math.min(index, CATEGORIES.length - 1));
    const targetItem = items[safeIndex] as HTMLElement;

    if (targetItem) {
      container.scrollTo({
        left: targetItem.offsetLeft - container.offsetLeft,
        behavior: 'smooth'
      });
      setActiveIndex(safeIndex);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const items = container.querySelectorAll('.category-card');
    
    // Check if we've reached the absolute end
    const isAtEnd = Math.ceil(scrollLeft + container.clientWidth) >= container.scrollWidth - 20;
    const isAtStart = scrollLeft <= 10;

    if (isAtEnd) {
      setActiveIndex(CATEGORIES.length - 1);
    } else if (isAtStart) {
      setActiveIndex(0);
    } else {
      let closestIndex = 0;
      let minDistance = Infinity;

      items.forEach((item, index) => {
        const distance = Math.abs((item as HTMLElement).offsetLeft - container.offsetLeft - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      setActiveIndex(closestIndex);
    }
  };

  return (
    <section className="pt-2 pb-8 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="hidden md:flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-primary">Curated Collections</p>
            <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight">Highlighted Collections</h2>
          </div>
        </div>

        <div className="relative group/showcase">
          {/* Desktop Navigation Arrows - Pinned and Visible */}
          <div className="hidden md:block">
            <button
              onClick={() => scrollTo(activeIndex - 1)}
              className={`absolute -left-6 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-background/80 backdrop-blur-xl border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all shadow-2xl ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 scale-100'}`}
              aria-label="Previous Category"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => scrollTo(activeIndex + 1)}
              className={`absolute -right-6 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-background/80 backdrop-blur-xl border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all shadow-2xl ${activeIndex === CATEGORIES.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 scale-100'}`}
              aria-label="Next Category"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-4 md:gap-8 pb-3 md:pb-10 pt-2 md:pt-4 scroll-smooth no-scrollbar snap-x snap-mandatory px-1 md:px-2"
          >
            {CATEGORIES.map((cat, i) => {
              const thumbnail = getCategoryThumbnail(cat);

              return (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="category-card group relative flex-none w-[calc((100%-16px)/2)] md:w-[calc((100%-96px)/4)] snap-start transition-all duration-700"
                >
                  <Link href={cat.href} scroll={false} className="block h-full">
                    <div className="relative aspect-square overflow-hidden rounded-3xl md:rounded-[2rem] border border-border/50 bg-card shadow-premium md:hover:shadow-2xl">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={cat.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                      ) : (
                        <CategoryPlaceholder title={cat.title} />
                      )}
                    </div>
                    <div className="px-1 pt-3 md:pt-4 text-center">
                      <h3 className="text-sm md:text-xl font-body font-bold leading-tight line-clamp-2">{cat.title}</h3>
                      <p className="hidden md:block mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{cat.subtitle}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* 3-Dot Navigation Progress Bar */}
          <div className="flex justify-center gap-6 mt-2 md:mt-4">
            {[0, 1, 2].map((dot) => {
              const zoneMap = [0, Math.floor(CATEGORIES.length / 2), CATEGORIES.length - 1];
              const isDotActive = dot === 0 
                ? activeIndex < 3 
                : dot === 1 
                  ? (activeIndex >= 3 && activeIndex < 6) 
                  : activeIndex >= 6;

              return (
                <button
                  key={`dot-${dot}`}
                  onClick={() => scrollTo(zoneMap[dot] ?? 0)}
                  className="group p-2 -m-2 transition-all duration-300"
                  aria-label={`Go to zone ${dot + 1}`}
                >
                  <div className={`h-1 rounded-full transition-all duration-700 ${isDotActive ? 'w-12 bg-primary' : 'w-4 bg-primary/20 group-hover:bg-primary/40'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
