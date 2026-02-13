import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
    onError: ({ error, path }) => {
      console.error(`[tRPC] ${path}:`, error.message);
      if (error.cause) console.error(`[tRPC] cause:`, error.cause);
    },
  });
}

export { handler as GET, handler as POST };
