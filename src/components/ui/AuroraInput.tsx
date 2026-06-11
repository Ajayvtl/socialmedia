"use client";

import React, { forwardRef } from "react";
import { FocusRing } from "./FocusRing";
import { cn } from "@/lib/utils";

export interface AuroraInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AuroraInput = forwardRef<HTMLInputElement, AuroraInputProps>(
  ({ label, description, error, icon, className, type = "text", ...props }, ref) => {
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

        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35 group-focus-within:text-primary transition-colors duration-150 shrink-0">
              {icon}
            </div>
          )}
          
          <FocusRing>
            <input
              ref={ref}
              type={type}
              className={cn(
                "w-full bg-surface-secondary border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary transition-all duration-150",
                icon && "pl-11",
                error && "border-danger/60 focus:border-danger",
                className
              )}
              {...props}
            />
          </FocusRing>
        </div>

        {error && (
          <p className="text-xs text-danger font-medium tracking-wide animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuroraInput.displayName = "AuroraInput";
