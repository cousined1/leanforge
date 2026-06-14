interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export default function LoadingSkeleton({ count = 6, height = 'h-32', className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`glass-card ${height} animate-pulse`}>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-white/5 rounded w-2/3" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
            <div className="h-8 bg-white/5 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
