"use client";

import React, { cloneElement, ReactElement, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FocusRingProps {
  children: ReactElement;
  className?: string;
  disabled?: boolean;
}

export function FocusRing({ children, className, disabled = false }: FocusRingProps) {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  if (disabled) {
    return children;
  }

  // Clone children and inject keyboard focus styling properties
  const childProps = children.props as any;
  const childClassName = childProps?.className || "";
  
  return cloneElement(children, {
    className: cn(
      childClassName,
      "outline-none transition-shadow",
      isKeyboardUser && "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
      className
    ),
  } as any);
}
