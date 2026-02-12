"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Question } from "@/types/question";
import { trpc } from "@/lib/trpc";

const ARCHIVED_KEY = "interview-archived";
const SKIPPED_KEY = "interview-skipped";

function loadSet(key: string): Set<string> {
  try {
    const data = localStorage.getItem(key);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function useQuestionStore(allQuestions: Question[]) {
  const [archived, setArchived] = useState<Set<string>>(() => loadSet(ARCHIVED_KEY));
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<Question[]>([]);

  // Track the set of IDs we've already shuffled to avoid re-shuffle on refetch
  const shuffledIdsRef = useRef<string | null>(null);
  const dbSyncedRef = useRef(false);

  // tRPC queries & mutations
  const actionsQuery = trpc.questions.getActions.useQuery();
  const setActionMut = trpc.questions.setAction.useMutation();
  const removeActionMut = trpc.questions.removeAction.useMutation();

  // DB sync on mount — merge DB archive rows into localStorage, clear skipped
  useEffect(() => {
    if (dbSyncedRef.current) return;
    const data = actionsQuery.data;
    if (!Array.isArray(data)) return;

    dbSyncedRef.current = true;

    // Clear skipped on load — skipped questions reappear after refresh
    localStorage.removeItem(SKIPPED_KEY);
    setSkipped(new Set());

    // Merge DB archive rows with localStorage archived set
    const dbArchived = data
      .filter((row) => row.action === "archive")
      .map((row) => String(row.questionId));

    if (dbArchived.length > 0) {
      setArchived((prev) => {
        const merged = new Set(prev);
        for (const id of dbArchived) merged.add(id);
        saveSet(ARCHIVED_KEY, merged);
        return merged;
      });
    }
  }, [actionsQuery.data]);

  // Filter and shuffle available questions — stabilized by ID set
  useEffect(() => {
    const available = allQuestions.filter(
      (q) => !archived.has(String(q.id)) && !skipped.has(String(q.id))
    );

    // Build a stable key from sorted IDs to detect actual data changes
    const idKey = available
      .map((q) => q.id)
      .sort((a, b) => a - b)
      .join(",");

    if (idKey !== shuffledIdsRef.current) {
      shuffledIdsRef.current = idKey;
      setHistory(shuffle(available));
      setCurrentIndex(0);
    }
  }, [allQuestions, archived]); // intentionally not depending on skipped to keep session stable

  const currentQuestion = history[currentIndex] ?? null;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, history.length - 1));
  }, [history.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const archiveQuestion = useCallback((id: number) => {
    const sid = String(id);
    setArchived((prev) => {
      const next = new Set(prev);
      next.add(sid);
      saveSet(ARCHIVED_KEY, next);
      return next;
    });
    // Fire-and-forget DB mutation
    setActionMut.mutate({ questionId: id, action: "archive" });
  }, [setActionMut]);

  const skipQuestion = useCallback((id: number) => {
    const sid = String(id);
    setSkipped((prev) => {
      const next = new Set(prev);
      next.add(sid);
      saveSet(SKIPPED_KEY, next);
      return next;
    });
    // Also move to next
    setHistory((prev) => prev.filter((q) => String(q.id) !== sid));
    // Fire-and-forget DB mutation (historical record)
    setActionMut.mutate({ questionId: id, action: "skip" });
  }, [setActionMut]);

  const clearSkipped = useCallback(() => {
    localStorage.removeItem(SKIPPED_KEY);
    setSkipped(new Set());
    // Reset shuffled tracking so next effect re-shuffles with skipped restored
    shuffledIdsRef.current = null;
    // Fire-and-forget bulk delete of skip rows
    removeActionMut.mutate({ questionId: null, action: "skip" });
  }, [removeActionMut]);

  const archivedCount = archived.size;
  const totalAvailable = history.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= history.length - 1;

  return {
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
  };
}
