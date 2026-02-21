"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Interview } from "@/types/interview";
import { trpc } from "@/lib/trpc";

const SEED_KEY = "interviews-seed";

function getSessionSeed(): number {
  try {
    const stored = sessionStorage.getItem(SEED_KEY);
    if (stored) return Number(stored);
  } catch {}
  const seed = Math.floor(Math.random() * 2147483647);
  try {
    sessionStorage.setItem(SEED_KEY, String(seed));
  } catch {}
  return seed;
}

export function useInterviewStore(
  filter: { position?: string; technology?: string } | undefined,
) {
  const [seed] = useState(() => getSessionSeed());
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedInterviews, setLoadedInterviews] = useState<Interview[]>([]);
  const [globalIndex, setGlobalIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadedPagesRef = useRef<Set<number>>(new Set());
  const filterRef = useRef(filter);

  const utils = trpc.useUtils();

  useEffect(() => {
    const prev = filterRef.current;
    const positionChanged = prev?.position !== filter?.position;
    const technologyChanged = prev?.technology !== filter?.technology;
    filterRef.current = filter;

    if (positionChanged || technologyChanged) {
      loadedPagesRef.current = new Set();
      setLoadedInterviews([]);
      setGlobalIndex(0);
      setCurrentPage(0);
      setTotalCount(0);
      setHasMore(true);
    }
  }, [filter?.position, filter?.technology]);

  const pageQuery = trpc.interviews.getPaginated.useQuery(
    {
      seed,
      page: currentPage,
      pageSize: 10,
      position: filter?.position,
      technology: filter?.technology,
    },
    {
      staleTime: 5 * 60 * 1000,
      enabled: !loadedPagesRef.current.has(currentPage),
    },
  );

  useEffect(() => {
    const data = pageQuery.data;
    if (!data || !Array.isArray(data.interviews)) return;
    if (loadedPagesRef.current.has(data.page)) return;

    loadedPagesRef.current.add(data.page);
    setLoadedInterviews((prev) => [
      ...prev,
      ...(data.interviews as Interview[]),
    ]);
    setTotalCount(data.totalCount);
    setHasMore(data.hasMore);
  }, [pageQuery.data]);

  const currentInterview = loadedInterviews[globalIndex] ?? null;

  useEffect(() => {
    if (!hasMore) return;
    const remaining = loadedInterviews.length - globalIndex - 1;
    if (remaining <= 3) {
      const nextPage = currentPage + 1;
      if (!loadedPagesRef.current.has(nextPage)) {
        utils.interviews.getPaginated.prefetch({
          seed,
          page: nextPage,
          pageSize: 10,
          position: filter?.position,
          technology: filter?.technology,
        });
      }
    }
  }, [
    globalIndex,
    loadedInterviews.length,
    hasMore,
    currentPage,
    seed,
    filter,
    utils,
  ]);

  useEffect(() => {
    if (!hasMore) return;
    if (loadedInterviews.length === 0) return;
    if (globalIndex >= loadedInterviews.length - 1) {
      const nextPage = currentPage + 1;
      if (!loadedPagesRef.current.has(nextPage)) {
        setCurrentPage(nextPage);
      }
    }
  }, [globalIndex, loadedInterviews.length, hasMore, currentPage]);

  const goNext = useCallback(() => {
    setGlobalIndex((i) => Math.min(i + 1, loadedInterviews.length - 1));
  }, [loadedInterviews.length]);

  const goPrev = useCallback(() => {
    setGlobalIndex((i) => Math.max(i - 1, 0));
  }, []);

  const isFirst = globalIndex === 0;
  const isLast = globalIndex >= loadedInterviews.length - 1 && !hasMore;
  const isLoading = pageQuery.isLoading && loadedInterviews.length === 0;

  return {
    currentInterview,
    currentIndex: globalIndex,
    totalAvailable: totalCount,
    isFirst,
    isLast,
    isLoading,
    goNext,
    goPrev,
  };
}
