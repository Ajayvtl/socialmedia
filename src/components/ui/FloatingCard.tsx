"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface FloatingCardProps extends HTMLMotionProps<"div"> {
  glass?: boolean;
}

export const FloatingCard = forwardRef<HTMLDivElement, FloatingCardProps>(
  ({ className, glass = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className={cn(
          "rounded-2xl border border-border p-6 transition-all duration-300",
          glass
            ? "bg-surface-glass backdrop-blur-xl shadow-soft hover:shadow-floating"
            : "bg-surface hover:bg-surface-secondary shadow-soft hover:shadow-floating",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

FloatingCard.displayName = "FloatingCard";
