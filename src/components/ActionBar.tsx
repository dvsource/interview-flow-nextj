"use client";

import { ChevronLeft, ChevronRight, SkipForward, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onArchive: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
}

export function ActionBar({
  onPrev,
  onNext,
  onSkip,
  onArchive,
  isFirst,
  isLast,
  disabled,
}: ActionBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 pt-4 pb-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrev}
        disabled={disabled || isFirst}
        className="h-11 w-11 rounded-full border-muted-foreground/40 text-muted-foreground hover:border-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10"
        aria-label="Previous question"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSkip}
          disabled={disabled}
          className="h-11 px-4 rounded-full gap-1.5 border-muted-foreground/40 text-muted-foreground hover:border-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10"
          aria-label="Skip question"
        >
          <SkipForward className="h-4 w-4" />
          <span className="text-xs font-medium">Skip</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onArchive}
          disabled={disabled}
          className="h-11 px-4 rounded-full gap-1.5 border-orange-400/40 bg-orange-500/15 text-orange-300 hover:bg-orange-500/25 hover:border-orange-400/60 hover:text-orange-200"
          aria-label="Archive question"
        >
          <Archive className="h-4 w-4" />
          <span className="text-xs font-medium">Archive</span>
        </Button>
      </div>

      <Button
        variant="default"
        size="icon"
        onClick={onNext}
        disabled={disabled || isLast}
        className="h-11 w-11 rounded-full bg-amber-500 text-gray-950 hover:bg-amber-400"
        aria-label="Next question"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
