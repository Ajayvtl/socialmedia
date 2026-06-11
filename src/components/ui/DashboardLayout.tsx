import React from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  stats?: React.ReactNode;
  charts?: React.ReactNode;
}

export function DashboardLayout({
  stats,
  charts,
  children,
  className,
  ...props
}: DashboardLayoutProps) {
  return (
    <div className={cn("space-y-6 w-full", className)} {...props}>
      {/* Dynamic Statistics Panel Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats}
        </div>
      )}

      {/* Main Charts & Analytics Block */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {charts}
        </div>
      )}

      {/* Primary Listing/Records Block */}
      <div className="w-full">{children}</div>
    </div>
  );
}
