"use client";

import { useEffect, useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useGuideStore } from "@/hooks/useGuideStore";
import { GuideCard } from "@/components/GuideCard";
import { ActionBar } from "@/components/ActionBar";
import { PageHeader } from "@/components/PageHeader";
import { GuideFilter, type GuideFilters } from "@/components/GuideFilter";
import { usePreferences } from "@/hooks/usePreferences";
import { useTheme } from "@/hooks/useTheme";
import { FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GuidesClient() {
  const router = useRouter();
  const [selectedTechStack, setSelectedTechStack] = useState<
    string | undefined
  >();
  const [direction, setDirection] = useState<1 | -1>(1);

  const { preferences, mounted: prefsMounted } = usePreferences();
  const { mounted: themeMounted } = useTheme();

  useEffect(() => {
    if (prefsMounted && !preferences.hasCompletedSetup) {
      router.replace("/");
    }
  }, [prefsMounted, preferences.hasCompletedSetup, router]);

  const filter = useMemo(
    () => (selectedTechStack ? { techStack: selectedTechStack } : undefined),
    [selectedTechStack],
  );

  const filtersQuery = trpc.guides.getFilters.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const {
    currentGuide,
    currentIndex,
    totalAvailable,
    isFirst,
    isLast,
    isLoading,
    goNext,
    goPrev,
  } = useGuideStore(filter);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d") {
        setDirection(1);
        goNext();
      }
      if (e.key === "ArrowLeft" || e.key === "a") {
        setDirection(-1);
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  if (!prefsMounted || !themeMounted || !preferences.hasCompletedSetup) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto px-4">
      <PageHeader
        icon={<FileText className="h-5 w-5 text-primary" />}
        title="Project Guides"
        filters={
          <GuideFilter
            filters={filtersQuery.data as GuideFilters | undefined}
            selectedTechStack={selectedTechStack}
            onTechStackChange={setSelectedTechStack}
          />
        }
      />

      <main className="flex-1 min-h-0 flex flex-col bg-card rounded-2xl border border-border p-3 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading guides...</p>
          </div>
        ) : currentGuide ? (
          <GuideCard
            guide={currentGuide}
            index={currentIndex}
            total={totalAvailable}
            direction={direction}
            onSwipeLeft={() => {
              setDirection(1);
              goNext();
            }}
            onSwipeRight={() => {
              setDirection(-1);
              goPrev();
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <FileText className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No guides found
            </h2>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </main>

      {currentGuide && (
        <ActionBar
          onPrev={() => {
            setDirection(-1);
            goPrev();
          }}
          onNext={() => {
            setDirection(1);
            goNext();
          }}
          isFirst={isFirst}
          isLast={isLast}
          disabled={!currentGuide}
        />
      )}

      <div className="h-12" />
    </div>
  );
}
