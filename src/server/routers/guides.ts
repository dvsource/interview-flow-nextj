import { z } from "zod";
import { eq, and, count, sql } from "drizzle-orm";
import { router, publicProcedure } from "../trpc";
import { getDb } from "../db";
import { guides } from "../schema";

export const guidesRouter = router({
  getAll: publicProcedure
    .input(
      z
        .object({
          techStack: z.string().optional(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      const db = getDb();

      const conditions = [];
      if (input?.techStack) {
        conditions.push(eq(guides.techStack, input.techStack));
      }

      const rows = await db
        .select()
        .from(guides)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(guides.id);
      return rows;
    }),

  getPaginated: publicProcedure
    .input(
      z.object({
        seed: z.number().int(),
        page: z.number().int().min(0),
        pageSize: z.number().int().min(1).max(50).default(10),
        techStack: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { seed, page, pageSize } = input;

      const conditions = [];
      if (input.techStack) {
        conditions.push(eq(guides.techStack, input.techStack));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [{ total }] = await db
        .select({ total: count() })
        .from(guides)
        .where(whereClause);

      const rows = await db
        .select()
        .from(guides)
        .where(whereClause)
        .orderBy(sql`md5(${guides.id}::text || ${seed}::text)`)
        .limit(pageSize)
        .offset(page * pageSize);

      const totalCount = Number(total);
      return {
        guides: rows,
        totalCount,
        page,
        pageSize,
        hasMore: (page + 1) * pageSize < totalCount,
      };
    }),

  getFilters: publicProcedure.query(async () => {
    const db = getDb();

    const rows = await db
      .select({
        techStack: guides.techStack,
      })
      .from(guides);

    const techStackCounts = new Map<string, number>();
    for (const row of rows) {
      if (row.techStack) {
        techStackCounts.set(row.techStack, (techStackCounts.get(row.techStack) || 0) + 1);
      }
    }

    const techStacks = [...techStackCounts.entries()]
      .map(([techStack, count]) => ({ techStack, count }))
      .sort((a, b) => a.techStack.localeCompare(b.techStack));

    return { techStacks };
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [row] = await db
        .select()
        .from(guides)
        .where(eq(guides.id, input.id));
      return row ?? null;
    }),
});
