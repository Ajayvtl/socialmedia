"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlowButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-300 focus:outline-none overflow-hidden";
    
    const variants = {
      primary: "bg-primary text-[#000] hover:bg-primary-hover shadow-glow",
      secondary: "bg-surface-secondary text-foreground border border-border hover:border-primary hover:text-primary",
      accent: "bg-accent text-[#fff] shadow-glow",
      ghost: "bg-transparent text-foreground hover:bg-surface-secondary",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children as React.ReactNode}</span>
      </motion.button>
    );
  }
);

GlowButton.displayName = "GlowButton";
