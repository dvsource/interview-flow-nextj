"use client";

import { useEffect, useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useInterviewStore } from "@/hooks/useInterviewStore";
import { InterviewCard } from "@/components/InterviewCard";
import { ActionBar } from "@/components/ActionBar";
import {
  InterviewFilter,
  type InterviewFilters,
} from "@/components/InterviewFilter";
import { MessageSquare, Loader2 } from "lucide-react";

export default function InterviewsPage() {
  const [selectedPosition, setSelectedPosition] = useState<
    string | undefined
  >();
  const [selectedTechnology, setSelectedTechnology] = useState<
    string | undefined
  >();
  const [direction, setDirection] = useState<1 | -1>(1);

  const filter = useMemo(
    () =>
      selectedPosition || selectedTechnology
        ? { position: selectedPosition, technology: selectedTechnology }
        : undefined,
    [selectedPosition, selectedTechnology],
  );

  const filtersQuery = trpc.interviews.getFilters.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const {
    currentInterview,
    currentIndex,
    totalAvailable,
    isFirst,
    isLast,
    isLoading,
    goNext,
    goPrev,
  } = useInterviewStore(filter);

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
        <MessageSquare className="h-5 w-5 text-primary" />
        <h1 className="text-base font-semibold text-foreground tracking-tight">
          Mock Interviews
        </h1>
        <div className="ml-auto">
          <InterviewFilter
            filters={filtersQuery.data as InterviewFilters | undefined}
            selectedPosition={selectedPosition}
            selectedTechnology={selectedTechnology}
            onPositionChange={(pos) => {
              setSelectedPosition(pos);
            }}
            onTechnologyChange={setSelectedTechnology}
          />
        </div>
      </header>

      {/* Main card area */}
      <main className="flex-1 min-h-0 flex flex-col bg-card rounded-2xl border border-border p-3 pb-24 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading interviews...
            </p>
          </div>
        ) : currentInterview ? (
          <InterviewCard
            interview={currentInterview}
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
            <MessageSquare className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No interviews found
            </h2>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      {currentInterview && (
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
          disabled={!currentInterview}
        />
      )}

      {/* Safe area spacing */}
      <div className="h-16" />
    </div>
  );
}
