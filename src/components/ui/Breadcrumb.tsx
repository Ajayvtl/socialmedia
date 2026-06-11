"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(p => p);

  return (
    <nav className="flex items-center space-x-2 text-sm text-foreground/50 mb-4 px-4 md:px-8">
      <Link href="/dapp/dashboard" className="hover:text-primary transition-colors flex items-center"><Home className="w-4 h-4" /></Link>
      {paths.map((path, idx) => {
        const routeTo = `/${paths.slice(0, idx + 1).join("/")}`;
        const isLast = idx === paths.length - 1;
        return (
          <div key={path} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4" />
            {isLast ? (
              <span className="text-foreground font-bold capitalize">{path.replace(/-/g, " ")}</span>
            ) : (
              <Link href={routeTo} className="hover:text-primary transition-colors capitalize">{path.replace(/-/g, " ")}</Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
