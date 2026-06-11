import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "heavy";
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, intensity = "medium", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-glass border border-border backdrop-blur-xl shadow-soft",
          intensity === "light" && "backdrop-blur-md bg-opacity-40",
          intensity === "heavy" && "backdrop-blur-2xl bg-opacity-80",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";
