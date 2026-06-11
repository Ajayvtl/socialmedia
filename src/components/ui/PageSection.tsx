import React from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function PageSection({
  title,
  description,
  children,
  className,
  ...props
}: PageSectionProps) {
  return (
    <section className={cn("space-y-4 py-4", className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-xs text-foreground/45 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="w-full">{children}</div>
    </section>
  );
}
