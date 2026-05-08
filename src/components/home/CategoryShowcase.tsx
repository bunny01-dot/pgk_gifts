
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, LampDesk, Heart, Gift, LayoutGrid, Package, Grid } from 'lucide-react';

const CATEGORIES = [
  {
    title: "Night Lamps",
    subtitle: "Magical Adorable Glow",
    image: "https://i.postimg.cc/mhfDRrw8/lamps.jpg",
    href: "/shop?category=Night%20Lamps",
  },
  {
    title: "Wall Decor",
    subtitle: "Personalized Frames",
    image: "https://i.postimg.cc/hvk116mR/heart-sponge.png",
    href: "/shop?category=Wall%20Decor%20Photo%20Frames",
  },
  {
    title: "Personalized Gifts",
    subtitle: "Made for You",
    image: "https://i.postimg.cc/VLtxPcDT/Mug-print-199-rs.png",
    href: "/shop?category=Personalized%20Gifts",
  },
  {
    title: "Mdf Frames",
    subtitle: "Crafed with Love",
    image: "https://i.postimg.cc/6Qm3b3nK/4D-CUTTING-FRAME-12-10-INCHES-1300-RS.jpg",
    href: "/shop?category=Mdf%20Frames",
  },
  {
    title: "Unique Gifts",
    subtitle: "One of a Kind",
    image: "https://i.postimg.cc/2j1pTWv5/BREATHING-TEDDY-350-RS.jpg",
    href: "/shop?category=Unique%20Gifts",
  },
  {
    title: "Car Accessories",
    subtitle: "Dashboard Decor",
    image: "https://i.postimg.cc/JndqGG4P/Rabbit-car-dashboard-170-rs.jpg",
    href: "/shop?category=Car%20Dashboard%20Accessories",
  },
  {
    title: "Hamper Boxes",
    subtitle: "Luxury Gifting",
    image: "https://i.postimg.cc/QtnbHHxf/unicorn.png",
    href: "/shop?category=Hamper%20Boxes",
  }
];

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
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-primary">Curated Collections</p>
            <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight">Explore Our Highlights</h2>
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
            className="flex overflow-x-auto gap-4 md:gap-8 pb-10 pt-4 scroll-smooth no-scrollbar snap-x snap-mandatory px-2"
          >
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="category-card group relative flex-none w-[85vw] md:w-[calc((100%-96px)/4)] aspect-[4/5] md:aspect-square rounded-[2rem] overflow-hidden border border-border/50 bg-card snap-start transition-all duration-700 hover:shadow-2xl"
              >
                <Link href={cat.href} className="absolute inset-0">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />

                  {/* Hover Mask & Text - Refined for Clarity */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 md:p-10 translate-y-4 group-hover:translate-y-0">
                    <div className="space-y-1 text-white drop-shadow-2xl">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/90">{cat.subtitle}</p>
                      <h3 className="text-xl md:text-2xl font-headline font-bold">{cat.title}</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 3-Dot Navigation Progress Bar */}
          <div className="flex justify-center gap-6 mt-4">
            {[0, 1, 2].map((dot) => {
              const zoneMap = [0, Math.floor(CATEGORIES.length / 2), CATEGORIES.length - 1];
              const isDotActive = dot === 0 
                ? activeIndex < 2 
                : dot === 1 
                  ? (activeIndex >= 2 && activeIndex < 5) 
                  : activeIndex >= 5;

              return (
                <button
                  key={`dot-${dot}`}
                  onClick={() => scrollTo(zoneMap[dot])}
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
