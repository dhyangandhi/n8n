import { requireAuth } from "@/lib/auth-utils";

// 1. Update the type to reflect that params is a Promise
interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  await requireAuth();

  // 2. Await the params before using them
  const Params = await params;

  // 3. Now you can safely display the ID!
  return <p>Workflow id: {Params.workflowId}</p>;
}