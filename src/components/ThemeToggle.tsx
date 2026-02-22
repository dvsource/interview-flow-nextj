"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme, THEMES } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, cycleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <div className="h-4 w-4 rounded-full bg-muted" />
      </Button>
    );
  }

  const currentTheme = THEMES.find((t) => t.name === theme);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 relative"
            onClick={cycleTheme}
          >
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: currentTheme?.color }}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Theme: {currentTheme?.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
