import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

export const SkeletonCard = ({ lines = 2 }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-3.5 space-y-2">
    <Skeleton className="h-3 w-16" />
    <Skeleton className="h-6 w-24" />
    {lines > 2 && <Skeleton className="h-2 w-20" />}
  </div>
);

export default Skeleton;
