import api from "./api";

export interface AccessibilitySettings {
  reducedMotion: boolean;
  reducedTransparency: boolean;
  highContrast: boolean;
  fontScale: "sm" | "md" | "lg" | "xl";
}

const STORAGE_KEY = "aurora_accessibility_settings";

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  reducedTransparency: false,
  highContrast: false,
  fontScale: "md",
};

export const accessibilityService = {
  /**
   * Retrieves active accessibility settings from localStorage
   */
  getSettings(): AccessibilitySettings {
    if (typeof window === "undefined") return defaultSettings;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultSettings;
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {
      return defaultSettings;
    }
  },

  /**
   * Updates accessibility preferences and re-applies changes to DOM
   */
  updateSettings(settings: Partial<AccessibilitySettings>) {
    if (typeof window === "undefined") return;

    const current = this.getSettings();
    const updated = { ...current, ...settings };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to write accessibility preferences to localStorage", e);
    }

    // Push preference updates to the backend user profile to sync across devices
    api.put("/social-profile", { accessibility_settings: updated }).catch((err) => {
      console.warn("Failed to sync accessibility preferences to backend", err);
    });

    this.applySettings(updated);
  },

  /**
   * Translates active settings into HTML root class properties
   */
  applySettings(settings?: AccessibilitySettings) {
    if (typeof window === "undefined") return;
    const active = settings || this.getSettings();
    const root = document.documentElement;

    // Apply reduced motion modifier
    if (active.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    // Apply reduced transparency modifier
    if (active.reducedTransparency) {
      root.classList.add("reduced-transparency");
    } else {
      root.classList.remove("reduced-transparency");
    }

    // Apply high contrast modifier
    if (active.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Apply font scale mappings
    root.classList.remove("font-scale-sm", "font-scale-md", "font-scale-lg", "font-scale-xl");
    root.classList.add(`font-scale-${active.fontScale}`);
  }
};
