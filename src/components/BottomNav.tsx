"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/questions", label: "Questions", icon: BookOpen },
  { href: "/interviews", label: "Interviews", icon: MessageSquare },
  { href: "/guides", label: "Guides", icon: FileText },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around h-10">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href === "/questions" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-center py-1.5 px-4 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-highlight")} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
