import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createSSRHelpers } from "@/server/helpers";
import GuidesClient from "./GuidesClient";

export default async function GuidesPage() {
  const helpers = createSSRHelpers();
  await helpers.guides.getFilters.prefetch();

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <GuidesClient />
    </HydrationBoundary>
  );
}
