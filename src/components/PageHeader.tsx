"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { Filter, X } from "lucide-react";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  titleHref?: string;
  filters?: ReactNode;
}

export function PageHeader({ icon, title, titleHref, filters }: PageHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);

  const titleContent = (
    <>
      {icon}
      <h1 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h1>
    </>
  );

  return (
    <header className="pt-2 pb-2">
      <div className="flex items-center gap-2">
        {titleHref ? (
          <Link
            href={titleHref}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {titleContent}
          </Link>
        ) : (
          <div className="flex items-center gap-2">{titleContent}</div>
        )}
        <div className="ml-auto flex items-center gap-1">
          {filters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <X className="h-4 w-4" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
      {filters && showFilters && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">{filters}</div>
      )}
    </header>
  );
}
