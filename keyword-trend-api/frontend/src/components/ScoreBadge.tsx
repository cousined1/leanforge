interface ScoreBadgeProps {
  label: string;
  value: number | string;
  variant?: 'default' | 'trend' | 'difficulty' | 'velocity';
  className?: string;
}

function getScoreColor(value: number, variant: ScoreBadgeProps['variant']): string {
  if (variant === 'difficulty') {
    if (value >= 70) return 'text-brand-red border-brand-red/30 bg-brand-red/5';
    if (value >= 40) return 'text-brand-amber border-brand-amber/30 bg-brand-amber/5';
    return 'text-brand-green border-brand-green/30 bg-brand-green/5';
  }
  if (variant === 'velocity') {
    if (value > 5) return 'text-brand-green border-brand-green/30 bg-brand-green/5';
    if (value < -5) return 'text-brand-red border-brand-red/30 bg-brand-red/5';
    return 'text-white/60 border-white/10 bg-white/5';
  }
  if (variant === 'trend') {
    if (value >= 70) return 'text-brand-cyan border-brand-cyan/30 bg-brand-cyan/5';
    if (value >= 40) return 'text-brand-amber border-brand-amber/30 bg-brand-amber/5';
    return 'text-white/50 border-white/10 bg-white/5';
  }
  return 'text-white/60 border-white/10 bg-white/5';
}

export default function ScoreBadge({ label, value, variant = 'default', className = '' }: ScoreBadgeProps) {
  const colorClass = typeof value === 'number' ? getScoreColor(value, variant) : 'text-white/60 border-white/10 bg-white/5';

  return (
    <div className={`inline-flex flex-col items-center px-3 py-2 rounded-lg border ${colorClass} ${className}`}>
      <span className="text-xs font-medium opacity-70">{label}</span>
      <span className="text-lg font-bold font-mono tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</span>
    </div>
  );
}
