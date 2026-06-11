"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { AuroraInput } from "./AuroraInput";
import { AuroraSelect } from "./AuroraSelect";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterField {
  name: string;
  placeholder: string;
  options: FilterOption[];
}

interface AuroraFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterField[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (name: string, value: string) => void;
  onReset?: () => void;
  className?: string;
}

export function AuroraFilters({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters = [],
  activeFilters = {},
  onFilterChange,
  onReset,
  className,
}: AuroraFiltersProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-border/80 mb-4", className)}>
      {/* Search Input Box */}
      <div className="flex-1 max-w-sm">
        <AuroraInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          icon={<Search className="w-4 h-4 text-foreground/45" />}
        />
      </div>

      {/* Filter Select Boxes */}
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <div key={filter.name} className="w-40">
            <AuroraSelect
              value={activeFilters[filter.name] || ""}
              onChange={(e) => onFilterChange?.(filter.name, e.target.value)}
              placeholder={filter.placeholder}
              options={filter.options}
            />
          </div>
        ))}

        {/* Reset Filters Option Button */}
        {onReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-1.5 hover:bg-surface text-foreground/60 hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
