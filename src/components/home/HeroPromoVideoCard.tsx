'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, ExternalLink, Sparkles, Instagram, ShoppingBag } from 'lucide-react';
import { PromoVideo } from '@/types/promo-video';
import { Button } from '@/components/ui/button';

interface HeroPromoVideoCardProps {
  video: PromoVideo;
}

// Route Firebase Storage URLs through the same-origin proxy to bypass CORS
function proxyVideoUrl(url: string): string {
  if (!url) return url;
  if (url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com')) {
    return `/api/video-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function HeroPromoVideoCard({ video }: HeroPromoVideoCardProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const targetLink = video.productLink || '/shop';
  const proxiedUrl = proxyVideoUrl(video.videoUrl);

  const attemptPlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    // Do NOT touch el.muted here — respect whatever the user has chosen.
    el.playsInline = true;
    el.play().then(() => {
      setIsPlaying(true);
      setIsMuted(el.muted);
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        console.warn('Video play blocked:', err.name, err.message);
      }
      setIsPlaying(false);
    });
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // Force muted=true on initial load for autoplay compliance
    el.muted = true;
    el.playsInline = true;
    el.load();

    const onReady = () => attemptPlay();
    el.addEventListener('canplay', onReady, { once: true });

    return () => {
      el.removeEventListener('canplay', onReady);
    };
  }, [video.videoUrl, attemptPlay]);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    const next = !isMuted;
    el.muted = next;
    setIsMuted(next);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      attemptPlay();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden lg:block w-1/2 max-w-sm group"
    >
      {/* Ambient glow */}
      <div className="absolute inset-10 bg-primary/30 blur-[120px] rounded-full animate-pulse pointer-events-none" />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="relative z-10 w-full"
      >
        {/* Card */}
        <div
          className="relative aspect-[9/16] w-full rounded-[3rem] overflow-hidden border-2 border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.5)] bg-black"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-full h-full cursor-pointer" onClick={togglePlay}>

            {/* Blurred fill layer — eliminates black letterbox bars */}
            <video
              aria-hidden
              src={proxiedUrl}
              muted loop playsInline preload="none"
              tabIndex={-1}
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60 pointer-events-none"
            />

            {/* Primary player — object-contain shows full video without cropping */}
            <video
              ref={videoRef}
              autoPlay muted loop playsInline preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="absolute inset-0 w-full h-full object-contain z-10"
            >
              <source src={proxiedUrl} type="video/mp4" />
              <source src={proxiedUrl} type="video/webm" />
            </video>

            {/* Paused overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 space-y-2 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl animate-pulse">
                  <Play className="w-8 h-8 ml-1 fill-white text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white bg-black/70 px-3.5 py-1 rounded-full backdrop-blur-md">
                  Tap to Play ▶
                </span>
              </div>
            )}

            {/* Top-right controls */}
            <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
              <button onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-all shadow-lg">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-all shadow-lg">
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
              </button>
            </div>

            {/* Instagram / Reel badge — top left */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white px-3 py-1.5 rounded-2xl shadow-xl border border-white/30 flex items-center gap-1.5 z-40 pointer-events-none">
              <Instagram className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Reel</span>
            </div>

            {/* Hover-reveal: title + description + CTA */}
            <motion.div
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute bottom-0 inset-x-0 px-5 pt-16 pb-5 bg-gradient-to-t from-black via-black/95 to-transparent z-30 space-y-2 text-left pointer-events-auto"
            >
              {video.productName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/30 border border-primary/50 text-white font-extrabold text-[10px] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-primary" /> {video.productName}
                </span>
              )}
              {video.title && (
                <h4
                  className="text-white text-lg font-headline font-extrabold leading-tight line-clamp-2"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)' }}
                >
                  {video.title}
                </h4>
              )}
              {video.description && (
                <p
                  className="text-sm text-white/90 line-clamp-3 leading-relaxed font-medium"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
                >
                  {video.description}
                </p>
              )}
              <div className="pt-1">
                <Button asChild size="sm"
                  className="w-full rounded-full h-10 font-extrabold text-xs shadow-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                  <Link href={targetLink}>
                    <ShoppingBag className="w-3.5 h-3.5" /> View Product <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Below-card label */}
        <div className="pt-3 flex items-center justify-between px-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Featured Reel</p>
            <p className="mt-0.5 text-sm font-body font-bold leading-tight text-foreground truncate">{video.title}</p>
          </div>
          <Link
            href={targetLink}
            className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-md shrink-0 hover:scale-105 transition-transform"
          >
            Buy Now
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
