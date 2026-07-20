"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";
import { CredentialType } from "@prisma/client";

/**
 * GET ONE CREDENTIAL
 */
export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.credentials.getOne.queryOptions({ id })
  );
};

/**
 * GET MANY CREDENTIALS
 */
export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  return useSuspenseQuery(
    trpc.credentials.getMany.queryOptions(params)
  );
};

/**
 * CREATE CREDENTIAL
 */
export const useCreateCredentials = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" created`);

        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getMany.queryKey(params),
        });
      },
      onError: (error) => {
        toast.error(`Failed to create credential: ${error.message}`);
      },
    })
  );
};

/**
 * REMOVE CREDENTIAL
 */
export const useRemoveCredential = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Credential removed");

        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getMany.queryKey(params),
        });
      },
      onError: (error) => {
        toast.error(`Failed to remove credential: ${error.message}`);
      },
    })
  );
};

/**
 * UPDATE CREDENTIAL
 */
export const useUpdateCredential = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" updated`);

        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getMany.queryKey({}),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getOne.queryKey({
            id: data.id,
          }),
        });
      },
      onError: (error) => {
        toast.error(`Failed to update credential: ${error.message}`);
      },
    })
  );
};

/**
 * SAVE CREDENTIAL
 */
export const useUpdateCredentials = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" saved`);

        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getMany.queryKey({}),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.credentials.getOne.queryKey({
            id: data.id,
          }),
        });
      },
      onError: (error) => {
        toast.error(`Failed to save credential: ${error.message}`);
      },
    })
  );
};

/**
 * GET CREDENTIALS BY TYPE
 */
export const useCredentialsByType = (type: CredentialType) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.credentials.getByType.queryOptions({ type })
  );
};