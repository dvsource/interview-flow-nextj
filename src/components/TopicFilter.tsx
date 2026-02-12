"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TopicEntry {
  topic: string;
  subtopic: string | null;
  count: number;
}

interface TopicFilterProps {
  topics: TopicEntry[];
  selectedTopic: string | undefined;
  selectedSubtopic: string | undefined;
  onTopicChange: (topic: string | undefined) => void;
  onSubtopicChange: (subtopic: string | undefined) => void;
}

export function TopicFilter({
  topics,
  selectedTopic,
  selectedSubtopic,
  onTopicChange,
  onSubtopicChange,
}: TopicFilterProps) {
  const safe = Array.isArray(topics) ? topics : [];

  const uniqueTopics = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of safe) {
      map.set(t.topic, (map.get(t.topic) || 0) + t.count);
    }
    return [...map.entries()]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => a.topic.localeCompare(b.topic));
  }, [safe]);

  const subtopics = useMemo(() => {
    if (!selectedTopic) return [];
    return safe
      .filter((t) => t.topic === selectedTopic && t.subtopic)
      .map((t) => ({ subtopic: t.subtopic!, count: t.count }))
      .sort((a, b) => a.subtopic.localeCompare(b.subtopic));
  }, [safe, selectedTopic]);

  if (safe.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedTopic ?? "__all__"}
        onValueChange={(v) => onTopicChange(v === "__all__" ? undefined : v)}
      >
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="All topics" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">
            All topics ({uniqueTopics.reduce((s, t) => s + t.count, 0)})
          </SelectItem>
          {uniqueTopics.map((t) => (
            <SelectItem key={t.topic} value={t.topic}>
              {t.topic} ({t.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {subtopics.length > 0 && (
        <Select
          value={selectedSubtopic ?? "__all__"}
          onValueChange={(v) =>
            onSubtopicChange(v === "__all__" ? undefined : v)
          }
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="All subtopics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All subtopics</SelectItem>
            {subtopics.map((s) => (
              <SelectItem key={s.subtopic} value={s.subtopic}>
                {s.subtopic} ({s.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
