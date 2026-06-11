import React from "react";
import { cn } from "@/lib/utils";

export interface AuroraTableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export function AuroraTable({ className, children, ...props }: AuroraTableProps) {
  return (
    <div className="w-full overflow-x-auto border border-border rounded-xl bg-surface">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-surface-secondary border-b border-border text-xs font-semibold text-foreground/50 uppercase tracking-wider", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-border/60", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-surface-secondary/40 transition-colors duration-100", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-6 py-4 font-semibold text-foreground/70 align-middle", className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-6 py-4 align-middle text-foreground/80", className)} {...props}>
      {children}
    </td>
  );
}
