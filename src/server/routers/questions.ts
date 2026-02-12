import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { router, publicProcedure } from "../trpc";
import { getDb } from "../db";
import { questions } from "../schema";

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
});
