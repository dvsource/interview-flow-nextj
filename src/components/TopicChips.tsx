"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TopicChipsProps {
  topics: { topic: string; count: number }[];
  selectedTopics: string[];
  onToggle: (topic: string) => void;
}

export function TopicChips({ topics, selectedTopics, onToggle }: TopicChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map(({ topic, count }) => {
        const isSelected = selectedTopics.includes(topic);
        return (
          <button
            key={topic}
            onClick={() => onToggle(topic)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              "border",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
            )}
          >
            {isSelected && <Check className="h-3 w-3" />}
            {topic}
            <span className={cn("text-xs", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
