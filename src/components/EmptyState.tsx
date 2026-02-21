"use client";

import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  archivedCount: number;
  onClearSkipped: () => void;
}

export function EmptyState({ archivedCount, onClearSkipped }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <PartyPopper className="h-12 w-12 text-primary mb-4" />
      <h2 className="text-xl font-semibold text-foreground mb-2">
        You're all caught up!
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
        {archivedCount > 0
          ? `You've archived ${archivedCount} question${archivedCount > 1 ? "s" : ""}. `
          : ""}
        Refresh the page or bring back skipped questions to continue.
      </p>
      <Button
        variant="outline"
        onClick={onClearSkipped}
        className="rounded-full"
      >
        Bring back skipped questions
      </Button>
    </div>
  );
}
