import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { router, publicProcedure } from "../trpc";
import { getDb } from "../db";
import { questions, questionActions } from "../schema";

export const questionsRouter = router({
  getAll: publicProcedure
    .input(
      z
        .object({
          topic: z.string().optional(),
          subtopic: z.string().optional(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      const db = getDb();

      const conditions = [];
      if (input?.topic) conditions.push(eq(questions.topic, input.topic));
      if (input?.subtopic)
        conditions.push(eq(questions.subtopic, input.subtopic));

      const rows = await db
        .select()
        .from(questions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(questions.id);
      return rows;
    }),

  getTopics: publicProcedure.query(async () => {
    const db = getDb();

    const rows = await db
      .select({
        topic: questions.topic,
        subtopic: questions.subtopic,
        count: count(),
      })
      .from(questions)
      .groupBy(questions.topic, questions.subtopic)
      .orderBy(questions.topic, questions.subtopic);
    return rows;
  }),

  getActions: publicProcedure.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(questionActions)
      .orderBy(questionActions.id);
    return rows;
  }),

  setAction: publicProcedure
    .input(
      z.object({
        questionId: z.number(),
        action: z.enum(["archive", "skip"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .insert(questionActions)
        .values({
          questionId: input.questionId,
          action: input.action,
        })
        .onConflictDoNothing();
      return { success: true };
    }),

  removeAction: publicProcedure
    .input(
      z.object({
        questionId: z.number().nullish(),
        action: z.enum(["archive", "skip"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(questionActions.action, input.action)];
      if (input.questionId != null) {
        conditions.push(eq(questionActions.questionId, input.questionId));
      }
      await db
        .delete(questionActions)
        .where(and(...conditions));
      return { success: true };
    }),
});
