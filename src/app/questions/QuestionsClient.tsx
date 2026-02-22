"use client";

import { ActionBar } from "@/components/ActionBar";
import { EmptyState } from "@/components/EmptyState";
import { FilterBar, type TopicEntry, type DifficultyEntry } from "@/components/FilterBar";
import { PageHeader } from "@/components/PageHeader";
import { QuestionCard } from "@/components/QuestionCard";
import { useQuestionStore } from "@/hooks/useQuestionStore";
import { usePreferences } from "@/hooks/usePreferences";
import { useTheme } from "@/hooks/useTheme";
import { trpc } from "@/lib/trpc";
import { BookOpen, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuestionsClient() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | undefined>();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>();
  const [sortByProbability, setSortByProbability] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const { preferences, mounted: prefsMounted } = usePreferences();
  const { mounted: themeMounted } = useTheme();

  useEffect(() => {
    if (prefsMounted && !preferences.hasCompletedSetup) {
      router.replace("/");
    }
  }, [prefsMounted, preferences.hasCompletedSetup, router]);

  useEffect(() => {
    if (prefsMounted && preferences.hasCompletedSetup) {
      if (preferences.defaultDifficulty) {
        setSelectedDifficulty(preferences.defaultDifficulty);
      }
      setSortByProbability(preferences.sortByProbability);
    }
  }, [prefsMounted, preferences.hasCompletedSetup, preferences.defaultDifficulty, preferences.sortByProbability]);

  const filter = useMemo(
    () => ({
      topic: selectedTopic,
      subtopic: selectedSubtopic,
      difficulty: selectedDifficulty,
      sortByProbability,
    }),
    [selectedTopic, selectedSubtopic, selectedDifficulty, sortByProbability],
  );

  const topicsQuery = trpc.questions.getTopics.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const difficultiesQuery = trpc.questions.getDifficulties.useQuery(
    { topic: selectedTopic, subtopic: selectedSubtopic },
    { staleTime: 5 * 60 * 1000 },
  );

  const filteredTopics = useMemo(() => {
    const data = topicsQuery.data;
    if (!Array.isArray(data)) return [];
    if (preferences.focusTopics.length === 0) return data;
    return data.filter((t) => preferences.focusTopics.includes(t.topic));
  }, [topicsQuery.data, preferences.focusTopics]);

  const {
    currentQuestion,
    currentIndex,
    totalAvailable,
    archivedCount,
    isFirst,
    isLast,
    isLoading,
    goNext,
    goPrev,
    archiveQuestion,
    skipQuestion,
    clearSkipped,
  } = useQuestionStore(filter);

  if (!prefsMounted || !themeMounted || !preferences.hasCompletedSetup) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto px-4">
      <PageHeader
        icon={<BookOpen className="h-5 w-5 text-primary" />}
        title="InterviewPrep"
        titleHref="/?edit=true"
        filters={
          <FilterBar
            topics={(filteredTopics as TopicEntry[])}
            difficulties={(Array.isArray(difficultiesQuery.data) ? difficultiesQuery.data : []) as DifficultyEntry[]}
            selectedTopic={selectedTopic}
            selectedSubtopic={selectedSubtopic}
            selectedDifficulty={selectedDifficulty}
            sortByProbability={sortByProbability}
            onTopicChange={(topic) => {
              setSelectedTopic(topic);
              setSelectedSubtopic(undefined);
            }}
            onSubtopicChange={(subtopic) => {
              setSelectedSubtopic(subtopic);
            }}
            onDifficultyChange={setSelectedDifficulty}
            onSortToggle={() => setSortByProbability((p) => !p)}
            focusTopics={preferences.focusTopics}
          />
        }
      />

      <main className="flex-1 min-h-0 flex flex-col bg-card rounded-2xl border border-border p-3 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading questions...
            </p>
          </div>
        ) : currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
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
          <EmptyState
            archivedCount={archivedCount}
            onClearSkipped={clearSkipped}
          />
        )}
      </main>

      {currentQuestion && (
        <ActionBar
          onPrev={() => {
            setDirection(-1);
            goPrev();
          }}
          onNext={() => {
            setDirection(1);
            goNext();
          }}
          onSkip={() => skipQuestion(currentQuestion.id)}
          onArchive={() => archiveQuestion(currentQuestion.id)}
          isFirst={isFirst}
          isLast={isLast}
          disabled={!currentQuestion}
        />
      )}

      <div className="h-12" />
    </div>
  );
}
