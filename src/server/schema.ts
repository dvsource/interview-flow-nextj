import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";

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
  action: text("action").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  technologies: text("technologies").array().notNull().default([]),
  position: text("position").notNull(),
  positionCode: text("position_code"),
  difficulty: text("difficulty"),
  durationMinutes: integer("duration_minutes"),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  company: text("company"),
  industry: text("industry"),
  companySize: text("company_size"),
  role: text("role"),
  roleDescription: text("role_description"),
  interviewRound: text("interview_round"),
  interviewerName: text("interviewer_name"),
  interviewerTitle: text("interviewer_title"),
  turns: jsonb("turns").notNull().default([]),
  sourceFile: text("source_file").notNull().unique(),
  rawContent: text("raw_content"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const guides = pgTable("guides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  targetAudience: text("target_audience"),
  techStack: text("tech_stack"),
  duration: text("duration"),
  tableOfContents: text("table_of_contents").array().notNull().default([]),
  sections: jsonb("sections").notNull().default([]),
  sourceFile: text("source_file").notNull().unique(),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  rawContent: text("raw_content"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
