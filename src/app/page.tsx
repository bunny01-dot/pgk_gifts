import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera, Gift, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-bg');
  const heroSrc = heroImg?.imageUrl || "https://picsum.photos/seed/pgk-hero/1920/1080";
  
  return (
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <Image
          src={heroSrc}
          alt="Hero background"
          fill
          className="object-cover brightness-50"
          priority
          data-ai-hint="photography camera"
        />
        <div className="container mx-auto px-4 relative z-10 text-white max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold font-headline mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Preserving Your Legacy Through Art
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100/90 leading-relaxed font-body max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Professional photography services and high-quality personalized gifts designed to capture and immortalize your favorite moments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 text-lg">
              <Link href="/gifts">Explore Gifts <Gift className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 rounded-full px-8 text-lg">
              <Link href="/photography">Book Photography <Camera className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-headline font-bold mb-4">What We Offer</h2>
            <div className="h-1 w-20 bg-primary mx-auto mb-6"></div>
            <p className="text-muted-foreground font-body">From the camera lens to the customized product, we ensure every detail of your memory is handled with artistic precision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 group border-none bg-accent/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-headline font-bold mb-3">Photography</h3>
                <p className="text-muted-foreground mb-6">Professional sessions for weddings, portraits, and special events using state-of-the-art equipment.</p>
                <Link href="/photography" className="text-primary font-bold inline-flex items-center hover:gap-2 transition-all">
                  See Portfolio <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 group border-none bg-accent/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Gift className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-headline font-bold mb-3">Personalized Gifts</h3>
                <p className="text-muted-foreground mb-6">High-quality custom mugs, shirts, and frames. Perfect for birthdays, anniversaries, or corporate gifts.</p>
                <Link href="/gifts" className="text-primary font-bold inline-flex items-center hover:gap-2 transition-all">
                  Shop Products <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 group border-none bg-accent/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-headline font-bold mb-3">AI Visualizer</h3>
                <p className="text-muted-foreground mb-6">Use our cutting-edge AI tool to see your photos on our products before you make a purchase.</p>
                <Link href="/visualize" className="text-primary font-bold inline-flex items-center hover:gap-2 transition-all">
                  Try Visualizer <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-accent/20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square md:aspect-auto md:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://picsum.photos/seed/pgk-studio/800/1000"
              alt="Studio session"
              fill
              className="object-cover"
              data-ai-hint="photography studio"
            />
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-headline font-bold">Why Choose PGK Legacy?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded by John Solomon, PGK Legacy is built on the philosophy that every moment tells a story. We don't just take photos; we capture emotions. We don't just sell products; we create heirlooms.
            </p>
            <ul className="space-y-4">
              {[
                "Award-winning professional photographers",
                "Eco-friendly, durable gift printing materials",
                "Cutting-edge AI preview technology",
                "Personalized attention for every client"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="text-primary w-6 h-6 flex-shrink-0" />
                  <span className="text-lg font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Gallery Snippet */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-headline font-bold mb-2">Featured Work</h2>
              <p className="text-muted-foreground">A glimpse into our recent photography projects</p>
            </div>
            <Link href="/photography" className="text-primary font-bold flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg cursor-pointer">
                <Image
                  src={`https://picsum.photos/seed/featured-${i}/600/800`}
                  alt="Gallery image"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  data-ai-hint="wedding portrait"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white font-headline text-lg font-semibold">Special Project {i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
