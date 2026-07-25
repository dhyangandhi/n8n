"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useExecutionsParams } from "./use-exections-params"
import { CredentialType } from "@prisma/client";

/**
 * GET ONE EXECUTION
 */
export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};

/**
 * GET MANY EXECUTIONS
 */
export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();

  return useSuspenseQuery(
    trpc.executions.getMany.queryOptions(params)
  );
};

