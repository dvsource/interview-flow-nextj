import { router } from "../trpc";
import { questionsRouter } from "./questions";
import { interviewsRouter } from "./interviews";
import { guidesRouter } from "./guides";

export const appRouter = router({
  questions: questionsRouter,
  interviews: interviewsRouter,
  guides: guidesRouter,
});

export type AppRouter = typeof appRouter;
