"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
  animation?: "fade" | "slideUp" | "scale" | "stagger";
  delay?: number;
}

export function AnimatedContainer({
  children,
  className,
  animation = "fade",
  delay = 0,
  ...props
}: AnimatedContainerProps) {
  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.4, delay } },
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24, delay } },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24, delay } },
    },
    stagger: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: delay,
        },
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants[animation]}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
