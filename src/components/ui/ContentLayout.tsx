import React from "react";
import { cn } from "@/lib/utils";

interface ContentLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  aside?: React.ReactNode;
}

export function ContentLayout({
  aside,
  children,
  className,
  ...props
}: ContentLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row gap-6 items-start w-full",
        className
      )}
      {...props}
    >
      {/* Primary Content Column */}
      <main className="flex-1 w-full min-w-0">{children}</main>

      {/* Auxiliary Sidebar Column */}
      {aside && (
        <aside className="w-full lg:w-80 shrink-0 space-y-6 lg:sticky lg:top-6">
          {aside}
        </aside>
      )}
    </div>
  );
}
