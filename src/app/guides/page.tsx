"use client";

import { useEffect, useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useGuideStore } from "@/hooks/useGuideStore";
import { GuideCard } from "@/components/GuideCard";
import { ActionBar } from "@/components/ActionBar";
import { GuideFilter, type GuideFilters } from "@/components/GuideFilter";
import { FileText, Loader2 } from "lucide-react";

export default function GuidesPage() {
  const [selectedTechStack, setSelectedTechStack] = useState<
    string | undefined
  >();
  const [direction, setDirection] = useState<1 | -1>(1);

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

  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto px-4">
      {/* Top bar */}
      <header className="flex items-center gap-2 pt-4 pb-3">
        <FileText className="h-5 w-5 text-primary" />
        <h1 className="text-base font-semibold text-foreground tracking-tight">
          Project Guides
        </h1>
        <div className="ml-auto">
          <GuideFilter
            filters={filtersQuery.data as GuideFilters | undefined}
            selectedTechStack={selectedTechStack}
            onTechStackChange={setSelectedTechStack}
          />
        </div>
      </header>

      {/* Main card area */}
      <main className="flex-1 min-h-0 flex flex-col bg-card rounded-2xl border border-border p-3 pb-24 shadow-sm">
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

      {/* Bottom navigation */}
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

      {/* Safe area spacing */}
      <div className="h-16" />
    </div>
  );
}
