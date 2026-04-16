import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { polarClient } from '@/lib/polar';
 
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return { 
    userId: session?.user?.id || null,
    session,
  };
});
 
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
 
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthenticated",
    }) 
  }

  return next({ ctx: { ...ctx, auth: session } });
})

export const premiumProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    let customer = null;

    try {
      customer = await polarClient.customers.getStateExternal({
        externalId: ctx.auth.user.id,
      });
    } catch (err) {
      console.log("Polar fetch failed (ignored in dev):", err);
    }

    // 🔥 BYPASS: do NOT block even if no subscription
    return next({ ctx: { ...ctx, customer } });
  }
);