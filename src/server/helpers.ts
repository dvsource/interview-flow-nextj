import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "./routers/_app";

export function createSSRHelpers() {
  return createServerSideHelpers({
    router: appRouter,
    ctx: {},
  });
}
