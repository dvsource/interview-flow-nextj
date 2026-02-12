"use client";

import { useEffect } from "react";
import { mockQuestions } from "@/data/mock-questions";
import { useQuestionStore } from "@/hooks/useQuestionStore";
import { QuestionCard } from "@/components/QuestionCard";
import { ActionBar } from "@/components/ActionBar";
import { EmptyState } from "@/components/EmptyState";
import { BookOpen } from "lucide-react";

export default function Home() {
  const {
    currentQuestion,
    currentIndex,
    totalAvailable,
    archivedCount,
    isFirst,
    isLast,
    goNext,
    goPrev,
    archiveQuestion,
    skipQuestion,
    clearSkipped,
  } = useQuestionStore(mockQuestions);

  // Enable dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d") goNext();
      if (e.key === "ArrowLeft" || e.key === "a") goPrev();
      if (e.key === "s" && currentQuestion) skipQuestion(currentQuestion.id);
      if (e.key === "x" && currentQuestion) archiveQuestion(currentQuestion.id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, skipQuestion, archiveQuestion, currentQuestion]);

  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto px-4">
      {/* Top bar */}
      <header className="flex items-center gap-2 pt-4 pb-3">
        <BookOpen className="h-5 w-5 text-primary" />
        <h1 className="text-base font-semibold text-foreground tracking-tight">
          InterviewPrep
        </h1>
      </header>

      {/* Main card area */}
      <main className="flex-1 min-h-0 flex flex-col bg-card rounded-2xl border border-border p-5 shadow-sm">
        {currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            total={totalAvailable}
          />
        ) : (
          <EmptyState
            archivedCount={archivedCount}
            onClearSkipped={clearSkipped}
          />
        )}
      </main>

      {/* Bottom actions */}
      {currentQuestion && (
        <ActionBar
          onPrev={goPrev}
          onNext={goNext}
          onSkip={() => skipQuestion(currentQuestion.id)}
          onArchive={() => archiveQuestion(currentQuestion.id)}
          isFirst={isFirst}
          isLast={isLast}
          disabled={!currentQuestion}
        />
      )}

      {/* Safe area spacing */}
      <div className="h-2" />
    </div>
  );
}
