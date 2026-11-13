'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, ExternalLink, Sparkles, Film, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromoVideo } from '@/types/promo-video';

interface PromotionalVideoPlayerProps {
  videos: PromoVideo[];
}

function parseVideoUrl(url: string) {
  if (!url) return { type: 'direct', embedUrl: '' };

  const cleanUrl = url.trim();

  // Instagram Reel / Post
  const instaMatch = cleanUrl.match(/(?:instagram\.com|instagr\.am)\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (instaMatch && instaMatch[1]) {
    return {
      type: 'instagram',
      embedUrl: `https://www.instagram.com/p/${instaMatch[1]}/embed`
    };
  }

  // YouTube / Shorts
  const ytShortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]+)/);
  if (ytShortsMatch && ytShortsMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytShortsMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytShortsMatch[1]}`
    };
  }

  const ytWatchMatch = cleanUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (ytWatchMatch && ytWatchMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytWatchMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytWatchMatch[1]}`
    };
  }

  return { type: 'direct', embedUrl: cleanUrl };
}

export function PromotionalVideoPlayer({ videos }: PromotionalVideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!videos || videos.length === 0) return null;

  const currentVideo = videos[currentIndex % videos.length] || videos[0];
  if (!currentVideo) return null;

  const videoInfo = parseVideoUrl(currentVideo.videoUrl);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="py-12 md:py-16 relative bg-background overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header Title */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-inner">
              <Film className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-headline font-extrabold tracking-tight text-foreground flex items-center gap-2">
                Featured Product Reel <Sparkles className="w-5 h-5 text-primary fill-primary/30" />
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Watch exclusive videos showcasing our handcrafted creations</p>
            </div>
          </div>

          {videos.length > 1 && (
            <div className="flex items-center gap-2">
              {videos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`Go to video ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Video Player Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVideo.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.5)] bg-card"
          >
            {videoInfo.type === 'instagram' ? (
              /* Instagram Reel Layout */
              <div className="p-6 md:p-10 bg-gradient-to-br from-purple-950/30 via-background to-background flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[500px]">
                {/* Embedded Reel Frame */}
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="relative w-full max-w-[380px] h-[520px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-black">
                    <iframe
                      src={videoInfo.embedUrl}
                      className="w-full h-full border-none"
                      title={currentVideo.title}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>

                {/* Promoted Product Details & CTA */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 font-extrabold text-xs uppercase tracking-widest w-fit">
                    <Instagram className="w-4 h-4 text-pink-400" /> Instagram Featured Reel
                  </div>

                  {currentVideo.productName && (
                    <span className="text-sm font-black uppercase tracking-widest text-primary">
                      Promoted Item: {currentVideo.productName}
                    </span>
                  )}

                  <h3 className="text-2xl md:text-4xl font-headline font-black text-foreground leading-tight">
                    {currentVideo.title}
                  </h3>

                  {currentVideo.description && (
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {currentVideo.description}
                    </p>
                  )}

                  <div className="pt-4 border-t border-white/10">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full px-8 h-14 font-extrabold text-base shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105"
                    >
                      <Link href={currentVideo.productLink || '/shop'} className="flex items-center gap-2">
                        View Promoted Product <ExternalLink className="w-5 h-5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* YouTube or Direct Uploaded Video Layout */
              <div className="relative aspect-video md:aspect-[21/9] w-full bg-black flex items-center justify-center overflow-hidden">
                {videoInfo.type === 'youtube' ? (
                  <iframe
                    src={videoInfo.embedUrl}
                    className="w-full h-full border-none"
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      src={currentVideo.videoUrl}
                      poster={currentVideo.thumbnailUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full h-full object-cover"
                    />

                    {/* Scrim overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

                    {/* Video Controls */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
                      <Button
                        onClick={togglePlay}
                        size="icon"
                        variant="outline"
                        className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all shadow-xl"
                        title={isPlaying ? "Pause Video" : "Play Video"}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </Button>

                      <Button
                        onClick={toggleMute}
                        size="icon"
                        variant="outline"
                        className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all shadow-xl"
                        title={isMuted ? "Unmute Audio" : "Mute Audio"}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
                      </Button>
                    </div>
                  </>
                )}

                {/* Bottom Floating Info & Product Navigation Link */}
                <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col md:flex-row md:items-end justify-between gap-4 pointer-events-auto">
                  <div className="max-w-xl space-y-2 text-left">
                    {currentVideo.productName && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 text-primary-foreground font-bold text-xs uppercase tracking-wider">
                        Promoted Item: {currentVideo.productName}
                      </span>
                    )}
                    <h3 className="text-xl md:text-3xl font-headline font-black text-white leading-tight drop-shadow-md">
                      {currentVideo.title}
                    </h3>
                    {currentVideo.description && (
                      <p className="text-xs md:text-sm text-slate-200/90 line-clamp-2 leading-relaxed drop-shadow">
                        {currentVideo.description}
                      </p>
                    )}
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="rounded-full px-8 h-13 md:h-14 font-extrabold text-sm md:text-base shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105 shrink-0"
                  >
                    <Link href={currentVideo.productLink || '/shop'} className="flex items-center justify-center gap-2">
                      View Promoted Product <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
