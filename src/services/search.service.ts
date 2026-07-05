import Fuse, { IFuseOptions, FuseResultMatch } from 'fuse.js';

export interface SearchResult<T> {
  item: T;
  score?: number;
  matches?: readonly FuseResultMatch[]; 
}

export class SearchService<T extends Record<string, any>> {
  private fuse: Fuse<T> | null = null;
  private items: T[] = [];

  constructor(items: T[], options: IFuseOptions<T> = {}) {
    this.items = items;
    this.fuse = new Fuse(items, {
      threshold: 0.3,
      location: 0,
      distance: 100,
      minMatchCharLength: 2,
      includeMatches: true, // Elite: Needed for text highlighting
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'category', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      ...options
    });
  }

  search(query: string, limit: number = 100): SearchResult<T>[] {
    if (!query || query.trim() === '') {
      // Elite: Sort by stock and featured status for the "Full Collection" view
      return this.items
        .sort((a, b) => {
          if (a.stockCount === 0 && b.stockCount > 0) return 1;
          if (a.stockCount > 0 && b.stockCount === 0) return -1;
          if (a.featured && !b.featured) return -1;
          return 0;
        })
        .slice(0, limit)
        .map(item => ({ item }));
    }
    
    // Performance: Fuse is very fast, but limiting results keeps the UI snappy
    const results = this.fuse?.search(query, { limit });
    
    // Elite: Advanced Sorting Boosts
    // We prioritize In-Stock items in search results manually
    const boostedResults = results?.sort((a, b) => {
       const aInStock = (a.item as any).stockCount > 0;
       const bInStock = (b.item as any).stockCount > 0;
       if (aInStock && !bInStock) return -1;
       if (!aInStock && bInStock) return 1;
       return (a.score || 0) - (b.score || 0); // Tie-break with Fuse's fuzzy score
    });
    
    // Elite: Simple analytics hook
    console.log(`[Search] Query: "${query}" | Results: ${boostedResults?.length || 0}`);
    
    return boostedResults || [];
  }

  // Suggest near matches if primary query fails
  getSuggestions(query: string): string[] {
    if (!query || !this.fuse) return [];
    // Search with a higher threshold to find "Near Matches"
    const results = this.fuse.search(query, { limit: 3 });
    return results
      .filter(r => (r.score || 1) < 0.6)
      .map(r => (r.item as any).name);
  }

  static getTrendingSearches(): string[] {
    return ["Panda Lamp", "Photo Frame", "Customized Box", "Night Light", "MDF Art"];
  }

  static getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('pgk_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  static saveRecentSearch(query: string) {
    if (typeof window === 'undefined' || !query || query.length < 2) return;
    try {
      const recent = this.getRecentSearches();
      const updated = [query, ...recent.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem('pgk_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving search history", e);
    }
  }
}
