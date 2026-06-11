import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedContainer } from "./AnimatedContainer";

export interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  stagger?: boolean;
}

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, stagger = true, children, ...props }, ref) => {
    const classes = cn(
      "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]",
      className
    );

    if (stagger) {
      return (
        <AnimatedContainer
          ref={ref as any}
          className={classes}
          animation="stagger"
          {...(props as any)}
        >
          {children}
        </AnimatedContainer>
      );
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

BentoGrid.displayName = "BentoGrid";

export interface BentoItemProps extends HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
}

export const BentoItem = forwardRef<HTMLDivElement, BentoItemProps>(
  ({ className, colSpan = 1, rowSpan = 1, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border bg-surface",
          colSpan === 2 && "md:col-span-2",
          colSpan === 3 && "md:col-span-3",
          colSpan === 4 && "md:col-span-4 lg:col-span-4",
          rowSpan === 2 && "row-span-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoItem.displayName = "BentoItem";
