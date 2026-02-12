"use client";

import ReactMarkdown from "react-markdown";
import { Question } from "@/types/question";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
}

export function QuestionCard({ question, index, total }: QuestionCardProps) {
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
          <Badge variant="secondary" className="text-xs font-medium">
            {question.topic}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {index + 1} / {total}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-lg font-semibold text-foreground mb-4 leading-snug">
          {question.question}
        </h2>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {question.keywords.map((kw) => (
            <span
              key={kw}
              className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
            >
              {kw}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-4" />

        {/* Answer - scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin">
          <div className="markdown-content">
            <ReactMarkdown>{question.answer}</ReactMarkdown>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
