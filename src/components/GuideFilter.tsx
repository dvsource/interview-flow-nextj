"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface GuideFilters {
  techStacks: { techStack: string; count: number }[];
}

interface GuideFilterProps {
  filters: GuideFilters | undefined;
  selectedTechStack: string | undefined;
  onTechStackChange: (techStack: string | undefined) => void;
}

export function GuideFilter({
  filters,
  selectedTechStack,
  onTechStackChange,
}: GuideFilterProps) {
  const techStacks = filters?.techStacks ?? [];

  if (techStacks.length === 0) return null;

  return (
    <Select
      value={selectedTechStack ?? "__all__"}
      onValueChange={(v) => onTechStackChange(v === "__all__" ? undefined : v)}
    >
      <SelectTrigger className="h-8 w-[160px] text-xs">
        <SelectValue placeholder="Tech Stack" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All stacks</SelectItem>
        {techStacks.map((t) => (
          <SelectItem key={t.techStack} value={t.techStack}>
            {t.techStack} ({t.count})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
