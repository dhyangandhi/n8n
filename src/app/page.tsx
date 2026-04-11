"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogoutButton } from "./logout";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@base-ui/react";
const Page = () => {
  const trpc = useTRPC();
  const queryclient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
  const testAi = useMutation(trpc.testAi.mutationOptions({
    onSuccess: () => {
      toast.success("AI Job queued");
    }
  }));

  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      toast.success("Workflow creation initiated");
    }
  }));
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      <div>protected page server</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button disabled={testAi.isPending} onClick={() => testAi.mutate("")}>
        Test Ai
      </Button>
      <Button
        disabled={create.isPending}
        onClick={() => {
          create.mutate("");
        }}
      >
        Create Workflow
      </Button>
      <LogoutButton />
    </div>
  );
};

export default Page;