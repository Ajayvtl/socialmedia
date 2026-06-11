"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "right", className }: DropdownProps) {
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
          "absolute z-40 mt-2 w-56 rounded-xl border border-border bg-surface shadow-floating focus:outline-none p-1.5 animate-in fade-in slide-in-from-top-2 duration-150",
          align === "right" ? "right-0" : "left-0",
          className
        )}>
          <div className="py-1 space-y-0.5" role="menu">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors text-left font-medium disabled:opacity-40 disabled:cursor-not-allowed",
                  item.variant === "danger" 
                    ? "text-danger hover:bg-danger/10" 
                    : "text-foreground/80 hover:bg-surface-secondary hover:text-foreground"
                )}
                role="menuitem"
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
