"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
}

export function SidebarLayout({
  sidebar,
  children,
  className,
  ...props
}: SidebarLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative flex min-h-[calc(100vh-64px)] w-full overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-40 flex items-center justify-center p-3 rounded-full bg-primary text-background shadow-floating md:hidden transition-transform duration-200 active:scale-95"
        aria-label="Toggle Navigation Sidebar"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Panel Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-surface flex flex-col transition-transform duration-300 md:relative md:translate-x-0 shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">{sidebar}</div>
      </aside>

      {/* Primary Content Panel */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
