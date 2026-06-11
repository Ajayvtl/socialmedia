"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Compass, Users, Calendar, MessageSquare, Shield, Settings, Sparkles, Check, Trash2, Sliders } from "lucide-react";
import { Modal } from "./Modal";
import { FocusRing } from "./FocusRing";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  category: "Navigation" | "Actions" | "Search Results";
  action: () => void;
}

interface AuroraCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  customCommands?: CommandItem[];
}

export function AuroraCommandPalette({
  isOpen,
  onClose,
  customCommands = [],
}: AuroraCommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Default platform action commands
  const defaultCommands = useMemo<CommandItem[]>(() => {
    return [
      {
        id: "nav-feed",
        title: "Go to Feed",
        subtitle: "View the social feed dashboard",
        icon: <Compass className="w-4 h-4" />,
        category: "Navigation",
        action: () => { window.location.href = "/feed"; },
      },
      {
        id: "nav-communities",
        title: "Go to Communities",
        subtitle: "Explore user groups & forums",
        icon: <Users className="w-4 h-4" />,
        category: "Navigation",
        action: () => { window.location.href = "/communities"; },
      },
      {
        id: "nav-events",
        title: "Go to Events",
        subtitle: "See upcoming nearby meets",
        icon: <Calendar className="w-4 h-4" />,
        category: "Navigation",
        action: () => { window.location.href = "/events"; },
      },
      {
        id: "nav-messages",
        title: "Go to Messages",
        subtitle: "View active direct chats",
        icon: <MessageSquare className="w-4 h-4" />,
        category: "Navigation",
        action: () => { window.location.href = "/messages"; },
      },
      {
        id: "nav-creator",
        title: "Go to Creator Hub",
        subtitle: "Analytics and monetization console",
        icon: <Sparkles className="w-4 h-4" />,
        category: "Navigation",
        action: () => { window.location.href = "/creator"; },
      },
      {
        id: "nav-admin",
        title: "Go to Admin Panel",
        subtitle: "Staff controls and moderator lists",
        icon: <Shield className="w-4 h-4" />,
        category: "Navigation",
        action: () => { window.location.href = "/admin"; },
      },
      {
        id: "nav-settings",
        title: "Go to Settings",
        subtitle: "Manage security and features preferences",
        icon: <Settings className="w-4 h-4" />,
        category: "Navigation",
        action: () => { window.location.href = "/settings"; },
      },
      {
        id: "action-clear-drafts",
        title: "Clear Form Drafts",
        subtitle: "Remove all offline form progress",
        icon: <Trash2 className="w-4 h-4 text-danger" />,
        category: "Actions",
        action: () => {
          if (typeof window !== "undefined") {
            Object.keys(localStorage)
              .filter((k) => k.startsWith("aurora_draft_"))
              .forEach((k) => localStorage.removeItem(k));
            alert("All drafts successfully cleared.");
          }
        },
      },
      {
        id: "action-accessibility",
        title: "Toggle Accessibility Controls",
        subtitle: "Open accessibility custom preferences",
        icon: <Sliders className="w-4 h-4 text-primary" />,
        category: "Actions",
        action: () => { window.location.href = "/settings?tab=accessibility"; },
      },
    ];
  }, []);

  // Consolidate list of options
  const allCommands = useMemo(() => {
    return [...defaultCommands, ...customCommands];
  }, [defaultCommands, customCommands]);

  // Filter commands by active search query
  const filteredCommands = useMemo(() => {
    if (!search) return allCommands;
    const term = search.toLowerCase();
    return allCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(term) ||
        cmd.subtitle?.toLowerCase().includes(term) ||
        cmd.category.toLowerCase().includes(term)
    );
  }, [allCommands, search]);

  // Reset active index when search changes
  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Handle hotkey registration: Ctrl + K or Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open trigger via external control if needed, otherwise trigger toggle callback
          onClose(); // In generic setup, toggles state
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Navigate lists using up/down keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, activeIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector("[data-active='true']");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Group filtered results by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, typeof filteredCommands> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Linear flat array mapping indices to handle direct index lookups
  const flatGroupedList = useMemo(() => {
    const list: typeof filteredCommands = [];
    const categories = ["Navigation", "Actions", "Search Results"];
    categories.forEach((cat) => {
      if (groupedCommands[cat]) {
        list.push(...groupedCommands[cat]);
      }
    });
    // Append any miscellaneous categories
    Object.keys(groupedCommands).forEach((cat) => {
      if (!categories.includes(cat)) {
        list.push(...groupedCommands[cat]);
      }
    });
    return list;
  }, [groupedCommands]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl p-0 overflow-hidden border border-border/80 bg-surface rounded-2xl shadow-floating"
    >
      {/* Search Header Input bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-secondary/40">
        <Search className="w-5 h-5 text-foreground/45 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commands, directories, pages, or records..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/35 outline-none"
          autoFocus
        />
        <div className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-surface text-foreground/40 shrink-0">
          ESC to close
        </div>
      </div>

      {/* Commands Options Listing panel */}
      <div
        ref={listRef}
        className="max-h-[360px] overflow-y-auto custom-scrollbar p-2 space-y-3"
      >
        {flatGroupedList.length === 0 ? (
          <div className="py-12 text-center text-sm text-foreground/40">
            No commands or results found matching query.
          </div>
        ) : (
          (() => {
            let itemCounter = 0;
            const categories = ["Navigation", "Actions", "Search Results"];
            const orderedCats = [
              ...categories.filter((c) => groupedCommands[c]),
              ...Object.keys(groupedCommands).filter((c) => !categories.includes(c)),
            ];

            return orderedCats.map((category) => (
              <div key={category} className="space-y-1">
                <h3 className="text-[10px] font-bold tracking-wider text-foreground/35 uppercase px-3 pt-1">
                  {category}
                </h3>
                <div className="space-y-0.5">
                  {groupedCommands[category].map((cmd) => {
                    const currentIdx = itemCounter++;
                    const isActive = activeIndex === currentIdx;

                    return (
                      <FocusRing key={cmd.id}>
                        <div
                          data-active={isActive ? "true" : "false"}
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors select-none",
                            isActive
                              ? "bg-primary text-background"
                              : "hover:bg-surface-secondary text-foreground/80 hover:text-foreground"
                          )}
                        >
                          <div className={cn("shrink-0", isActive ? "text-background" : "text-foreground/45")}>
                            {cmd.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">
                              {cmd.title}
                            </div>
                            {cmd.subtitle && (
                              <div className={cn("text-xs truncate font-medium", isActive ? "text-background/70" : "text-foreground/40")}>
                                {cmd.subtitle}
                              </div>
                            )}
                          </div>
                          {isActive && (
                            <Check className="w-4 h-4 text-background shrink-0" />
                          )}
                        </div>
                      </FocusRing>
                    );
                  })}
                </div>
              </div>
            ));
          })()
        )}
      </div>
    </Modal>
  );
}
