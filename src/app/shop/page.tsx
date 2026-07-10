'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS } from '@/lib/data';
import { adjustProductPrice } from '@/utils/currency';
const ADJUSTED_PRODUCTS = PRODUCTS.map(p => adjustProductPrice(p));

import type { Category } from '@/types/product';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { Grid, Sparkles, Heart, Gift, Search, SlidersHorizontal, X, LampDesk, Package, LayoutGrid, Zap, Loader2, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const CATEGORIES: { name: string; value: Category | 'All'; icon: any }[] = [
  { name: 'All', value: 'All', icon: Grid },
  { name: 'Night Lamps', value: 'Night Lamps', icon: LampDesk },
  { name: 'Wall Decor and Photo Frames', value: 'Wall Decor and Photo Frames', icon: LayoutGrid },
  { name: 'Personalized Gifts', value: 'Personalized Gifts', icon: Heart },
  { name: 'MDF Wall Frames', value: 'MDF Wall Frames', icon: LayoutGrid },
  { name: 'Keychains', value: 'Keychains', icon: Key },
  { name: 'Unique Gifts', value: 'Unique Gifts', icon: Sparkles },
  { name: 'Car Accessories', value: 'Car Dashboard Accessories', icon: Gift },
  { name: 'Hamper Boxes', value: 'Hamper Boxes', icon: Package },
];

import { useDebounce } from '@/hooks/use-debounce';
import { SearchBar } from '@/components/shop/SearchBar';
import { EmptyState } from '@/components/shop/EmptyState';
import { SearchService, SearchResult } from '@/services/search.service';
import { HighlightedText } from '@/components/shop/HighlightedText';
import { useMemo } from 'react';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialCategory = searchParams.get('category') as Category || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [activeCategory, setActiveCategory] = useState<Category | 'All'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbProducts, setDbProducts] = useState<any[]>(ADJUSTED_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isSearching = searchQuery !== debouncedSearchQuery;

  const firestore = useFirestore();

  // Hydration Guard: Sync URL to state only after mount
  useEffect(() => {
    setIsMounted(true);
    if (initialQuery) setSearchQuery(initialQuery);
  }, []);

  // Sync Search Query and Active Category with URL for stickiness and sharing
  useEffect(() => {
    if (!isMounted) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearchQuery) {
      params.set('q', debouncedSearchQuery);
    } else {
      params.delete('q');
    }
    
    if (activeCategory && activeCategory !== 'All') {
      params.set('category', activeCategory);
    } else {
      params.delete('category');
    }
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearchQuery, activeCategory, pathname, router, searchParams, isMounted]);

  useEffect(() => {
    const category = searchParams.get('category') as Category;
    setActiveCategory(category || 'All');
  }, [searchParams]);

  useEffect(() => {
    if (!firestore) {
      setLoading(false);
      return;
    }
    const fetchProducts = async () => {
      try {
        const { ProductsService } = await import('@/services/products.service');
        const svc = new ProductsService(firestore);
        const dynamic = await svc.getAllProducts();
        
        // Elite Scaling: Prepare index and ensure business-ranking fields exist
        let merged = (dynamic || []).map(p => {
          // Authority Mapping: Use local PRODUCTS definition to determine the correct category
          const localProduct = ADJUSTED_PRODUCTS.find(lp => lp.name === p.name);
          let authoritativeCategory = localProduct ? localProduct.category : p.category;

          // Enforcement: Re-route generic Wall Decor Photo Frames string if any
          if (String(authoritativeCategory) === 'Wall Decor Photo Frames') {
            authoritativeCategory = 'Wall Decor and Photo Frames' as Category;
          }

          return {
            ...p,
            category: authoritativeCategory as Category,
            stockCount: p.stockCount ?? 10,
            searchIndex: `${p.name} ${authoritativeCategory} ${(p.tags || []).join(' ')}`.toLowerCase()
          };
        });
        
        // Merge missing local products that might not be in Firestore yet
        ADJUSTED_PRODUCTS.forEach(localP => {
           const localImgFile = (localP.image.split('/').pop()?.split('?')[0] ?? '').toLowerCase();
           
           if (!merged.find(p => {
             const pImgFile = (p.image.split('/').pop()?.split('?')[0] ?? '').toLowerCase();
             return p.name.toLowerCase() === localP.name.toLowerCase() || (localImgFile && pImgFile === localImgFile);
           })) {
              merged.push({
                ...localP,
                stockCount: localP.stockCount ?? 10,
                searchIndex: `${localP.name} ${localP.category} ${(localP.tags || []).join(' ')}`.toLowerCase()
              });
           }
        });

        // Helper to get matching dynamic product from Firestore and merge it
        const getMergedProduct = (p: typeof ADJUSTED_PRODUCTS[0]) => {
          const dbMatch = dynamic.find(dp => dp.id === p.id || dp.name.toLowerCase().trim() === p.name.toLowerCase().trim());
          if (dbMatch) {
            return {
              ...p,
              ...dbMatch,
              category: p.category,
              stockCount: dbMatch.stockCount ?? p.stockCount ?? 10,
              searchIndex: `${dbMatch.name || p.name} ${p.category} ${(dbMatch.tags || p.tags || []).join(' ')}`.toLowerCase()
            };
          }
          return {
            ...p,
            stockCount: p.stockCount ?? 10,
            searchIndex: `${p.name} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase()
          };
        };

        // Strict Authority: For the "Night Lamps" category, we override everything to match the local 17-asset catalog exactly.
        // This removes any duplicates that might exist in Firestore but not in our clean local list.
        const cleanNightLamps = ADJUSTED_PRODUCTS
          .filter(p => p.category === 'Night Lamps')
          .map(getMergedProduct);
        merged = merged.filter(p => p.category !== 'Night Lamps');
        merged = [...merged, ...cleanNightLamps];

        const cleanWallDecor = ADJUSTED_PRODUCTS
          .filter(p => p.category === 'Wall Decor and Photo Frames')
          .map(getMergedProduct);
        merged = merged.filter(p => p.category !== 'Wall Decor and Photo Frames' && String(p.category) !== 'Wall Decor Photo Frames');
        merged = [...merged, ...cleanWallDecor];

        const cleanMdfFrames = ADJUSTED_PRODUCTS
          .filter(p => p.category === 'MDF Wall Frames')
          .map(getMergedProduct);
        merged = merged.filter(p => p.category !== 'MDF Wall Frames');
        merged = [...merged, ...cleanMdfFrames];

        const cleanKeychains = ADJUSTED_PRODUCTS
          .filter(p => p.category === 'Keychains')
          .map(getMergedProduct);
        merged = merged.filter(p => p.category !== 'Keychains');
        merged = [...merged, ...cleanKeychains];

        const cleanPersonalizedGifts = ADJUSTED_PRODUCTS
          .filter(p => p.category === 'Personalized Gifts')
          .map(getMergedProduct);
        merged = merged.filter(p => p.category !== 'Personalized Gifts');
        merged = [...merged, ...cleanPersonalizedGifts];

        // Strict De-duplication: Ensure no two products share the same name (prioritizing local overrides)
        const seenNames = new Set<string>();
        const uniqueProducts: any[] = [];
        for (let i = merged.length - 1; i >= 0; i--) {
          const p = merged[i];
          if (!p) continue;
          const nameKey = p.name.toLowerCase().trim();
          if (!seenNames.has(nameKey)) {
            seenNames.add(nameKey);
            uniqueProducts.unshift(p);
          }
        }
        merged = uniqueProducts;

        setDbProducts(merged);
      } catch (e) {
        console.error("Failed to load dynamic products", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [firestore]);

  // Senior Grade: Fuse.js Fuzzy Search with multi-factor weights
  const searchService = useMemo(() => new SearchService(dbProducts), [dbProducts]);

  const results = useMemo((): SearchResult<any>[] => {
    // Elite Logic: Filter by category FIRST to ensure the search service operates on the correct subset
    const categoryFiltered = dbProducts.filter(p =>
      p.active !== false &&
      (activeCategory === 'All' || p.category === activeCategory)
    );

    // Initialize a temporary search service for this specific subset to ensure accurate fuzzy matching
    const contextSearchService = new SearchService(categoryFiltered);

    // Perform fuzzy search with Elite result limit (100) applied to the FILTERED set
    return contextSearchService.search(debouncedSearchQuery, 100);
  }, [debouncedSearchQuery, activeCategory, dbProducts]);

  // Elite: "Did you mean" suggestions logic
  const suggestions = useMemo(() => {
    if (debouncedSearchQuery && results.length === 0) {
      return searchService.getSuggestions(debouncedSearchQuery);
    }
    return [];
  }, [debouncedSearchQuery, results, searchService]);

  const handleSearchSubmit = (query: string) => {
    if (query) SearchService.saveRecentSearch(query);
  };

  return (
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-8 md:mb-16 space-y-3 md:space-y-6"
      >
        <Badge variant="outline" className="px-4 py-1 rounded-full uppercase tracking-widest font-bold border-primary text-primary">Discover</Badge>
        <h1 className="text-3xl md:text-8xl font-headline font-bold leading-tight tracking-tight md:tracking-tighter">
          {activeCategory === 'All' ? 'Artistic Shop' : activeCategory}
        </h1>
        <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Every piece in our catalog is carefully curated to ensure it brings a smile to your loved ones.
        </p>
      </motion.div>

      <div className="mb-8 md:mb-16">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          isSearching={isSearching}
        />
      </div>

      <div className="flex flex-col gap-5 md:gap-10 mb-8 md:mb-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 border-b pb-5 md:pb-8">
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 w-full pb-4">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                variant={activeCategory === cat.value ? 'default' : 'ghost'}
                className={`rounded-full px-3 py-1 h-8 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${activeCategory === cat.value ? 'shadow-xl shadow-primary/20' : 'text-muted-foreground'}`}
              >
                <cat.icon className="w-3 h-3 md:w-4 md:h-4 mr-2" /> {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Displaying <span className="text-foreground">{results.length}</span> Masterpieces
          </p>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-full h-10 md:h-12 px-4 md:px-6 border md:border-2 text-sm md:text-base font-bold group">
              <SlidersHorizontal className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> Filters
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10"
      >
        <AnimatePresence mode="popLayout">
          {results.map(({ item, matches }, index) => {
            // Adaptive Stagger: Disable staggered animations for large result sets to maintain 60FPS
            const isStaggerEnabled = results.length < 20;
            const nameMatches = (matches as any[])?.find((m: any) => m.key === 'name')?.indices;

            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: isStaggerEnabled ? Math.min(index * 0.03, 0.3) : 0,
                  layout: { type: "spring", damping: 30, stiffness: 200 }
                }}
              >
                <div className="space-y-4">
                  <ProductCard product={item} />
                  {/* Elite Match Highlighting in the name below the card if searching */}
                  {debouncedSearchQuery && nameMatches && (
                    <p className="text-center text-xs font-medium text-muted-foreground truncate px-4">
                      <HighlightedText text={item.name} matches={nameMatches} />
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {!loading && results.length === 0 && (
          <EmptyState
            onClear={() => { setSearchQuery(''); setActiveCategory('All'); }}
            suggestions={suggestions}
            onSuggestClick={(s) => { setSearchQuery(s); handleSearchSubmit(s); }}
            subtext={searchQuery ? `No results for "${searchQuery}". Our fuzzy matching tried but couldn't find a close fit!` : "This collection is currently resting. Explore our other categories!"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen pt-28 md:pt-40 pb-20 md:pb-40 bg-background">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-60 text-center flex flex-col items-center gap-8">
          <Loader2 className="w-20 h-20 animate-spin text-primary opacity-20" />
          <p className="font-headline text-3xl font-bold animate-pulse">Launching Boutique...</p>
        </div>
      }>
        <ShopContent />
      </Suspense>
    </div>
  );
}
