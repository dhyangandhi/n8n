import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

// Infer the expected input type directly from your tRPC router
type Input = inferInput<typeof trpc.workflows.getMany>;

export const prefetchCredentials = (params: Input) => {
    return prefetch(trpc.workflows.getMany.queryOptions(params));
}

export const prefetchCredential = (id: string) => {
    return prefetch(trpc.workflows.getOne.queryOptions({ id }));
}