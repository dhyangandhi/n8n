"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";

/**
 * GET MANY WORKFLOWS
 */
export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useSuspenseQuery(
    trpc.workflows.getMany.queryOptions(params)
  );
};

/**
 * CREATE WORKFLOW
 */
export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" created`);

        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getMany.queryKey(params),
        });
      },
      onError: (error) => {
        toast.error(
          `Failed to create workflow: ${error.message}`
        );
      },
    })
  );
};

/**
 * REMOVE WORKFLOW
 */
export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [params] = useWorkflowsParams();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" removed`);

        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getMany.queryKey(params),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getOne.queryKey({
            id: data.id,
          }),
        });
      },
      onError: (error) => {
        toast.error(
          `Failed to remove workflow: ${error.message}`
        );
      },
    })
  );
};

/**
 * GET ONE WORKFLOW
 */
export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.workflows.getOne.queryOptions({ id })
  );
};

/**
 * UPDATE WORKFLOW NAME
 */
export const useUpdateWorkflowName = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" updated`);

        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getMany.queryKey({}),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getOne.queryKey({
            id: data.id,
          }),
        });
      },
      onError: (error) => {
        toast.error(
          `Failed to update workflow: ${error.message}`
        );
      },
    })
  );
};

/**
 * UPDATE WORKFLOW (SAVE)
 */
export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" saved`);

        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getMany.queryKey({}),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.workflows.getOne.queryKey({
            id: data.id,
          }),
        });
      },
      onError: (error) => {
        toast.error(
          `Failed to update workflow: ${error.message}`
        );
      },
    })
  );
};

/**
 * EXECUTE WORKFLOW
 */
export const useExecuteWorkflow = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.triggers.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          `Workflow "${data.name}" executed`
        );
      },
      onError: (error) => {
        toast.error(
          `Failed to execute workflow: ${error.message}`
        );
      },
    })
  );
};