"use client";

import React, { ReactNode } from "react";
import { PageErrorBoundary } from "./PageErrorBoundary";
import { PageSkeleton } from "./PageSkeleton";
import { EmptyState } from "./EmptyState";
import { PermissionState, PermissionStateVariant } from "./PermissionState";

interface AsyncBoundaryProps {
  children: ReactNode;
  
  // Loading state parameters
  loading?: boolean;
  skeletonVariant?: 'feed' | 'profile' | 'grid' | 'details' | 'default';
  
  // Error boundary parameters
  error?: any;
  moduleName?: string;
  errorFallback?: ReactNode;
  
  // Empty state parameters
  empty?: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDesc?: string;
  emptyActionLabel?: string;
  emptyOnAction?: () => void;
  
  // Permission state parameters
  permissionDenied?: boolean;
  permissionVariant?: PermissionStateVariant;
  permissionTitle?: string;
  permissionDesc?: string;
  permissionActionLabel?: string;
  permissionOnAction?: () => void;
  
  // Layout wrapping styles
  className?: string;
}

export function AsyncBoundary({
  children,
  loading = false,
  skeletonVariant = "default",
  error = null,
  moduleName = "Component",
  errorFallback,
  empty = false,
  emptyIcon,
  emptyTitle,
  emptyDesc,
  emptyActionLabel,
  emptyOnAction,
  permissionDenied = false,
  permissionVariant = "private",
  permissionTitle,
  permissionDesc,
  permissionActionLabel,
  permissionOnAction,
  className,
}: AsyncBoundaryProps) {
  
  // 1. Check loading state
  if (loading) {
    return <PageSkeleton variant={skeletonVariant} className={className} />;
  }

  // 2. Check permission state
  if (permissionDenied) {
    return (
      <PermissionState
        variant={permissionVariant}
        title={permissionTitle}
        description={permissionDesc}
        actionLabel={permissionActionLabel}
        onAction={permissionOnAction}
        className={className}
      />
    );
  }

  // 3. Check empty state
  if (empty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDesc}
        actionLabel={emptyActionLabel}
        onAction={emptyOnAction}
        className={className}
      />
    );
  }

  // 4. Wrap with error boundary to catch runtime rendering errors and manual passed errors
  return (
    <PageErrorBoundary moduleName={moduleName} fallback={errorFallback || (error ? undefined : null) as any}>
      {error ? (
        // Render artificial error view if error is passed explicitly
        <div className="w-full">
          {errorFallback || (
            <PermissionState 
              variant="suspended" 
              title={`${moduleName} Error`} 
              description={error instanceof Error ? error.message : String(error)} 
              actionLabel="Retry"
              onAction={emptyOnAction}
            />
          )}
        </div>
      ) : (
        children
      )}
    </PageErrorBoundary>
  );
}
