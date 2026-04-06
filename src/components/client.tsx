"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Client = () => {
    const trpc = useTRPC();
const { data: users } = useSuspenseQuery(trpc.hello.queryOptions({ text: "client" }));

    return (
        <div>
            Client component: {JSON.stringify(users)}
        </div>
    )
}