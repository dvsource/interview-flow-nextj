"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Guide, GuideSection } from "@/types/guide";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { isInsideHorizontalScroll } from "@/lib/swipe-utils";
import { ChevronRight, Calendar, Clock, Target, Layers } from "lucide-react";
import { format } from "date-fns";

interface GuideCardProps {
  guide: Guide;
  index: number;
  total: number;
  direction: 1 | -1;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

function SectionItem({
  section,
  children,
  depth = 0,
}: {
  section: GuideSection;
  children?: React.ReactNode;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(depth === 0);

  const paddingLeft = depth * 12;
  const hasContent = section.content && section.content.length > 50;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className="flex items-center gap-2 text-sm font-medium hover:text-amber-300 transition-colors w-full py-1"
        style={{ paddingLeft }}
      >
        <ChevronRight
          className={`h-3.5 w-3.5 transition-transform shrink-0 ${isOpen ? "rotate-90" : ""}`}
        />
        <span className="text-muted-foreground mr-1">{section.id}</span>
        <span className="text-left">{section.title}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {hasContent && (
          <div
            className="mt-2 mb-3 prose prose-sm prose-invert max-w-none"
            style={{ paddingLeft: paddingLeft + 24 }}
          >
            <div className="markdown-content">
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {section.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function buildSectionTree(
  sections: GuideSection[],
): Map<string, GuideSection[]> {
  const tree = new Map<string, GuideSection[]>();

  for (const section of sections) {
    const parentId = section.id.includes(".")
      ? section.id.substring(0, section.id.lastIndexOf("."))
      : null;

    if (parentId) {
      const children = tree.get(parentId) || [];
      children.push(section);
      tree.set(parentId, children);
    }
  }

  return tree;
}

export function GuideCard({
  guide,
  index,
  total,
  direction,
  onSwipeLeft,
  onSwipeRight,
}: GuideCardProps) {
  const [metaOpen, setMetaOpen] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (e) => {
      if (!isInsideHorizontalScroll(e.event.target)) onSwipeLeft?.();
    },
    onSwipedRight: (e) => {
      if (!isInsideHorizontalScroll(e.event.target)) onSwipeRight?.();
    },
    delta: 40,
    preventScrollOnSwipe: false,
    trackTouch: true,
    trackMouse: true,
  });

  const sectionsByLevel = {
    level1: guide.sections.filter((s) => s.level === 1),
    level2: guide.sections.filter((s) => s.level === 2),
    level3: guide.sections.filter((s) => s.level === 3),
  };

  const sectionTree = buildSectionTree(guide.sections);
  const topLevelSections =
    sectionsByLevel.level1.length > 0
      ? sectionsByLevel.level1
      : sectionsByLevel.level2.length > 0
        ? sectionsByLevel.level2
        : sectionsByLevel.level3;

  const renderSection = (section: GuideSection, depth: number) => {
    const children = sectionTree.get(section.id) || [];
    return (
      <SectionItem key={section.id} section={section} depth={depth}>
        {children.length > 0 && (
          <div className="space-y-1">
            {children.map((child) => renderSection(child, depth + 1))}
          </div>
        )}
      </SectionItem>
    );
  };

  return (
    <div {...swipeHandlers} className="flex flex-col h-full">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={guide.id}
          custom={direction}
          variants={{
            enter: (d: number) => ({ opacity: 0, x: 80 * d }),
            center: { opacity: 1, x: 0 },
            exit: (d: number) => ({ opacity: 0, x: -80 * d }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1 mb-3">
            <div className="flex items-center gap-1.5">
              {guide.techStack && (
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {guide.techStack}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {index + 1} / {total}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-base font-semibold text-amber-200 mb-2 leading-snug">
            {guide.title}
          </h2>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin">
            {/* Metadata - collapsible */}
            <Collapsible
              open={metaOpen}
              onOpenChange={setMetaOpen}
              className="mb-4"
            >
              <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${metaOpen ? "rotate-90" : ""}`}
                />
                Guide Info
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-3 bg-slate-800/30 rounded-lg text-xs space-y-1.5">
                  {guide.targetAudience && (
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Audience:</span>
                      <span>{guide.targetAudience}</span>
                    </div>
                  )}
                  {guide.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{guide.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Layers className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Sections:</span>
                    <span>{guide.sections.length}</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Table of Contents - collapsible */}
            {guide.tableOfContents.length > 0 && (
              <Collapsible
                open={tocOpen}
                onOpenChange={setTocOpen}
                className="mb-4"
              >
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${tocOpen ? "rotate-90" : ""}`}
                  />
                  Table of Contents ({guide.tableOfContents.length})
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {guide.tableOfContents.map((item, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300"
                      >
                        {i + 1}. {item}
                      </span>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Divider */}
            <div className="h-px bg-border mb-4" />

            {/* Sections */}
            {topLevelSections.length > 0 ? (
              <div className="space-y-2">
                {topLevelSections.map((section) => renderSection(section, 0))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No sections found in this guide.
              </div>
            )}

            {/* Generated date */}
            {guide.generatedAt && (
              <div className="flex items-center gap-1.5 mt-4 text-[11px] text-muted-foreground/60">
                <Calendar className="h-3 w-3" />
                {format(new Date(guide.generatedAt), "MMM d, yyyy")}
              </div>
            )}

            <div className="h-16"></div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
