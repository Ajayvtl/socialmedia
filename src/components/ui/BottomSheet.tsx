"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className={cn(
        "relative bg-surface w-full md:max-w-lg rounded-t-2xl md:rounded-2xl border border-border shadow-floating overflow-hidden flex flex-col max-h-[85vh] md:max-h-[90vh] transition-transform duration-300 animate-in slide-in-from-bottom md:zoom-in-95",
        className
      )}>
        {/* Drag handle line visible on mobile only */}
        <div className="flex justify-center py-2 md:hidden">
          <div className="w-12 h-1 bg-border/80 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 pt-2 md:pt-4 border-b border-border flex justify-between items-center bg-surface-secondary">
          <h3 className="font-bold text-lg text-foreground tracking-tight">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-surface text-foreground/45 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
