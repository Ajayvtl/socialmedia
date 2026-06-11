"use client";

import React, { forwardRef } from "react";
import { FocusRing } from "./FocusRing";
import { cn } from "@/lib/utils";

export interface AuroraTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const AuroraTextarea = forwardRef<HTMLTextAreaElement, AuroraTextareaProps>(
  ({ label, description, error, className, rows = 4, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-semibold text-foreground/90 tracking-wide">
            {label}
          </label>
        )}
        
        {description && (
          <p className="text-xs text-foreground/45 leading-relaxed">
            {description}
          </p>
        )}

        <FocusRing>
          <textarea
            ref={ref}
            rows={rows}
            className={cn(
              "w-full bg-surface-secondary border border-border/80 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary transition-all duration-150 resize-y",
              error && "border-danger/60 focus:border-danger",
              className
            )}
            {...props}
          />
        </FocusRing>

        {error && (
          <p className="text-xs text-danger font-medium tracking-wide animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuroraTextarea.displayName = "AuroraTextarea";
