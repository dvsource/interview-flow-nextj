"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopicChips } from "@/components/TopicChips";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePreferences } from "@/hooks/usePreferences";
import { useTheme, THEMES } from "@/hooks/useTheme";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ArrowDown, ArrowUpDown, Loader2, Settings } from "lucide-react";

export default function HomeSetupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const {
    preferences,
    mounted: prefsMounted,
    toggleFocusTopic,
    setDefaultDifficulty,
    setSortByProbability,
    completeSetup,
  } = usePreferences();
  const { setTheme, theme, mounted: themeMounted } = useTheme();

  const topicsQuery = trpc.questions.getTopics.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const uniqueTopics = useMemo(() => {
    const data = topicsQuery.data;
    if (!Array.isArray(data)) return [];
    const map = new Map<string, number>();
    for (const t of data) {
      map.set(t.topic, (map.get(t.topic) || 0) + t.count);
    }
    return [...map.entries()]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => a.topic.localeCompare(b.topic));
  }, [topicsQuery.data]);

  useEffect(() => {
    if (prefsMounted && preferences.hasCompletedSetup && !isEditMode) {
      router.replace("/questions");
    }
  }, [prefsMounted, preferences.hasCompletedSetup, isEditMode, router]);

  if (!prefsMounted || !themeMounted || (preferences.hasCompletedSetup && !isEditMode)) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = () => {
    if (preferences.focusTopics.length === 0) {
      alert("Please select at least one topic to focus on.");
      return;
    }
    if (!preferences.hasCompletedSetup) {
      completeSetup();
    }
    router.push("/questions");
  };

  const handleBack = () => {
    router.push("/questions");
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto px-4">
      <header className="flex items-center gap-2 pt-4 pb-3">
        <Settings className="h-5 w-5 text-primary" />
        <h1 className="text-base font-semibold text-foreground tracking-tight">
          {isEditMode ? "Edit Preferences" : "Setup Your Preferences"}
        </h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto space-y-6 pb-16">
        <section>
          <h2 className="text-sm font-medium text-foreground mb-2">
            Select Focus Topics
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Choose the topics you want to focus on. Only these will appear in your question filters.
          </p>
          {topicsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading topics...
            </div>
          ) : (
            <TopicChips
              topics={uniqueTopics}
              selectedTopics={preferences.focusTopics}
              onToggle={toggleFocusTopic}
            />
          )}
        </section>

        <section>
          <h2 className="text-sm font-medium text-foreground mb-2">
            Default Difficulty
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Set your preferred difficulty level. You can still change this in the filter.
          </p>
          <Select
            value={preferences.defaultDifficulty ?? "__all__"}
            onValueChange={(v) =>
              setDefaultDifficulty(v === "__all__" ? null : v)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Difficulties</SelectItem>
              <SelectItem value="Basic">Basic</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Extreme">Extreme</SelectItem>
            </SelectContent>
          </Select>
        </section>

        <section>
          <h2 className="text-sm font-medium text-foreground mb-2">
            Sort by Interview Probability
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Enable to prioritize questions most likely to appear in interviews.
          </p>
          <Toggle
            pressed={preferences.sortByProbability}
            onPressedChange={setSortByProbability}
            className="gap-2"
            aria-label="Toggle probability sort"
          >
            {preferences.sortByProbability ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4" />
            )}
            {preferences.sortByProbability ? "Enabled" : "Disabled"}
          </Toggle>
        </section>

        <section>
          <h2 className="text-sm font-medium text-foreground mb-2">
            Theme
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Choose your preferred color theme.
          </p>
          <div className="flex gap-2">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  theme === t.name
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-12 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-lg mx-auto flex gap-2">
          {isEditMode && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleBack}
            >
              Cancel
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={preferences.focusTopics.length === 0}
          >
            {isEditMode ? "Save Changes" : "Save & Start Practicing"}
          </Button>
        </div>
      </div>
    </div>
  );
}
