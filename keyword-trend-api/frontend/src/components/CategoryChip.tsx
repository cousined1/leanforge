import { Link } from 'react-router-dom';

interface CategoryChipProps {
  name: string;
  slug: string;
  color?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function CategoryChip({ name, slug, color = 'cyan', isActive, onClick }: CategoryChipProps) {
  const content = (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
        isActive
          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/25'
      }`}
      onClick={onClick}
    >
      {name}
    </span>
  );

  if (onClick) return content;
  return <Link to={`/category/${slug}`}>{content}</Link>;
}
