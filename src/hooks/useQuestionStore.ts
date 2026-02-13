"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Question } from "@/types/question";
import { trpc } from "@/lib/trpc";

const ARCHIVED_KEY = "interview-archived";
const SKIPPED_KEY = "interview-skipped";
const SEED_KEY = "interview-seed";

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

function getSessionSeed(): number {
  try {
    const stored = sessionStorage.getItem(SEED_KEY);
    if (stored) return Number(stored);
  } catch {
    // SSR or sessionStorage unavailable
  }
  const seed = Math.floor(Math.random() * 2147483647);
  try {
    sessionStorage.setItem(SEED_KEY, String(seed));
  } catch {
    // ignore
  }
  return seed;
}

export function useQuestionStore(
  filter: { topic?: string; subtopic?: string } | undefined
) {
  const [seed] = useState(() => getSessionSeed());
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedQuestions, setLoadedQuestions] = useState<Question[]>([]);
  const [globalIndex, setGlobalIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [archived, setArchived] = useState<Set<string>>(() => loadSet(ARCHIVED_KEY));
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  const loadedPagesRef = useRef<Set<number>>(new Set());
  const dbSyncedRef = useRef(false);
  const filterRef = useRef(filter);

  // tRPC mutations
  const setActionMut = trpc.questions.setAction.useMutation();
  const removeActionMut = trpc.questions.removeAction.useMutation();
  const actionsQuery = trpc.questions.getActions.useQuery();

  // tRPC utils for prefetching
  const utils = trpc.useUtils();

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

  // Reset all pagination state when filter changes
  useEffect(() => {
    const prev = filterRef.current;
    const topicChanged = prev?.topic !== filter?.topic;
    const subtopicChanged = prev?.subtopic !== filter?.subtopic;
    filterRef.current = filter;

    if (topicChanged || subtopicChanged) {
      loadedPagesRef.current = new Set();
      setLoadedQuestions([]);
      setGlobalIndex(0);
      setCurrentPage(0);
      setTotalCount(0);
      setHasMore(true);
    }
  }, [filter?.topic, filter?.subtopic]);

  // Fetch current page
  const pageQuery = trpc.questions.getPaginated.useQuery(
    {
      seed,
      page: currentPage,
      pageSize: 10,
      topic: filter?.topic,
      subtopic: filter?.subtopic,
    },
    {
      staleTime: 5 * 60 * 1000,
      enabled: !loadedPagesRef.current.has(currentPage),
    }
  );

  // Append new page data when it arrives
  useEffect(() => {
    const data = pageQuery.data;
    if (!data || !Array.isArray(data.questions)) return;
    if (loadedPagesRef.current.has(data.page)) return;

    loadedPagesRef.current.add(data.page);
    setLoadedQuestions((prev) => [...prev, ...(data.questions as Question[])]);
    setTotalCount(data.totalCount);
    setHasMore(data.hasMore);
  }, [pageQuery.data]);

  // Visible questions: filter out archived and skipped
  const visibleQuestions = useMemo(
    () =>
      loadedQuestions.filter(
        (q) => !archived.has(String(q.id)) && !skipped.has(String(q.id))
      ),
    [loadedQuestions, archived, skipped]
  );

  const currentQuestion = visibleQuestions[globalIndex] ?? null;
  const displayTotal = Math.max(0, totalCount - archived.size);

  // Prefetch next page when user is near the end of loaded questions
  useEffect(() => {
    if (!hasMore) return;
    const remainingVisible = visibleQuestions.length - globalIndex - 1;
    if (remainingVisible <= 3) {
      const nextPage = currentPage + 1;
      if (!loadedPagesRef.current.has(nextPage)) {
        utils.questions.getPaginated.prefetch({
          seed,
          page: nextPage,
          pageSize: 10,
          topic: filter?.topic,
          subtopic: filter?.subtopic,
        });
      }
    }
  }, [globalIndex, visibleQuestions.length, hasMore, currentPage, seed, filter, utils]);

  // Auto-advance to next page when user reaches the end of loaded visible questions
  useEffect(() => {
    if (!hasMore) return;
    if (visibleQuestions.length === 0) return;
    if (globalIndex >= visibleQuestions.length - 1) {
      const nextPage = currentPage + 1;
      if (!loadedPagesRef.current.has(nextPage)) {
        setCurrentPage(nextPage);
      }
    }
  }, [globalIndex, visibleQuestions.length, hasMore, currentPage]);

  const goNext = useCallback(() => {
    setGlobalIndex((i) => {
      const maxIdx = visibleQuestions.length - 1;
      return Math.min(i + 1, maxIdx);
    });
  }, [visibleQuestions.length]);

  const goPrev = useCallback(() => {
    setGlobalIndex((i) => Math.max(i - 1, 0));
  }, []);

  const archiveQuestion = useCallback(
    (id: number) => {
      const sid = String(id);
      setArchived((prev) => {
        const next = new Set(prev);
        next.add(sid);
        saveSet(ARCHIVED_KEY, next);
        return next;
      });
      // Adjust globalIndex if the archived question is before or at current position
      setGlobalIndex((i) => {
        const idx = visibleQuestions.findIndex((q) => q.id === id);
        if (idx !== -1 && idx < i) return Math.max(0, i - 1);
        // If archiving the current question and it's the last visible, step back
        if (idx === i && i >= visibleQuestions.length - 1) return Math.max(0, i - 1);
        return i;
      });
      setActionMut.mutate({ questionId: id, action: "archive" });
    },
    [setActionMut, visibleQuestions]
  );

  const skipQuestion = useCallback(
    (id: number) => {
      const sid = String(id);
      setSkipped((prev) => {
        const next = new Set(prev);
        next.add(sid);
        saveSet(SKIPPED_KEY, next);
        return next;
      });
      // Adjust globalIndex similarly to archive
      setGlobalIndex((i) => {
        const idx = visibleQuestions.findIndex((q) => q.id === id);
        if (idx !== -1 && idx < i) return Math.max(0, i - 1);
        if (idx === i && i >= visibleQuestions.length - 1) return Math.max(0, i - 1);
        return i;
      });
      setActionMut.mutate({ questionId: id, action: "skip" });
    },
    [setActionMut, visibleQuestions]
  );

  const clearSkipped = useCallback(() => {
    localStorage.removeItem(SKIPPED_KEY);
    setSkipped(new Set());
    // Reset pagination — skipped questions re-enter the pool from server
    loadedPagesRef.current = new Set();
    setLoadedQuestions([]);
    setGlobalIndex(0);
    setCurrentPage(0);
    setTotalCount(0);
    setHasMore(true);
    removeActionMut.mutate({ questionId: null, action: "skip" });
  }, [removeActionMut]);

  const isFirst = globalIndex === 0;
  const isLast = globalIndex >= visibleQuestions.length - 1 && !hasMore;
  const isLoading = pageQuery.isLoading && loadedQuestions.length === 0;
  const archivedCount = archived.size;

  return {
    currentQuestion,
    currentIndex: globalIndex,
    totalAvailable: displayTotal,
    archivedCount,
    isFirst,
    isLast,
    isLoading,
    goNext,
    goPrev,
    archiveQuestion,
    skipQuestion,
    clearSkipped,
  };
}
