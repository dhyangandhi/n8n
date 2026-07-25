import { prefetchWorkflow } from "@/features/workflow/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { EditorError, EditorLoading } from "@/features/editor/components/editor";
import { WorkflowEditor } from "@/features/editor/components/workflow-editor";

// 1. Update the type to reflect that params is a Promise
interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  // 2. Await the params before using them
  const { workflowId } = await params;
  prefetchWorkflow(workflowId);
  // 3. Now you can safely display the ID!
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError />}>
        <Suspense fallback={<EditorLoading />}>
          <WorkflowEditor workflowId={workflowId} />
        </Suspense>
      </ErrorBoundary>            
    </HydrateClient>
  )
};

export default Page;
