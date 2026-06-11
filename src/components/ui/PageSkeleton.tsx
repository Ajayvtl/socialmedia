"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  variant?: 'feed' | 'profile' | 'grid' | 'details' | 'default';
  className?: string;
}

export function PageSkeleton({ variant = 'default', className }: PageSkeletonProps) {
  const renderFeedSkeleton = () => (
    <div className="space-y-6 w-full animate-pulse">
      {/* Composer Skeleton */}
      <div className="p-4 bg-surface-secondary/55 border border-border/40 rounded-xl space-y-3">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-border/40 rounded-full" />
          <div className="h-9 bg-border/30 rounded-lg flex-1" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border/10">
          <div className="flex gap-3">
            <div className="w-16 h-5 bg-border/30 rounded-md" />
            <div className="w-16 h-5 bg-border/30 rounded-md" />
          </div>
          <div className="w-20 h-8 bg-border/40 rounded-lg" />
        </div>
      </div>

      {/* Post Skeletons */}
      {[1, 2].map((i) => (
        <div key={i} className="p-5 bg-surface-secondary/55 border border-border/40 rounded-xl space-y-4">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-border/40 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-border/40 rounded w-1/4" />
              <div className="h-3 bg-border/35 rounded w-1/6" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-border/30 rounded w-full" />
            <div className="h-4 bg-border/30 rounded w-5/6" />
            <div className="h-4 bg-border/30 rounded w-2/3" />
          </div>
          <div className="h-48 bg-border/20 rounded-lg w-full" />
          <div className="flex gap-4 pt-3 border-t border-border/10">
            <div className="w-14 h-5 bg-border/30 rounded" />
            <div className="w-14 h-5 bg-border/30 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-5 bg-surface-secondary/55 border border-border/40 rounded-xl space-y-4">
          <div className="h-32 bg-border/20 rounded-lg w-full" />
          <div className="space-y-2">
            <div className="h-5 bg-border/40 rounded w-3/4" />
            <div className="h-3.5 bg-border/30 rounded w-1/2" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="w-16 h-4 bg-border/30 rounded" />
            <div className="w-20 h-7 bg-border/40 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className="space-y-6 w-full animate-pulse">
      {/* Cover and Avatar */}
      <div className="relative h-48 md:h-64 bg-border/20 rounded-2xl overflow-hidden">
        <div className="absolute bottom-4 left-6 flex items-end gap-4">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-border/40 rounded-full border-4 border-background" />
          <div className="space-y-2 mb-2">
            <div className="h-6 bg-border/45 rounded w-32" />
            <div className="h-4 bg-border/30 rounded w-20" />
          </div>
        </div>
      </div>
      {/* Info Block */}
      <div className="p-6 bg-surface-secondary/55 border border-border/40 rounded-2xl space-y-4">
        <div className="h-4 bg-border/40 rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-3.5 bg-border/30 rounded w-full" />
          <div className="h-3.5 bg-border/30 rounded w-5/6" />
        </div>
      </div>
    </div>
  );

  const renderDefaultSkeleton = () => (
    <div className="space-y-4 w-full animate-pulse">
      <div className="h-8 bg-border/40 rounded w-1/4" />
      <div className="p-6 bg-surface-secondary/55 border border-border/40 rounded-xl space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-border/35 rounded w-1/3" />
            <div className="h-10 bg-border/25 rounded-lg w-full" />
          </div>
        ))}
        <div className="h-10 bg-border/40 rounded-lg w-28 mt-2" />
      </div>
    </div>
  );

  return (
    <div className={cn("w-full", className)}>
      {variant === 'feed' && renderFeedSkeleton()}
      {variant === 'grid' && renderGridSkeleton()}
      {variant === 'profile' && renderProfileSkeleton()}
      {variant === 'default' && renderDefaultSkeleton()}
      {variant === 'details' && renderDefaultSkeleton()}
    </div>
  );
}
