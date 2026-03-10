
'use client';

import { PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';

export default function LightLampsPage() {
  const products = PRODUCTS.filter(p => p.category === 'Light Lamps');

  return (
    <div className="min-h-screen pt-32">
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-headline font-bold">Light Lamps</h1>
          <p className="text-xl text-muted-foreground">
            Magical illuminated gifts for your bedside or as a special gift. Our panda and unicorn lamps are fan favorites.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
