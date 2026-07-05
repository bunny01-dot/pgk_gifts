
'use client';

import { PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';

export default function CustomizedGiftsPage() {
  const products = PRODUCTS.filter(p => p.category === 'Personalized Gifts' || p.category === 'Customized Gifts');

  return (
    <div className="min-h-screen pt-24 md:pt-32">
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-8 md:mb-20 space-y-3 md:space-y-6">
          <h1 className="text-3xl md:text-7xl font-headline font-bold">Personalized Gifts</h1>
          <p className="text-base md:text-xl text-muted-foreground">
            Personalize your memories on mugs, pillows, and sponge frames. The perfect gift for birthdays and anniversaries.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
