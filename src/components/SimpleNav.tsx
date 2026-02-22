"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleNavProps {
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
}

export function SimpleNav({
  onPrev,
  onNext,
  isFirst,
  isLast,
  disabled,
}: SimpleNavProps) {
  return (
    <div className="flex items-center justify-center gap-6 pt-4 pb-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrev}
        disabled={disabled || isFirst}
        className="h-11 w-11 rounded-full border-muted-foreground/40 text-muted-foreground hover:border-highlight/60 hover:text-highlight hover:bg-highlight/10"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="default"
        size="icon"
        onClick={onNext}
        disabled={disabled || isLast}
        className="h-11 w-11 rounded-full bg-highlight text-highlight-foreground hover:bg-highlight/85"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
