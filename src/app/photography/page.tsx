import Image from "next/image";
import Link from "next/link";
import { Camera, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";

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
  return (
    <div className="bg-background">
      {/* Portfolio Hero */}
      <section className="relative py-32 flex items-center justify-center bg-accent/30 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 rounded-full uppercase font-bold tracking-widest">
            The Lens of PGK
          </Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-8 text-foreground">
            Capturing Stories, Not Just Pictures
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Our photography service is dedicated to the art of storytelling through light, composition, and authentic human emotion.
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/contact">Book a Session <Calendar className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-5 scale-150 rotate-12">
          <Camera className="w-96 h-96" />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {CATEGORIES.map((cat) => {
              const img = PlaceHolderImages.find(i => i.id === cat.id);
              const categorySrc = img?.imageUrl || `https://picsum.photos/seed/${cat.id}/800/1000`;
              
              return (
                <div key={cat.id} className="flex flex-col gap-6 group">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src={categorySrc}
                      alt={cat.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      data-ai-hint={img?.imageHint || "photography"}
                    />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">{cat.count}</span>
                        <h3 className="text-2xl font-headline font-bold mb-2 text-foreground">{cat.title}</h3>
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Gallery */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-headline font-bold mb-4">Our Gallery</h2>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">Explore some of our most memorable work across various styles and environments.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden group cursor-zoom-in">
                <Image
                  src={`https://picsum.photos/seed/pgk-gallery-${i}/600/600`}
                  alt={`Gallery image ${i}`}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                  data-ai-hint="beautiful photography"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium border border-white/40 px-4 py-2 rounded-full">View Large</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Button variant="secondary" size="lg" className="rounded-full px-12 text-primary font-bold">
              Check Instagram Feed <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-headline font-bold mb-16 text-center">The PGK Photography Experience</h2>
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
    </div>
  );
}
