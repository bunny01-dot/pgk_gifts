
'use client';

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  onClear: () => void;
  message?: string;
  subtext?: string;
  suggestions?: string[];
  onSuggestClick?: (query: string) => void;
}

export function EmptyState({ onClear, message, subtext, suggestions, onSuggestClick }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center py-32 px-10 bg-secondary/20 rounded-[4rem] border-4 border-dashed border-border/50 max-w-4xl mx-auto"
    >
      <div className="w-32 h-32 bg-card rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl relative">
        <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] animate-pulse"></div>
        <Search className="w-12 h-12 text-muted-foreground/40 relative z-10" />
      </div>
      
      <h3 className="text-4xl font-headline font-bold mb-4 text-foreground">
        {message || "No treasures found"}
      </h3>
      
      <p className="text-xl text-muted-foreground max-w-sm mx-auto mb-12 leading-relaxed">
        {subtext || "We couldn't find any matches for your current search. Try a different keyword or explore our full collection."}
      </p>

      {suggestions && suggestions.length > 0 && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Did you mean?</p>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => onSuggestClick?.(s)}
                className="px-6 py-2 rounded-full border-2 border-primary/20 text-primary font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <Button 
        onClick={onClear} 
        size="lg"
        className="h-16 px-12 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
      >
        <RotateCcw className="w-5 h-5 mr-3" /> Clear Search
      </Button>
    </motion.div>
  );
}
