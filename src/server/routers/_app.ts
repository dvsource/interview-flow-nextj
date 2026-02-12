import { router } from "../trpc";
import { questionsRouter } from "./questions";

export const appRouter = router({
  questions: questionsRouter,
});

export type AppRouter = typeof appRouter;
