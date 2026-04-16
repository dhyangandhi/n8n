import { WorkflowsContainer, WorkflowsList } from "@/features/workflow/components/workflow";
import { workflowParamsLoader } from "@/features/workflow/server/params";
import { prefetchWorkflows } from "@/features/workflow/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
    searchParmas: Promise<SearchParams>
}
const Page = async ({ searchParmas }: Props) => {
    await requireAuth();
    const params = await workflowParamsLoader(searchParmas);
    prefetchWorkflows(params);

    return (
        <WorkflowsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <Suspense fallback={<p>Loading...</p>}>
                        <WorkflowsList />
                    </Suspense>
                </ErrorBoundary>            
            </HydrateClient>
        </WorkflowsContainer>
    )
};

export default Page; 