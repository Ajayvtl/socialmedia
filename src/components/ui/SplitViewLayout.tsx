"use client";

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SplitViewLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  showDetailMobile?: boolean;
  onBack?: () => void;
}

export function SplitViewLayout({
  sidebar,
  showDetailMobile = false,
  onBack,
  children,
  className,
  ...props
}: SplitViewLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-[calc(100vh-100px)] w-full overflow-hidden border border-border rounded-2xl bg-surface",
        className
      )}
      {...props}
    >
      {/* Master Left Pane */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r border-border flex flex-col shrink-0 bg-surface-secondary",
          showDetailMobile ? "hidden md:flex" : "flex"
        )}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">{sidebar}</div>
      </div>

      {/* Detail Right Pane */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 bg-surface",
          !showDetailMobile ? "hidden md:flex" : "flex"
        )}
      >
        {/* Back navigation header visible on mobile only */}
        {showDetailMobile && (
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border md:hidden bg-surface-secondary shrink-0">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-surface text-foreground/60 transition-colors"
              aria-label="Back to listing"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-foreground/80">Back</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
      </div>
    </div>
  );
}
