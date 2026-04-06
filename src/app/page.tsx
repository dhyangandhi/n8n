import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { Client } from "@/components/client";

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    trpc.hello.queryOptions({ text: "" })
  );

  const users: any[] = [];

  return (
    <div className="min-h-screen flex items-center justify-center">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>loading...</p>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}