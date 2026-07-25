import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { prefetchExecution } from "@/features/executions/server/prefetch";
import { 
    ExecutionsContainer, 
    ExecutionsError, 
    ExecutionsLoading, 
    ExecutionView 
} from "@/features/executions/components/executions";

interface PageProps {
    params: Promise<{
        executionsId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    await requireAuth();
    const { executionsId } = await params;

    prefetchExecution(executionsId);

    return (
        <ExecutionsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<ExecutionsError />}>
                    <Suspense fallback={<ExecutionsLoading />}>
                        <ExecutionView executionId={executionsId} />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </ExecutionsContainer>
    );
};

export default Page;