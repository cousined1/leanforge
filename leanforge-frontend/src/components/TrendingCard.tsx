// src/components/TrendingCard.tsx
'use client';

import { Keyword } from '@/lib/api';
import { formatNumber, getDirectionColor, getDirectionIcon } from '@/lib/utils';
import Link from 'next/link';
import { TrendChart } from './TrendChart';

interface TrendingCardProps {
  keyword: Keyword;
  compact?: boolean;
}

export function TrendingCard({ keyword, compact = false }: TrendingCardProps) {
  return (
    <Link href={`/keywords/${keyword.slug}`}>
      <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg truncate">{keyword.term}</h3>
            <p className="text-sm text-muted-foreground">{keyword.category}</p>
          </div>
          <div
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              keyword.direction === 'rising'
                ? 'bg-green-50 text-green-700'
                : keyword.direction === 'falling'
                ? 'bg-red-50 text-red-700'
                : 'bg-gray-50 text-gray-700'
            }`}
          >
            <span className="mr-1">{getDirectionIcon(keyword.direction)}</span>
            {keyword.direction}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Trend Score</p>
            <p className="font-semibold text-lg">{keyword.trendScore}/100</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Velocity</p>
            <p className={`font-semibold text-lg ${getDirectionColor(keyword.direction)}`}>
              {keyword.velocity > 0 ? '+' : ''}{keyword.velocity.toFixed(1)}%
            </p>
          </div>
        </div>

        {!compact && (
          <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
            <div>
              <p className="text-muted-foreground text-xs">Search Volume</p>
              <p className="font-semibold">{formatNumber(keyword.searchVolume)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Difficulty</p>
              <p className="font-semibold">{keyword.difficulty.toFixed(0)}</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
