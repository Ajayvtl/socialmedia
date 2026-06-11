"use client";

import React, { forwardRef, useState, useRef, useEffect, useMemo } from "react";
import { FocusRing } from "./FocusRing";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

interface SelectOption {
  label: string;
  value: string | number;
  icon?: string;
}

export interface AuroraSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  description?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  value?: string | number;
  onChange?: (value: any) => void;
  onValueChange?: (value: string | number) => void;
}

export const AuroraSelect = forwardRef<HTMLSelectElement, AuroraSelectProps>(
  ({
    label,
    description,
    options = [],
    placeholder = "Select option",
    error,
    className,
    searchable = true,
    value,
    onChange,
    onValueChange,
    disabled,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [openUpward, setOpenUpward] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Sync input focus when search opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else {
        setSearchQuery("");
        setOpenUpward(false);
      }
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) return;

      const updatePlacement = () => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenUpward(spaceBelow < 280 && spaceAbove > spaceBelow);
      };

      const raf = window.requestAnimationFrame(updatePlacement);
      window.addEventListener("resize", updatePlacement);
      window.addEventListener("scroll", updatePlacement, true);

      return () => {
        window.cancelAnimationFrame(raf);
        window.removeEventListener("resize", updatePlacement);
        window.removeEventListener("scroll", updatePlacement, true);
      };
    }, [isOpen]);

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return options;
      const query = searchQuery.toLowerCase();
      return options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(query) ||
          String(opt.value).toLowerCase().includes(query)
      );
    }, [options, searchQuery]);

    // Find current selected option
    const selectedOption = useMemo(() => {
      return options.find((opt) => String(opt.value) === String(value));
    }, [options, value]);

    const renderOptionIcon = (icon?: string) => {
      if (!icon) return null;
      const isImage = /^https?:\/\//i.test(icon) || icon.startsWith("/");
      if (isImage) {
        return <img src={icon} alt="" aria-hidden="true" className="w-4 h-4 rounded-full object-cover shrink-0" />;
      }
      return <span className="text-lg shrink-0 leading-none">{icon}</span>;
    };

    const emitChange = (nextValue: string | number) => {
      if (onValueChange) {
        onValueChange(nextValue);
      }
      if (onChange) {
        onChange({
          target: {
            name: props.name,
            value: nextValue,
          },
          currentTarget: {
            name: props.name,
            value: nextValue,
          },
          value: nextValue,
        } as any);
      }
    };

    const handleSelectOption = (opt: SelectOption) => {
      if (disabled) return;

      emitChange(opt.value);
      setIsOpen(false);
    };

    return (
      <div ref={containerRef} className="flex flex-col gap-1.5 w-full relative">
        {label && (
          <label className="text-sm font-semibold text-foreground/90 tracking-wide text-white/70">
            {label}
          </label>
        )}

        {description && (
          <p className="text-xs text-foreground/45 leading-relaxed">
            {description}
          </p>
        )}

        <div className="relative">
          {/* Hidden native select for form integration */}
          <select
            ref={ref}
            value={value}
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              if (onValueChange) onValueChange(e.target.value);
              if (onChange) onChange(e);
            }}
            {...props}
          >
            <option value="" disabled>{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* UI Trigger Button */}
          <FocusRing>
            <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setIsOpen(!isOpen)}
              className={cn(
                "w-full flex items-center justify-between bg-white/[0.03] border border-white/20 rounded-2xl px-4 py-2.5 text-sm text-foreground focus:border-[#00E5FF] transition-all duration-150 cursor-pointer text-left h-[48px] disabled:opacity-50 disabled:cursor-not-allowed text-white",
                error && "border-danger/60 focus:border-danger",
                className
              )}
            >
              <span className="truncate flex items-center gap-2">
                {renderOptionIcon(selectedOption?.icon)}
                {selectedOption ? selectedOption.label : <span className="text-white/30">{placeholder}</span>}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform duration-200 shrink-0 ml-2", isOpen && "rotate-180")} />
            </button>
          </FocusRing>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className={cn(
              "absolute left-0 right-0 bg-[#101424]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in duration-150 max-h-[min(18rem,calc(100vh-10rem))] flex flex-col",
              openUpward ? "bottom-full mb-2" : "top-full mt-2 slide-in-from-top-2",
              !openUpward && "slide-in-from-top-2"
            )}>
              {/* Search Bar */}
              {searchable && (
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                  <Search className="w-4 h-4 text-white/35 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none border-none py-1"
                  />
                </div>
              )}

              {/* Options List */}
              <div className="overflow-y-auto overflow-x-hidden py-1 max-h-56 divide-y divide-white/[0.02] scrollbar-thin">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => {
                    const isSelected = String(opt.value) === String(value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors",
                          isSelected
                            ? "bg-[#00E5FF]/20 text-[#00E5FF] font-semibold"
                            : "text-white/80 hover:bg-white/[0.06] hover:text-white"
                        )}
                      >
                        {renderOptionIcon(opt.icon)}
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-xs text-white/40 text-center">
                    No results found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger font-medium tracking-wide animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuroraSelect.displayName = "AuroraSelect";
