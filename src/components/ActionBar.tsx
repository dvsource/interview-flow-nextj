"use client";

import { ChevronLeft, ChevronRight, SkipForward, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  onPrev: () => void;
  onNext: () => void;
  onSkip?: () => void;
  onArchive?: () => void;
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
    <div className="absolute bottom-14 left-4 right-4 z-10 flex items-center justify-between gap-2 max-w-md mx-auto">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrev}
        disabled={disabled || isFirst}
        className="h-11 w-11 rounded-full border-muted-foreground/40 text-muted-foreground hover:border-highlight/60 hover:text-highlight hover:bg-highlight/10"
        aria-label="Previous question"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {(onSkip || onArchive) && (
        <div className="flex gap-2">
          {onSkip && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              disabled={disabled}
              className="h-11 px-4 rounded-full gap-1.5 border-muted-foreground/40 text-muted-foreground hover:border-highlight/60 hover:text-highlight hover:bg-highlight/10"
              aria-label="Skip question"
            >
              <SkipForward className="h-4 w-4" />
              <span className="text-xs font-medium">Skip</span>
            </Button>
          )}

          {onArchive && (
            <Button
              variant="outline"
              size="icon"
              onClick={onArchive}
              disabled={disabled}
              className="h-11 w-11 rounded-full border-warning/40 bg-warning/15 text-warning hover:bg-warning/25 hover:border-warning/60"
              aria-label="Archive question"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <Button
        variant="default"
        size="icon"
        onClick={onNext}
        disabled={disabled || isLast}
        className="h-11 w-11 rounded-full bg-highlight text-highlight-foreground hover:bg-highlight/85"
        aria-label="Next question"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
