"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes"; // Although it's next-themes v14/v15 standard

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      defaultTheme="neon-orbit" 
      themes={["neon-orbit", "cyberpunk", "golden-hour", "aurora", "midnight", "accessibility"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
