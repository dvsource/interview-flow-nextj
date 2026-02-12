"use client";

import { useState, useCallback, useEffect } from "react";
import { Question } from "@/types/question";

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
  const [skipped, setSkipped] = useState<Set<string>>(() => loadSet(SKIPPED_KEY));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<Question[]>([]);

  // Filter and shuffle available questions
  useEffect(() => {
    const available = allQuestions.filter(
      (q) => !archived.has(q.id) && !skipped.has(q.id)
    );
    setHistory(shuffle(available));
    setCurrentIndex(0);
  }, [allQuestions, archived]); // intentionally not depending on skipped to keep session stable

  const currentQuestion = history[currentIndex] ?? null;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, history.length - 1));
  }, [history.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const archiveQuestion = useCallback((id: string) => {
    setArchived((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(ARCHIVED_KEY, next);
      return next;
    });
  }, []);

  const skipQuestion = useCallback((id: string) => {
    setSkipped((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(SKIPPED_KEY, next);
      return next;
    });
    // Also move to next
    setHistory((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const clearSkipped = useCallback(() => {
    localStorage.removeItem(SKIPPED_KEY);
    setSkipped(new Set());
  }, []);

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
