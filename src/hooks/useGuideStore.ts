"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Guide } from "@/types/guide";
import { trpc } from "@/lib/trpc";

const SEED_KEY = "guides-seed";

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

export function useGuideStore(filter: { techStack?: string } | undefined) {
  const [seed] = useState(() => getSessionSeed());
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedGuides, setLoadedGuides] = useState<Guide[]>([]);
  const [globalIndex, setGlobalIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadedPagesRef = useRef<Set<number>>(new Set());
  const filterRef = useRef(filter);

  const utils = trpc.useUtils();

  useEffect(() => {
    const prev = filterRef.current;
    const techStackChanged = prev?.techStack !== filter?.techStack;
    filterRef.current = filter;

    if (techStackChanged) {
      loadedPagesRef.current = new Set();
      setLoadedGuides([]);
      setGlobalIndex(0);
      setCurrentPage(0);
      setTotalCount(0);
      setHasMore(true);
    }
  }, [filter?.techStack]);

  const pageQuery = trpc.guides.getPaginated.useQuery(
    {
      seed,
      page: currentPage,
      pageSize: 10,
      techStack: filter?.techStack,
    },
    {
      staleTime: 5 * 60 * 1000,
      enabled: !loadedPagesRef.current.has(currentPage),
    }
  );

  useEffect(() => {
    const data = pageQuery.data;
    if (!data || !Array.isArray(data.guides)) return;
    if (loadedPagesRef.current.has(data.page)) return;

    loadedPagesRef.current.add(data.page);
    setLoadedGuides((prev) => [...prev, ...(data.guides as Guide[])]);
    setTotalCount(data.totalCount);
    setHasMore(data.hasMore);
  }, [pageQuery.data]);

  const currentGuide = loadedGuides[globalIndex] ?? null;

  useEffect(() => {
    if (!hasMore) return;
    const remaining = loadedGuides.length - globalIndex - 1;
    if (remaining <= 3) {
      const nextPage = currentPage + 1;
      if (!loadedPagesRef.current.has(nextPage)) {
        utils.guides.getPaginated.prefetch({
          seed,
          page: nextPage,
          pageSize: 10,
          techStack: filter?.techStack,
        });
      }
    }
  }, [globalIndex, loadedGuides.length, hasMore, currentPage, seed, filter, utils]);

  useEffect(() => {
    if (!hasMore) return;
    if (loadedGuides.length === 0) return;
    if (globalIndex >= loadedGuides.length - 1) {
      const nextPage = currentPage + 1;
      if (!loadedPagesRef.current.has(nextPage)) {
        setCurrentPage(nextPage);
      }
    }
  }, [globalIndex, loadedGuides.length, hasMore, currentPage]);

  const goNext = useCallback(() => {
    setGlobalIndex((i) => Math.min(i + 1, loadedGuides.length - 1));
  }, [loadedGuides.length]);

  const goPrev = useCallback(() => {
    setGlobalIndex((i) => Math.max(i - 1, 0));
  }, []);

  const isFirst = globalIndex === 0;
  const isLast = globalIndex >= loadedGuides.length - 1 && !hasMore;
  const isLoading = pageQuery.isLoading && loadedGuides.length === 0;

  return {
    currentGuide,
    currentIndex: globalIndex,
    totalAvailable: totalCount,
    isFirst,
    isLast,
    isLoading,
    goNext,
    goPrev,
  };
}
