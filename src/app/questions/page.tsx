import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createSSRHelpers } from "@/server/helpers";
import QuestionsClient from "./QuestionsClient";

export default async function QuestionsPage() {
  const helpers = createSSRHelpers();
  await helpers.questions.getTopics.prefetch();

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <QuestionsClient />
    </HydrationBoundary>
  );
}
