import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  subtopic: text("subtopic"),
  summary: text("summary").notNull(),
  question: text("question").notNull(),
  whyImportant: text("why_important").notNull(),
  answer: text("answer").notNull(),
  keyNotes: text("key_notes").notNull(),
  keywords: text("keywords").array().notNull().default([]),
  sourceFile: text("source_file").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const questionActions = pgTable("question_actions", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  action: text("action").notNull(), // 'archive' | 'skip'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
