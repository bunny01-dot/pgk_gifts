
'use client';

import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

import { SearchService } from '@/services/search.service';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearchSubmit?: (query: string) => void;
  isSearching?: boolean;
  placeholder?: string;
}

export function SearchBar({ value, onChange, onSearchSubmit, isSearching, placeholder }: SearchBarProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const recentSearches = SearchService.getRecentSearches();
  const trendingSearches = SearchService.getTrendingSearches();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit?.(value);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto group z-50">
      {/* Decorative Glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 rounded-[2.5rem] blur transition duration-1000 ${isFocused ? 'opacity-100 scale-105' : 'opacity-25'}`}></div>
      
      <div className="relative">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors">
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        
        <Input 
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search gifts (e.g., Panda Lamp)"}
          className="w-full h-16 pl-16 pr-16 rounded-full border-2 border-border/50 bg-card text-lg focus-visible:ring-primary focus-visible:border-primary shadow-xl shadow-black/5 transition-all outline-none"
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onChange('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (recentSearches.length > 0 || trendingSearches.length > 0 || value.length > 2) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-4 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl z-[100]"
          >
            <div className="p-8 space-y-8">
              {!value && (
                <>
                  {recentSearches.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground ml-2">Recent Searches</p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((q, i) => (
                          <button 
                            key={i} 
                            onClick={() => { onChange(q); onSearchSubmit?.(q); }}
                            className="px-6 py-3 rounded-full bg-secondary/50 text-sm font-bold hover:bg-primary hover:text-white transition-all border border-transparent hover:border-primary/20"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground ml-2">Trending Now</p>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((q, i) => (
                        <button 
                          key={i} 
                          onClick={() => { onChange(q); onSearchSubmit?.(q); }}
                          className="px-6 py-3 rounded-full bg-primary/5 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all border border-primary/10"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {value && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground ml-2">Search results for</p>
                  <div className="group/item flex items-center gap-5 p-5 rounded-[1.5rem] hover:bg-primary/5 cursor-pointer transition-colors"
                       onClick={() => onSearchSubmit?.(value)}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                      <Search className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl">"{value}"</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
