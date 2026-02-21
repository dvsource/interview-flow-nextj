"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface InterviewFilters {
  positions: { position: string; count: number }[];
  technologies: { technology: string; count: number }[];
}

interface InterviewFilterProps {
  filters: InterviewFilters | undefined;
  selectedPosition: string | undefined;
  selectedTechnology: string | undefined;
  onPositionChange: (position: string | undefined) => void;
  onTechnologyChange: (technology: string | undefined) => void;
}

export function InterviewFilter({
  filters,
  selectedPosition,
  selectedTechnology,
  onPositionChange,
  onTechnologyChange,
}: InterviewFilterProps) {
  const positions = filters?.positions ?? [];
  const technologies = filters?.technologies ?? [];

  const filteredTechnologies = useMemo(() => {
    return technologies.slice(0, 15);
  }, [technologies]);

  if (positions.length === 0 && technologies.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {positions.length > 0 && (
        <Select
          value={selectedPosition ?? "__all__"}
          onValueChange={(v) =>
            onPositionChange(v === "__all__" ? undefined : v)
          }
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All positions</SelectItem>
            {positions.map((p) => (
              <SelectItem key={p.position} value={p.position}>
                {p.position} ({p.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {filteredTechnologies.length > 0 && (
        <Select
          value={selectedTechnology ?? "__all__"}
          onValueChange={(v) =>
            onTechnologyChange(v === "__all__" ? undefined : v)
          }
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Tech" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All tech</SelectItem>
            {filteredTechnologies.map((t) => (
              <SelectItem key={t.technology} value={t.technology}>
                {t.technology} ({t.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
