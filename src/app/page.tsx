import { Suspense } from "react";
import HomeSetupClient from "./HomeSetupClient";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[100dvh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <HomeSetupClient />
    </Suspense>
  );
}
