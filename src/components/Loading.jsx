import React from 'react';

export function LoadingSpinner({ size = 'md', text }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-purple-500/20 border-t-purple-500 animate-spin`}
      />
      {text && <p className="text-sm text-[#92929E] font-medium animate-pulse">{text}</p>}
    </div>
  );
}

export function ClientCardSkeleton() {
  return (
    <div className="bg-[#17171F] border border-[#2A2A35] rounded-2xl p-4 flex gap-4 shimmer-effect">
      <div className="w-16 h-16 rounded-full bg-[#20202A] shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-5 bg-[#20202A] rounded-md w-3/5" />
        <div className="h-4 bg-[#20202A] rounded-md w-2/5" />
        <div className="h-8 bg-[#20202A] rounded-xl w-full mt-2" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 max-w-xl mx-auto px-4 py-6">
      {/* Body count skeleton */}
      <div className="bg-[#17171F] border border-[#2A2A35] rounded-3xl p-6 text-center shimmer-effect">
        <div className="h-4 bg-[#20202A] rounded w-24 mx-auto mb-3" />
        <div className="h-14 bg-[#20202A] rounded-xl w-28 mx-auto" />
      </div>

      {/* Search skeleton */}
      <div className="h-12 bg-[#17171F] border border-[#2A2A35] rounded-xl shimmer-effect" />

      {/* Cards skeletons */}
      <div className="space-y-3 pt-2">
        <ClientCardSkeleton />
        <ClientCardSkeleton />
        <ClientCardSkeleton />
      </div>
    </div>
  );
}

