"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Interview, InterviewTurn } from "@/types/interview";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { ChevronRight, Calendar, Clock, Building, User } from "lucide-react";
import { format } from "date-fns";

interface InterviewCardProps {
  interview: Interview;
  index: number;
  total: number;
  direction: 1 | -1;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

function TurnSection({
  turns,
  section,
}: {
  turns: InterviewTurn[];
  section: string;
}) {
  const sectionTurns = turns.filter((t) => t.section === section);
  if (sectionTurns.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
        {section}
      </h4>
      {sectionTurns.map((turn, i) => (
        <div
          key={i}
          className={`p-3 rounded-lg ${
            turn.speaker === "interviewer"
              ? "bg-slate-800/50 border-l-2 border-blue-500/40"
              : "bg-amber-900/20 border-l-2 border-amber-500/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant={turn.speaker === "interviewer" ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0"
            >
              {turn.speaker === "interviewer" ? "Interviewer" : "You"}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {turn.topic}
            </span>
          </div>
          <div className="text-sm text-muted-foreground prose prose-sm prose-invert max-w-none">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {turn.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InterviewCard({
  interview,
  index,
  total,
  direction,
  onSwipeLeft,
  onSwipeRight,
}: InterviewCardProps) {
  const [contextOpen, setContextOpen] = useState(true);
  const [introOpen, setIntroOpen] = useState(false);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const [systemDesignOpen, setSystemDesignOpen] = useState(false);
  const [behavioralOpen, setBehavioralOpen] = useState(false);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft?.(),
    onSwipedRight: () => onSwipeRight?.(),
    delta: 40,
    preventScrollOnSwipe: false,
    trackTouch: true,
    trackMouse: true,
  });

  const sections = [...new Set(interview.turns.map((t) => t.section))];

  return (
    <div {...swipeHandlers} className="flex flex-col h-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={interview.id}
          initial={{ opacity: 0, x: 80 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 * direction }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {interview.technologies.slice(0, 4).map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="text-[10px] font-medium"
                >
                  {tech}
                </Badge>
              ))}
              {interview.technologies.length > 4 && (
                <Badge variant="outline" className="text-[10px]">
                  +{interview.technologies.length - 4}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {index + 1} / {total}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-base font-semibold text-amber-200 mb-2 leading-snug">
            {interview.title}
          </h2>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin">
            {/* Context - collapsible */}
            <Collapsible
              open={contextOpen}
              onOpenChange={setContextOpen}
              className="mb-4"
            >
              <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${contextOpen ? "rotate-90" : ""}`}
                />
                Interview Context
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-3 bg-slate-800/30 rounded-lg text-xs space-y-1.5">
                  {interview.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Company:</span>
                      <span>{interview.company}</span>
                      {interview.industry && (
                        <span className="text-muted-foreground">
                          ({interview.industry})
                        </span>
                      )}
                    </div>
                  )}
                  {interview.role && (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Role:</span>
                      <span>{interview.role}</span>
                    </div>
                  )}
                  {interview.interviewerName && (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Interviewer:
                      </span>
                      <span>{interview.interviewerName}</span>
                      {interview.interviewerTitle && (
                        <span className="text-muted-foreground">
                          ({interview.interviewerTitle})
                        </span>
                      )}
                    </div>
                  )}
                  {interview.durationMinutes && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{interview.durationMinutes} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Position:</span>
                    <span>{interview.position}</span>
                    {interview.difficulty && (
                      <Badge variant="outline" className="text-[10px] ml-auto">
                        {interview.difficulty}
                      </Badge>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Conversation sections */}
            {sections.includes("intro") && (
              <Collapsible
                open={introOpen}
                onOpenChange={setIntroOpen}
                className="mb-3"
              >
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors w-full">
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${introOpen ? "rotate-90" : ""}`}
                  />
                  Introduction
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-2">
                    <TurnSection turns={interview.turns} section="intro" />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {sections.includes("warmup") && (
              <Collapsible
                open={introOpen}
                onOpenChange={setIntroOpen}
                className="mb-3"
              >
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors w-full">
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${introOpen ? "rotate-90" : ""}`}
                  />
                  Warm-up
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-2">
                    <TurnSection turns={interview.turns} section="warmup" />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {sections.includes("technical") && (
              <Collapsible
                open={technicalOpen}
                onOpenChange={setTechnicalOpen}
                className="mb-3"
              >
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors w-full">
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${technicalOpen ? "rotate-90" : ""}`}
                  />
                  Technical Deep-dive
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-2">
                    <TurnSection turns={interview.turns} section="technical" />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {sections.includes("system-design") && (
              <Collapsible
                open={systemDesignOpen}
                onOpenChange={setSystemDesignOpen}
                className="mb-3"
              >
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-green-400 hover:text-green-300 transition-colors w-full">
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${systemDesignOpen ? "rotate-90" : ""}`}
                  />
                  System Design
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-2">
                    <TurnSection
                      turns={interview.turns}
                      section="system-design"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {sections.includes("behavioral") && (
              <Collapsible
                open={behavioralOpen}
                onOpenChange={setBehavioralOpen}
                className="mb-3"
              >
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors w-full">
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${behavioralOpen ? "rotate-90" : ""}`}
                  />
                  Behavioral
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-2">
                    <TurnSection turns={interview.turns} section="behavioral" />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Generated date */}
            {interview.generatedAt && (
              <div className="flex items-center gap-1.5 mt-4 text-[11px] text-muted-foreground/60">
                <Calendar className="h-3 w-3" />
                {format(new Date(interview.generatedAt), "MMM d, yyyy")}
              </div>
            )}

            <div className="h-16"></div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
