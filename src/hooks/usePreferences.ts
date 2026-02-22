"use client";

import { useEffect, useState, useCallback } from "react";
import type { ThemeName } from "./useTheme";

export interface UserPreferences {
  focusTopics: string[];
  defaultDifficulty: string | null;
  sortByProbability: boolean;
  theme: ThemeName;
  hasCompletedSetup: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  focusTopics: [],
  defaultDifficulty: null,
  sortByProbability: false,
  theme: "slate",
  hasCompletedSetup: false,
};

const STORAGE_KEY = "interview-preferences";

export function usePreferences() {
  const [preferences, setPreferencesState] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferencesState({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  const savePreferences = useCallback((newPrefs: Partial<UserPreferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const setFocusTopics = useCallback(
    (topics: string[]) => {
      savePreferences({ focusTopics: topics });
    },
    [savePreferences]
  );

  const toggleFocusTopic = useCallback(
    (topic: string) => {
      setPreferencesState((prev) => {
        const newTopics = prev.focusTopics.includes(topic)
          ? prev.focusTopics.filter((t) => t !== topic)
          : [...prev.focusTopics, topic];
        const updated = { ...prev, focusTopics: newTopics };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    []
  );

  const setDefaultDifficulty = useCallback(
    (difficulty: string | null) => {
      savePreferences({ defaultDifficulty: difficulty });
    },
    [savePreferences]
  );

  const setSortByProbability = useCallback(
    (value: boolean) => {
      savePreferences({ sortByProbability: value });
    },
    [savePreferences]
  );

  const setTheme = useCallback(
    (theme: ThemeName) => {
      savePreferences({ theme });
    },
    [savePreferences]
  );

  const completeSetup = useCallback(() => {
    savePreferences({ hasCompletedSetup: true });
  }, [savePreferences]);

  const resetPreferences = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setPreferencesState(DEFAULT_PREFERENCES);
  }, []);

  return {
    preferences,
    mounted,
    setFocusTopics,
    toggleFocusTopic,
    setDefaultDifficulty,
    setSortByProbability,
    setTheme,
    completeSetup,
    resetPreferences,
  };
}
