"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded-full border border-border bg-surface-glass backdrop-blur hover:bg-surface text-foreground transition-all">
        <Palette className="w-5 h-5 text-primary" />
      </button>
      
      <div className="absolute right-0 mt-2 w-48 py-2 rounded-xl border border-border bg-surface-glass backdrop-blur shadow-floating opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        {[
          { id: "neon-orbit", label: "Neon Orbit (Default)" },
          { id: "cyberpunk", label: "Cyberpunk" },
          { id: "golden-hour", label: "Golden Hour" },
          { id: "aurora", label: "Aurora" },
          { id: "midnight", label: "Midnight" },
          { id: "accessibility", label: "High Contrast" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-secondary transition-colors ${
              theme === t.id ? "text-primary font-bold" : "text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
