"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TopicEntry {
  topic: string;
  subtopic: string | null;
  count: number;
}

export interface DifficultyEntry {
  difficulty: string;
  count: number;
}

interface FilterBarProps {
  topics: TopicEntry[];
  difficulties: DifficultyEntry[];
  selectedTopic: string | undefined;
  selectedSubtopic: string | undefined;
  selectedDifficulty: string | undefined;
  sortByProbability: boolean;
  onTopicChange: (topic: string | undefined) => void;
  onSubtopicChange: (subtopic: string | undefined) => void;
  onDifficultyChange: (difficulty: string | undefined) => void;
  onSortToggle: () => void;
  focusTopics?: string[];
}

export function FilterBar({
  topics,
  difficulties,
  selectedTopic,
  selectedSubtopic,
  selectedDifficulty,
  sortByProbability,
  onTopicChange,
  onSubtopicChange,
  onDifficultyChange,
  onSortToggle,
  focusTopics = [],
}: FilterBarProps) {
  const safe = Array.isArray(topics) ? topics : [];
  const safeDifficulties = Array.isArray(difficulties) ? difficulties : [];

  const uniqueTopics = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of safe) {
      map.set(t.topic, (map.get(t.topic) || 0) + t.count);
    }
    let entries = [...map.entries()]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => a.topic.localeCompare(b.topic));
    
    if (focusTopics.length > 0) {
      entries = entries.filter((e) => focusTopics.includes(e.topic));
    }
    
    return entries;
  }, [safe, focusTopics]);

  const subtopics = useMemo(() => {
    if (!selectedTopic) return [];
    const filtered = safe
      .filter((t) => t.topic === selectedTopic && t.subtopic)
      .map((t) => ({ subtopic: t.subtopic!, count: t.count }))
      .sort((a, b) => a.subtopic.localeCompare(b.subtopic));
    return filtered;
  }, [safe, selectedTopic]);

  const subtopicTotal = useMemo(() => {
    return subtopics.reduce((s, t) => s + t.count, 0);
  }, [subtopics]);

  if (safe.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {uniqueTopics.length > 1 && (
        <Select
          value={selectedTopic ?? "__all__"}
          onValueChange={(v) => onTopicChange(v === "__all__" ? undefined : v)}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">
              All ({uniqueTopics.reduce((s, t) => s + t.count, 0)})
            </SelectItem>
            {uniqueTopics.map((t) => (
              <SelectItem key={t.topic} value={t.topic}>
                {t.topic} ({t.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {subtopics.length > 0 && (
        <Select
          value={selectedSubtopic ?? "__all__"}
          onValueChange={(v) =>
            onSubtopicChange(v === "__all__" ? undefined : v)
          }
        >
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Subtopic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All ({subtopicTotal})</SelectItem>
            {subtopics.map((s) => (
              <SelectItem key={s.subtopic} value={s.subtopic}>
                {s.subtopic} ({s.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {safeDifficulties.length > 0 && (
        <Select
          value={selectedDifficulty ?? "__all__"}
          onValueChange={(v) =>
            onDifficultyChange(v === "__all__" ? undefined : v)
          }
        >
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">
              All ({safeDifficulties.reduce((s, d) => s + d.count, 0)})
            </SelectItem>
            {safeDifficulties.map((d) => (
              <SelectItem key={d.difficulty} value={d.difficulty}>
                {d.difficulty} ({d.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={sortByProbability ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onSortToggle}
            >
              {sortByProbability ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {sortByProbability
                ? "Sorted by probability (5→1)"
                : "Sort by interview probability"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
