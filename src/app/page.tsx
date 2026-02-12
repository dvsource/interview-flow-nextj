"use client";

import { useEffect, useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { Question } from "@/types/question";
import { useQuestionStore } from "@/hooks/useQuestionStore";
import { QuestionCard } from "@/components/QuestionCard";
import { ActionBar } from "@/components/ActionBar";
import { EmptyState } from "@/components/EmptyState";
import { TopicFilter, type TopicEntry } from "@/components/TopicFilter";
import { BookOpen, Loader2 } from "lucide-react";

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | undefined>();
  const [direction, setDirection] = useState<1 | -1>(1);

  const filter = useMemo(
    () =>
      selectedTopic
        ? { topic: selectedTopic, subtopic: selectedSubtopic }
        : undefined,
    [selectedTopic, selectedSubtopic]
  );

  const questionsQuery = trpc.questions.getAll.useQuery(filter, {
    staleTime: 5 * 60 * 1000,
  });

  const topicsQuery = trpc.questions.getTopics.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // tRPC v11 may return non-array data shapes — guard with Array.isArray
  const questions = (Array.isArray(questionsQuery.data) ? questionsQuery.data : []) as Question[];

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
  } = useQuestionStore(questions);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d") { setDirection(1); goNext(); }
      if (e.key === "ArrowLeft" || e.key === "a") { setDirection(-1); goPrev(); }
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
        <div className="ml-auto">
          <TopicFilter
            topics={(Array.isArray(topicsQuery.data) ? topicsQuery.data : []) as TopicEntry[]}
            selectedTopic={selectedTopic}
            selectedSubtopic={selectedSubtopic}
            onTopicChange={(topic) => {
              setSelectedTopic(topic);
              setSelectedSubtopic(undefined);
            }}
            onSubtopicChange={setSelectedSubtopic}
          />
        </div>
      </header>

      {/* Main card area */}
      <main className="flex-1 min-h-0 flex flex-col bg-card rounded-2xl border border-border p-5 shadow-sm">
        {questionsQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading questions...</p>
          </div>
        ) : questionsQuery.isError ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <p className="text-sm text-destructive font-medium">
              Failed to load questions
            </p>
            <p className="text-xs text-muted-foreground">
              {questionsQuery.error.message}
            </p>
          </div>
        ) : currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            total={totalAvailable}
            direction={direction}
            onSwipeLeft={() => { setDirection(1); goNext(); }}
            onSwipeRight={() => { setDirection(-1); goPrev(); }}
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
          onPrev={() => { setDirection(-1); goPrev(); }}
          onNext={() => { setDirection(1); goNext(); }}
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
