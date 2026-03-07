
import Image from "next/image";
import Link from "next/link";
import { Gift, ShoppingCart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const PRODUCTS = [
  {
    id: "gift-mug",
    name: "Classic Ceramic Mug",
    price: "$15.00",
    description: "High-quality 11oz ceramic mug, perfect for your favorite beverage and personalized photos.",
    category: "Drinkware",
    tag: "Best Seller"
  },
  {
    id: "gift-tshirt",
    name: "Cotton Graphic T-Shirt",
    price: "$25.00",
    description: "Soft, breathable 100% cotton tee featuring your custom design in vibrant colors.",
    category: "Apparel",
    tag: "Popular"
  },
  {
    id: "gift-canvas",
    name: "Premium Gallery Canvas",
    price: "$45.00",
    description: "Museum-grade canvas stretched over a durable wood frame. Ideal for wall decor.",
    category: "Home Decor",
    tag: "Artistic"
  },
  {
    id: "gift-phone-case",
    name: "Custom Phone Case",
    price: "$20.00",
    description: "Slim and protective cases available for all major smartphone models with your art.",
    category: "Accessories",
    tag: "Trending"
  },
  {
    id: "gift-keychain",
    name: "Photo Keychain",
    price: "$8.00",
    description: "Compact and stylish metal keychain to carry your memories everywhere.",
    category: "Accessories",
    tag: "Small Gift"
  },
  {
    id: "gift-puzzle",
    name: "Custom Photo Puzzle",
    price: "$30.00",
    description: "Turn your memories into fun! 500-piece high-definition custom jigsaw puzzle.",
    category: "Fun & Games",
    tag: "Unique"
  }
];

export default function GiftsPage() {
  return (
    <div className="bg-background py-20">
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 uppercase tracking-wider font-bold">Store</Badge>
          <h1 className="text-5xl font-headline font-bold mb-6">Personalized Gifts</h1>
          <p className="text-xl text-muted-foreground">
            Transform your cherished photos into unique, one-of-a-kind treasures. 
            Choose from our premium catalog and let us help you create the perfect memory.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => {
            const placeholder = PlaceHolderImages.find(img => img.id === product.id) || {
              imageUrl: `https://picsum.photos/seed/${product.id}/600/600`,
              imageHint: "product"
            };
            
            return (
              <Card key={product.id} className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className="relative aspect-square">
                  <Image
                    src={placeholder.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    data-ai-hint={placeholder.imageHint}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary/90 text-white font-bold">{product.tag}</Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-2xl">{product.name}</CardTitle>
                    <span className="font-bold text-xl text-primary">{product.price}</span>
                  </div>
                  <p className="text-sm text-primary/60 font-semibold">{product.category}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
                </CardContent>
                <CardFooter className="flex gap-3">
                  <Button asChild className="flex-1 rounded-full">
                    <Link href="/contact">
                      Inquire Now <MessageSquare className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="rounded-full px-6">
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-24 bg-primary text-primary-foreground rounded-[2rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Gift className="w-64 h-64 rotate-12" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl font-headline font-bold mb-6">Need a Custom Quote for Bulk Orders?</h2>
            <p className="text-lg opacity-90 mb-8">
              Planning an event or looking for corporate branding gifts? We offer special pricing for large orders.
            </p>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-12 text-lg font-bold">
              <Link href="/contact">Inquire Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
