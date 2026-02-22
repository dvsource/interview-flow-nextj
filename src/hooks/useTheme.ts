"use client";

import { useEffect, useState, useCallback } from "react";

export type ThemeName = "ocean" | "forest" | "sunset" | "slate";

export const THEMES: { name: ThemeName; label: string; color: string }[] = [
  { name: "ocean", label: "Ocean", color: "hsl(180 35% 55%)" },
  { name: "forest", label: "Forest", color: "hsl(85 35% 55%)" },
  { name: "sunset", label: "Sunset", color: "hsl(25 50% 60%)" },
  { name: "slate", label: "Slate", color: "hsl(30 30% 60%)" },
];

const STORAGE_KEY = "interview-preferences";

interface StoredPreferences {
  theme?: ThemeName;
  hasCompletedSetup?: boolean;
}

function loadStoredTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: StoredPreferences = JSON.parse(stored);
      if (parsed.theme && THEMES.some((t) => t.name === parsed.theme)) {
        return parsed.theme;
      }
    }
  } catch {
    // ignore
  }
  return "slate";
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>("slate");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = loadStoredTheme();
    setThemeState(storedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    THEMES.forEach((t) => html.classList.remove(`theme-${t.name}`));
    html.classList.add(`theme-${theme}`);
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: StoredPreferences = stored ? JSON.parse(stored) : {};
      parsed.theme = newTheme;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      // ignore
    }
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIndex = THEMES.findIndex((t) => t.name === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].name);
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    cycleTheme,
    themes: THEMES,
    mounted,
  };
}
