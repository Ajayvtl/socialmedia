"use client";

import React from "react";
import { toast as hotToast, ToastOptions } from "react-hot-toast";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultOptions: ToastOptions = {
  duration: 8000,
  position: "top-right",
};

export const toast = {
  success(message: string, options?: ToastOptions) {
    hotToast.custom(
      (t) => (
        <div className={cn(
          "flex items-center gap-3 bg-surface border border-success/30 px-4 py-3 rounded-xl shadow-floating text-foreground text-sm font-medium transition-all duration-300",
          t.visible ? "animate-in fade-in slide-in-from-top-4" : "animate-out fade-out"
        )}>
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <span>{message}</span>
        </div>
      ),
      { ...defaultOptions, ...options }
    );
  },

  error(message: string, options?: ToastOptions) {
    hotToast.custom(
      (t) => (
        <div className={cn(
          "flex items-center gap-3 bg-surface border border-danger/30 px-4 py-3 rounded-xl shadow-floating text-foreground text-sm font-medium transition-all duration-300",
          t.visible ? "animate-in fade-in slide-in-from-top-4" : "animate-out fade-out"
        )}>
          <XCircle className="w-5 h-5 text-danger shrink-0" />
          <span>{message}</span>
        </div>
      ),
      { ...defaultOptions, ...options }
    );
  },

  warning(message: string, options?: ToastOptions) {
    hotToast.custom(
      (t) => (
        <div className={cn(
          "flex items-center gap-3 bg-surface border border-warning/30 px-4 py-3 rounded-xl shadow-floating text-foreground text-sm font-medium transition-all duration-300",
          t.visible ? "animate-in fade-in slide-in-from-top-4" : "animate-out fade-out"
        )}>
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <span>{message}</span>
        </div>
      ),
      { ...defaultOptions, ...options }
    );
  },

  info(message: string, options?: ToastOptions) {
    hotToast.custom(
      (t) => (
        <div className={cn(
          "flex items-center gap-3 bg-surface border border-border px-4 py-3 rounded-xl shadow-floating text-foreground text-sm font-medium transition-all duration-300",
          t.visible ? "animate-in fade-in slide-in-from-top-4" : "animate-out fade-out"
        )}>
          <Info className="w-5 h-5 text-primary shrink-0" />
          <span>{message}</span>
        </div>
      ),
      { ...defaultOptions, ...options }
    );
  }
};
