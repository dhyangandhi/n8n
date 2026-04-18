"use client";


import { useTRPC } from "@/trpc/client"
import { QueryClient, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";

export const useSuspenseWorkflows = () => {
    const trpc = useTRPC();
    const [params] = useWorkflowsParams();
    return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
};

export const useCreateWorkflow = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(trpc.workflows.create.mutationOptions({
        onSuccess: (data) => {
            toast.success(`Workflow "${data.name}"
            created`);
            queryClient.invalidateQueries(
                trpc.workflows.getMany.queryOptions({}),
            );
        },
        onError: (error) => {
            toast.error(`Failed to create workflow: $ {error.mesage}`);
        },
    }),
    );
};

export const useRemoveWorkflow = () => {
    const trpc = useTRPC();
    const qureryClient = useQueryClient();

    return useMutation (
        trpc.workflows.remove.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Workflow "${data.name}" removed`);
                qureryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}))
                qureryClient.invalidateQueries(
                    trpc.workflows.getOne.queryFilter({ id: data.id }),
                )
            }
        })
    )
}