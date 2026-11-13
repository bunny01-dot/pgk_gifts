'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Calendar, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useFirestore } from "@/firebase";
import { PortfolioService } from "@/services/portfolio.service";
import { PortfolioItem } from "@/lib/portfolio-data";

const CATEGORIES = [
  {
    id: "portfolio-wedding",
    title: "Weddings",
    description: "Capturing eternal love and timeless moments from your most special day.",
    count: "150+ Shoots"
  },
  {
    id: "portfolio-portrait",
    title: "Portraits",
    description: "Professional headshots, lifestyle portraits, and personality-driven photography.",
    count: "200+ Clients"
  },
  {
    id: "portfolio-event",
    title: "Events",
    description: "Dynamic coverage of corporate conferences, concerts, and private parties.",
    count: "80+ Events"
  }
];

export default function PhotographyPage() {
  const firestore = useFirestore();
  const [photos, setPhotos] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) return;
    const fetchPhotos = async () => {
      try {
        const svc = new PortfolioService(firestore);
        const allItems = await svc.getAllPortfolioItems();
        // Filter for photography categories
        const photographyItems = allItems.filter(item => 
          ["Weddings", "Portraits", "Events"].includes(item.category)
        );
        setPhotos(photographyItems);
      } catch (err) {
        console.error("Failed to load photography items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [firestore]);

  // Fallback photography photos if none exist in database yet
  const displayPhotos = photos.length > 0 
    ? photos.map(p => ({ id: p.id, imageUrl: p.image, title: p.title, category: p.category }))
    : [1, 2, 3, 4, 5, 6, 7, 8].map(i => ({
        id: `static-${i}`,
        imageUrl: `https://picsum.photos/seed/pgk-gallery-${i}/600/600`,
        title: `Gallery Image ${i}`,
        category: "Showcase"
      }));

  return (
    <div className="bg-background">
      {/* Portfolio Hero */}
      <section className="relative py-16 md:py-32 flex items-center justify-center bg-accent/30 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 rounded-full uppercase font-bold tracking-widest">
            The Lens of PGK
          </Badge>
          <h1 className="text-3xl md:text-7xl font-headline font-bold mb-4 md:mb-8 text-foreground">
            Capturing Stories, Not Just Pictures
          </h1>
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-10 leading-relaxed">
            Our photography service is dedicated to the art of storytelling through light, composition, and authentic human emotion.
          </p>
          <Button asChild size="lg" className="rounded-full h-10 md:h-12 px-5 md:px-8 text-sm md:text-base">
            <Link href="/contact">Book a Session <Calendar className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-5 scale-150 rotate-12">
          <Camera className="w-96 h-96" />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            {CATEGORIES.map((cat) => {
              const img = PlaceHolderImages.find(i => i.id === cat.id);
              const categorySrc = img?.imageUrl || `https://picsum.photos/seed/${cat.id}/800/1000`;
              
              return (
                <div key={cat.id} className="flex flex-col gap-4 md:gap-6 group">
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src={categorySrc}
                      alt={cat.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      data-ai-hint={img?.imageHint || "photography"}
                    />
                  </div>
                  <div className="text-center px-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">{cat.count}</span>
                    <h3 className="text-2xl font-body font-bold mb-2 text-foreground">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Gallery */}
      <section className="py-14 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Our Gallery</h2>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">Explore some of our most memorable work across various styles and environments.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className="relative aspect-square rounded-lg overflow-hidden group cursor-zoom-in"
                onClick={() => setSelectedImage(photo.imageUrl)}
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                  <span className="text-white text-xs font-bold uppercase tracking-wider mb-1">{photo.category}</span>
                  <span className="text-white text-sm font-semibold truncate max-w-full">{photo.title}</span>
                  <span className="text-white text-xs opacity-80 border border-white/40 px-3 py-1 rounded-full mt-2">View Large</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 md:mt-16">
            <Button variant="secondary" size="lg" className="rounded-full h-10 md:h-12 px-5 md:px-12 text-sm md:text-base text-primary font-bold">
              Check Instagram Feed <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-14 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold mb-8 md:mb-16 text-center">The PGK Photography Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "Consultation", text: "We discuss your vision, location, and stylistic preferences." },
              { title: "The Session", text: "Comfortable, directed shoot focused on natural results." },
              { title: "Editing", text: "Artistic retouching and color grading to perfect every frame." },
              { title: "Delivery", text: "High-resolution digital files delivered via secure portal." }
            ].map((step, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                  {i + 1}
                </div>
                <h4 className="text-xl font-headline font-bold">{step.title}</h4>
                <p className="text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox / Zoom Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 border-none bg-black/95 rounded-[2rem] overflow-hidden flex items-center justify-center">
          <DialogTitle className="sr-only">Showcase Lightbox</DialogTitle>
          <DialogDescription className="sr-only">Zoomed image view</DialogDescription>
          {selectedImage && (
            <div className="relative w-full h-[80vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedImage} 
                alt="Zoomed View" 
                className="max-w-full max-h-full object-contain" 
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-primary transition-colors bg-black/60 p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
