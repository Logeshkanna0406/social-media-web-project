import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
  const variantStyles = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl'
  };

  return (
    <div className={`animate-pulse bg-slate-800/80 ${variantStyles[variant]} ${className}`} />
  );
};

export const PostCardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 mb-4 flex flex-col gap-4 border border-white/5">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton variant="text" className="w-40" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="w-full h-20" />
      <Skeleton variant="rectangular" className="w-full h-48" />
    </div>
  );
};
