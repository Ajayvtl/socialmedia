"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = "", ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-sm font-medium text-foreground/85">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45 group-focus-within:text-primary transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={`w-full bg-surface-secondary border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${icon ? 'pl-10' : ''} ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}
