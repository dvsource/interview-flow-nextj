"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Question } from "@/types/question";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";

function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code key={i} className="title-code">{part.slice(1, -1)}</code>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
}

export function QuestionCard({ question, index, total }: QuestionCardProps) {
  const [whyOpen, setWhyOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-1 mb-4">
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-xs font-medium">
              {question.topic}
            </Badge>
            {question.subtopic && (
              <Badge variant="outline" className="text-xs font-medium">
                {question.subtopic}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {index + 1} / {total}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-lg font-semibold text-amber-200 mb-4 leading-snug">
          {renderInlineCode(question.question)}
        </h2>

        {/* Keywords */}
        {question.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {question.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border mb-4" />

        {/* Answer - scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin">
          <div className="markdown-content">
            <ReactMarkdown>{question.answer}</ReactMarkdown>
          </div>

          {/* Why it's asked - collapsible */}
          {question.whyImportant && (
            <Collapsible open={whyOpen} onOpenChange={setWhyOpen} className="mt-4">
              <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${whyOpen ? "rotate-90" : ""}`}
                />
                Why it's asked
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-3 border-l-2 border-primary/30 text-sm text-muted-foreground">
                  <div className="markdown-content">
                    <ReactMarkdown>{question.whyImportant}</ReactMarkdown>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Key notes - collapsible */}
          {question.keyNotes && (
            <Collapsible open={notesOpen} onOpenChange={setNotesOpen} className="mt-3">
              <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${notesOpen ? "rotate-90" : ""}`}
                />
                Key notes & gotchas
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-3 border-l-2 border-yellow-500/30 text-sm text-muted-foreground">
                  <div className="markdown-content">
                    <ReactMarkdown>{question.keyNotes}</ReactMarkdown>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Generated date */}
          {question.generatedAt && (
            <div className="flex items-center gap-1.5 mt-4 text-[11px] text-muted-foreground/60">
              <Calendar className="h-3 w-3" />
              {format(new Date(question.generatedAt), "MMM d, yyyy")}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
