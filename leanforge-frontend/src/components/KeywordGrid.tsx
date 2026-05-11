// src/components/KeywordGrid.tsx
'use client';

import { Keyword } from '@/lib/api';
import { TrendingCard } from './TrendingCard';

interface KeywordGridProps {
  keywords: Keyword[];
  compact?: boolean;
}

export function KeywordGrid({ keywords, compact = false }: KeywordGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {keywords.map((keyword) => (
        <TrendingCard key={keyword.id} keyword={keyword} compact={compact} />
      ))}
    </div>
  );
}
