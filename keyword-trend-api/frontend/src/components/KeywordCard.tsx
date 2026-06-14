import { Link } from 'react-router-dom';
import type { Keyword } from '../types';
import ScoreBadge from './ScoreBadge';

interface KeywordCardProps {
  keyword: Keyword;
}

function directionArrow(dir: string): string {
  switch (dir) {
    case 'rising':
      return '↑';
    case 'falling':
      return '↓';
    default:
      return '→';
  }
}

function directionColor(dir: string): string {
  switch (dir) {
    case 'rising':
      return 'text-brand-green';
    case 'falling':
      return 'text-brand-red';
    default:
      return 'text-white/40';
  }
}

export default function KeywordCard({ keyword }: KeywordCardProps) {
  return (
    <Link to={`/keyword/${keyword.slug}`} className="glass-card-hover block">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm truncate">{keyword.term}</h3>
          <span className={`text-sm font-mono font-bold shrink-0 ${directionColor(keyword.direction)}`}>
            {directionArrow(keyword.direction)}
          </span>
        </div>

        {keyword.categoryRel && (
          <span className="inline-block text-[10px] uppercase tracking-wider text-white/40 font-medium">
            {keyword.categoryRel.name}
          </span>
        )}

        <div className="flex flex-wrap gap-2">
          <ScoreBadge label="Trend" value={keyword.trendScore} variant="trend" />
          <ScoreBadge label="Volume" value={keyword.searchVolume.toLocaleString()} />
          {keyword.difficulty > 0 && <ScoreBadge label="KD" value={keyword.difficulty} variant="difficulty" />}
          {keyword.velocity !== 0 && <ScoreBadge label="Δ" value={Number(keyword.velocity.toFixed(1))} variant="velocity" />}
        </div>

        {keyword.cpc > 0 && (
          <div className="text-xs text-white/40">
            CPC: ${keyword.cpc.toFixed(2)}
          </div>
        )}
      </div>
    </Link>
  );
}
