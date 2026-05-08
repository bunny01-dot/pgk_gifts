
'use client';

import React from 'react';

interface HighlightedTextProps {
  text: string;
  matches?: readonly [number, number][];
}

export function HighlightedText({ text, matches }: HighlightedTextProps) {
  const parts = React.useMemo(() => {
    if (!matches || matches.length === 0) {
      return [<>{text}</>];
    }

    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    // Fuse.js indices are [start, end] inclusive
    matches.forEach(([start, end], idx) => {
      // Append non-highlighted text
      if (start > lastIndex) {
        result.push(text.substring(lastIndex, start));
      }

      // Append highlighted text
      result.push(
        <span key={idx} className="bg-primary/20 text-primary font-black rounded-sm px-0.5">
          {text.substring(start, end + 1)}
        </span>
      );

      lastIndex = end + 1;
    });

    // Append remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }
    return result;
  }, [text, matches]);

  return <>{parts}</>;
}
