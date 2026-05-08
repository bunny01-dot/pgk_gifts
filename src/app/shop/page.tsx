'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS, Category } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { Grid, Sparkles, Heart, Gift, Search, SlidersHorizontal, X, LampDesk, Package, LayoutGrid, Zap, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const CATEGORIES: { name: string; value: Category | 'All'; icon: any }[] = [
  { name: 'All', value: 'All', icon: Grid },
  { name: 'Night Lamps', value: 'Night Lamps', icon: LampDesk },
  { name: 'Wall Decor', value: 'Wall Decor Photo Frames', icon: LayoutGrid },
  { name: 'Personalized Gifts', value: 'Personalized Gifts', icon: Heart },
  { name: 'Mdf Frames', value: 'Mdf Frames', icon: LayoutGrid },
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
  const [dbProducts, setDbProducts] = useState<any[]>(PRODUCTS);
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

  // Elite: Sync Search Query with URL for stickiness and sharing
  useEffect(() => {
    if (!isMounted) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearchQuery) {
      params.set('q', debouncedSearchQuery);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearchQuery, pathname, router, searchParams, isMounted]);

  useEffect(() => {
    const category = searchParams.get('category') as Category;
    if (category) setActiveCategory(category);
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
          const localProduct = PRODUCTS.find(lp => lp.name === p.name);
          let authoritativeCategory = localProduct ? localProduct.category : p.category;

          // Enforcement: Keep "Mdf Frames" empty by re-routing any matches to Wall Decor
          if (authoritativeCategory === 'Mdf Frames') {
            authoritativeCategory = 'Wall Decor Photo Frames' as Category;
          }

          return {
            ...p,
            category: authoritativeCategory as Category,
            stockCount: p.stockCount ?? 10,
            searchIndex: `${p.name} ${authoritativeCategory} ${(p.tags || []).join(' ')}`.toLowerCase()
          };
        });
        
        // Merge missing local products that might not be in Firestore yet
        PRODUCTS.forEach(localP => {
           const localImgFile = localP.image.split('/').pop()?.split('?')[0].toLowerCase();
           
           if (!merged.find(p => {
             const pImgFile = p.image.split('/').pop()?.split('?')[0].toLowerCase();
             return p.name.toLowerCase() === localP.name.toLowerCase() || (localImgFile && pImgFile === localImgFile);
           })) {
              merged.push({
                ...localP,
                stockCount: localP.stockCount ?? 10,
                searchIndex: `${localP.name} ${localP.category} ${(localP.tags || []).join(' ')}`.toLowerCase()
              });
           }
        });

        // Strict Authority: For the "Night Lamps" category, we override everything to match the local 17-asset catalog exactly.
        // This removes any duplicates that might exist in Firestore but not in our clean local list.
        const cleanNightLamps = PRODUCTS.filter(p => p.category === 'Night Lamps');
        merged = merged.filter(p => p.category !== 'Night Lamps');
        merged = [...merged, ...cleanNightLamps];

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
      activeCategory === 'All' || p.category === activeCategory
    );

    // Initialize a temporary search service for this specific subset to ensure accurate fuzzy matching
    const contextSearchService = new SearchService(categoryFiltered);

    // Perform fuzzy search with Elite result limit (24) applied to the FILTERED set
    return contextSearchService.search(debouncedSearchQuery, 24);
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
        className="max-w-4xl mx-auto text-center mb-16 space-y-6"
      >
        <Badge variant="outline" className="px-4 py-1 rounded-full uppercase tracking-widest font-bold border-primary text-primary">Discover</Badge>
        <h1 className="text-6xl md:text-8xl font-headline font-bold leading-tight tracking-tighter">
          {activeCategory === 'All' ? 'Artistic Shop' : activeCategory}
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Every piece in our catalog is carefully curated to ensure it brings a smile to your loved ones.
        </p>
      </motion.div>

      <div className="mb-16">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          isSearching={isSearching}
        />
      </div>

      <div className="flex flex-col gap-10 mb-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-8">
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
            <Button variant="outline" className="rounded-full h-12 px-6 border-2 font-bold group">
              <SlidersHorizontal className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> Filters
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10"
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: isStaggerEnabled ? Math.min(index * 0.05, 0.5) : 0
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
    <div className="min-h-screen pt-40 pb-40 bg-background">
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
