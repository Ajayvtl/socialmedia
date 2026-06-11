"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

export function Popover({ trigger, children, align = "center", className }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div className={cn(
          "absolute z-40 mt-2 rounded-xl border border-border bg-surface shadow-floating p-4 animate-in fade-in slide-in-from-top-2 duration-150 min-w-[200px]",
          align === "left" && "left-0 origin-top-left",
          align === "right" && "right-0 origin-top-right",
          align === "center" && "left-1/2 -translate-x-1/2 origin-top",
          className
        )}>
          {children}
        </div>
      )}
    </div>
  );
}
