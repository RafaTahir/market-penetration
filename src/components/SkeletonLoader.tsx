import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'table' | 'chart';
  rows?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  rows = 3,
  className = ''
}) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] rounded';

  if (type === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`h-4 ${baseClasses}`} style={{ width: `${100 - (i * 10)}%` }} />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className={`h-12 ${baseClasses}`} />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className={`h-10 ${baseClasses}`} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`${className}`}>
        <div className={`h-64 ${baseClasses}`} />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`p-6 rounded-lg border border-slate-700 ${baseClasses.replace('rounded', '')}`}>
          <div className={`h-6 w-1/3 ${baseClasses} mb-4`} />
          <div className={`h-4 w-2/3 ${baseClasses} mb-2`} />
          <div className={`h-4 w-1/2 ${baseClasses}`} />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-5 gap-4 p-4 bg-slate-700/30 rounded-lg">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-600 rounded animate-pulse" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b border-slate-700">
        {Array.from({ length: 5 }).map((_, j) => (
          <div key={j} className="h-4 bg-slate-700 rounded animate-pulse" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/50 animate-pulse">
    <div className="h-6 w-1/3 bg-slate-700 rounded mb-4" />
    <div className="space-y-2">
      <div className="h-4 w-full bg-slate-700 rounded" />
      <div className="h-4 w-5/6 bg-slate-700 rounded" />
      <div className="h-4 w-4/6 bg-slate-700 rounded" />
    </div>
  </div>
);

export default SkeletonLoader;
