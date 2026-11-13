'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Flame, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Offer } from '@/types/offer';
import { formatPrice } from '@/utils/currency';

interface LimitedTimeOfferBannerProps {
  offers: Offer[];
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function LimitedTimeOfferBanner({ offers }: LimitedTimeOfferBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no active offers, don't render anything
  if (!offers || offers.length === 0) return null;

  const currentOffer = offers[currentIndex % offers.length] || offers[0];
  if (!currentOffer) return null;

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header Label */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
              <Flame className="w-5 h-5 animate-pulse text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-headline font-extrabold tracking-tight text-foreground flex items-center gap-2">
                Special Monthly Offer <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Limited-time exclusive deals curated for this month</p>
            </div>
          </div>

          {offers.length > 1 && (
            <div className="flex items-center gap-2">
              {offers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-8 bg-amber-500' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`Go to offer ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Offer Banner Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentOffer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-amber-500/30 shadow-[0_25px_60px_-15px_rgba(245,158,11,0.25)] bg-gradient-to-br from-amber-950/40 via-background to-background backdrop-blur-xl"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-[90px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10 items-center relative z-10">
              
              {/* Left Column: Photo / Image */}
              <div className="lg:col-span-5 relative group">
                <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square w-full rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-black/40">
                  <Image
                    src={currentOffer.image || '/placeholder.png'}
                    alt={currentOffer.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  
                  {/* Badge Overlay */}
                  {currentOffer.badgeText && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs md:text-sm px-4 py-2 rounded-2xl shadow-xl tracking-wider uppercase border border-amber-300/40 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 fill-black text-amber-500" />
                      {currentOffer.badgeText}
                    </div>
                  )}

                  {/* Savings percentage callout badge */}
                  {currentOffer.originalPrice && currentOffer.originalPrice > currentOffer.offerPrice && (
                    <div className="absolute bottom-4 left-4 bg-red-600 text-white font-headline font-black text-sm md:text-base px-4 py-2 rounded-2xl shadow-2xl border border-red-400/40">
                      SAVE {Math.round(((currentOffer.originalPrice - currentOffer.offerPrice) / currentOffer.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Offer Details & Countdown */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                
                {/* Top: Tagline & Title */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Limited Time Deal
                  </div>
                  
                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-headline font-extrabold text-foreground leading-tight">
                    {currentOffer.title}
                  </h3>
                  
                  {currentOffer.subtitle && (
                    <p className="text-base md:text-xl font-medium text-amber-400/90 font-sans">
                      {currentOffer.subtitle}
                    </p>
                  )}

                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                    {currentOffer.description}
                  </p>
                </div>

                {/* Countdown Timer */}
                <OfferCountdown endDate={currentOffer.endDate} />

                {/* Pricing & CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-white/10">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-5xl font-headline font-black text-amber-400 tracking-tight">
                      {formatPrice(currentOffer.offerPrice)}
                    </span>
                    {currentOffer.originalPrice && (
                      <span className="text-lg md:text-2xl font-bold text-muted-foreground/60 line-through">
                        {formatPrice(currentOffer.originalPrice)}
                      </span>
                    )}
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="rounded-full px-8 h-14 text-base font-extrabold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-black hover:opacity-90 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all duration-300"
                  >
                    <Link href={currentOffer.linkUrl || '/shop'} className="flex items-center justify-center gap-2">
                      {currentOffer.linkText || 'Grab Offer Now'}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </div>

              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

function OfferCountdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calculateTimeLeft() {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 inline-block">
      <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2 flex items-center gap-1.5">
        <Clock className="w-3 h-3" /> Offer Ends In:
      </p>
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
          <span className="text-xl md:text-3xl font-headline font-black text-foreground">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Days</span>
        </div>
        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
          <span className="text-xl md:text-3xl font-headline font-black text-foreground">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Hours</span>
        </div>
        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
          <span className="text-xl md:text-3xl font-headline font-black text-foreground">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Mins</span>
        </div>
        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
          <span className="text-xl md:text-3xl font-headline font-black text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Secs</span>
        </div>
      </div>
    </div>
  );
}
