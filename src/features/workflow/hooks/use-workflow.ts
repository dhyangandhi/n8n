"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
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

                // ✅ correct invalidation
                queryClient.invalidateQueries({
                    queryKey: trpc.workflows.getMany.queryKey(params),
                });
            },
            onError: (error) => {
                toast.error(`Failed to create workflow: ${error.message}`);
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

                // ✅ refresh list
                queryClient.invalidateQueries({
                    queryKey: trpc.workflows.getMany.queryKey(params),
                });

                // ✅ remove detail cache
                queryClient.invalidateQueries({
                    queryKey: trpc.workflows.getOne.queryKey({ id: data.id }),
                });
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
 * CREATE WORKFLOW
 */
export const useUpdateWorkflowName = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(
        trpc.workflows.updateName.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Workflow "${data.name}" updated`);

                // ✅ correct invalidation
                queryClient.invalidateQueries(
                    trpc.workflows.getMany.queryOptions({}),
                );
                queryClient.invalidateQueries(
                    trpc.workflows.getOne.queryOptions({ id: data.id }),
                );
            },
            onError: (error) => {
                toast.error(`Failed to update workflow: ${error.message}`);
            },
        })
    );
};
