import { z } from "zod";
import { eq, and, count, sql } from "drizzle-orm";
import { router, publicProcedure } from "../trpc";
import { getDb } from "../db";
import { interviews } from "../schema";

export const interviewsRouter = router({
  getAll: publicProcedure
    .input(
      z
        .object({
          position: z.string().optional(),
          technology: z.string().optional(),
        })
        .nullish()
    )
    .query(async ({ input }) => {
      const db = getDb();

      const conditions = [];
      if (input?.position) {
        conditions.push(eq(interviews.position, input.position));
      }
      if (input?.technology) {
        conditions.push(sql`${input.technology} = ANY(${interviews.technologies})`);
      }

      const rows = await db
        .select()
        .from(interviews)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(interviews.id);
      return rows;
    }),

  getPaginated: publicProcedure
    .input(
      z.object({
        seed: z.number().int(),
        page: z.number().int().min(0),
        pageSize: z.number().int().min(1).max(50).default(10),
        position: z.string().nullish(),
        technology: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { seed, page, pageSize } = input;

      const conditions = [];
      if (input.position) {
        conditions.push(eq(interviews.position, input.position));
      }
      if (input.technology) {
        conditions.push(sql`${input.technology} = ANY(${interviews.technologies})`);
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [{ total }] = await db
        .select({ total: count() })
        .from(interviews)
        .where(whereClause);

      const rows = await db
        .select()
        .from(interviews)
        .where(whereClause)
        .orderBy(sql`md5(${interviews.id}::text || ${seed}::text)`)
        .limit(pageSize)
        .offset(page * pageSize);

      const totalCount = Number(total);
      return {
        interviews: rows,
        totalCount,
        page,
        pageSize,
        hasMore: (page + 1) * pageSize < totalCount,
      };
    }),

  getFilters: publicProcedure.query(async () => {
    const db = getDb();

    const allRows = await db
      .select({
        position: interviews.position,
        technologies: interviews.technologies,
      })
      .from(interviews);

    const positionCounts = new Map<string, number>();
    const techCounts = new Map<string, number>();

    for (const row of allRows) {
      if (row.position) {
        positionCounts.set(row.position, (positionCounts.get(row.position) || 0) + 1);
      }
      for (const tech of row.technologies || []) {
        techCounts.set(tech, (techCounts.get(tech) || 0) + 1);
      }
    }

    const positions = [...positionCounts.entries()]
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => a.position.localeCompare(b.position));

    const technologies = [...techCounts.entries()]
      .map(([technology, count]) => ({ technology, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return { positions, technologies };
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [row] = await db
        .select()
        .from(interviews)
        .where(eq(interviews.id, input.id));
      return row ?? null;
    }),
});
