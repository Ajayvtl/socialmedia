"use client";

import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { AuroraTable, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./AuroraTable";
import { AuroraPagination } from "./AuroraPagination";
import { AuroraFilters } from "./AuroraFilters";
import { PageSkeleton } from "./PageSkeleton";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

export interface DataGridColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
  className?: string;
}

export interface BulkAction<T> {
  label: string;
  onClick: (selectedRows: T[]) => void;
  variant?: "default" | "danger";
}

interface FilterField {
  name: string;
  placeholder: string;
  options: { label: string; value: string }[];
}

interface AuroraDataGridProps<T> {
  columns: DataGridColumn<T>[];
  data: T[];
  isLoading?: boolean;
  
  // Search & Filtering
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterField[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (name: string, value: string) => void;
  onResetFilters?: () => void;

  // Pagination
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  // Bulk Selections & Actions
  bulkActions?: BulkAction<T>[];
  rowKey: keyof T;

  // Sorting
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string, order: "asc" | "desc") => void;

  className?: string;
}

export function AuroraDataGrid<T>({
  columns,
  data,
  isLoading = false,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onResetFilters,
  page = 1,
  totalPages = 1,
  onPageChange,
  bulkActions = [],
  rowKey,
  sortField = "",
  sortOrder = "asc",
  onSort,
  className,
}: AuroraDataGridProps<T>) {
  // Local state to track selected rows
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());

  // Check if all rows on this page are selected
  const isAllSelected = useMemo(() => {
    if (data.length === 0) return false;
    return data.every((row) => selectedIds.has(row[rowKey]));
  }, [data, selectedIds, rowKey]);

  // Handle master toggle selection
  const handleToggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        data.forEach((row) => next.delete(row[rowKey]));
      } else {
        data.forEach((row) => next.add(row[rowKey]));
      }
      return next;
    });
  };

  // Handle single row selection toggle
  const handleToggleRow = (id: any) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Convert Set of IDs to arrays of actual rows
  const selectedRows = useMemo(() => {
    return data.filter((row) => selectedIds.has(row[rowKey]));
  }, [data, selectedIds, rowKey]);

  // Trigger sorting handlers
  const handleSortClick = (column: DataGridColumn<T>) => {
    if (!column.sortable || !onSort) return;
    
    const fieldKey = (column.sortKey || column.accessor) as string;
    const nextOrder = sortField === fieldKey && sortOrder === "asc" ? "desc" : "asc";
    onSort(fieldKey, nextOrder);
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {/* Filters & Actions Panel */}
      {onSearchChange && (
        <AuroraFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
          onReset={onResetFilters}
        />
      )}

      {/* Bulk actions status overlay */}
      {selectedRows.length > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-semibold text-primary">
            {selectedRows.length} {selectedRows.length === 1 ? "row" : "rows"} selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  action.onClick(selectedRows);
                  setSelectedIds(new Set()); // Reset selections
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  action.variant === "danger"
                    ? "bg-danger text-foreground hover:bg-danger/80"
                    : "bg-primary text-background hover:bg-primary/80"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Table Data Block */}
      {isLoading ? (
        <PageSkeleton variant="feed" />
      ) : data.length === 0 ? (
        <EmptyState title="No records found" description="Try broadening your search parameters or adding new records." />
      ) : (
        <div className="w-full">
          <AuroraTable>
            <TableHeader>
              <TableRow>
                {/* Bulk Select Checkbox Header column */}
                {bulkActions.length > 0 && (
                  <TableHead className="w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleAll}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </TableHead>
                )}

                {/* Data Column Headers columns */}
                {columns.map((column, idx) => (
                  <TableHead
                    key={idx}
                    className={cn(
                      column.sortable && "cursor-pointer select-none hover:text-foreground/90 transition-colors",
                      column.className
                    )}
                    onClick={() => handleSortClick(column)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{column.header}</span>
                      {column.sortable && onSort && (
                        <span className="text-foreground/30">
                          {sortField === (column.sortKey || column.accessor) ? (
                            sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 opacity-0 hover:opacity-100 transition-opacity" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((row) => {
                const keyVal = row[rowKey];
                const isSelected = selectedIds.has(keyVal);

                return (
                  <TableRow
                    key={String(keyVal)}
                    className={cn(isSelected && "bg-primary/5 hover:bg-primary/10")}
                  >
                    {/* Bulk Select Checkbox Column */}
                    {bulkActions.length > 0 && (
                      <TableCell className="w-12 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(keyVal)}
                          className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                      </TableCell>
                    )}

                    {/* Data Cells */}
                    {columns.map((column, colIdx) => {
                      const content =
                        typeof column.accessor === "function"
                          ? column.accessor(row)
                          : (row[column.accessor] as React.ReactNode);

                      return (
                        <TableCell key={colIdx} className={column.className}>
                          {content}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </AuroraTable>

          {/* Pagination Footer */}
          {onPageChange && (
            <AuroraPagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
