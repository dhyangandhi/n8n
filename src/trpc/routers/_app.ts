import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
export const appRouter = createTRPCRouter({
  // 🔹 Get current logged-in user
  hello: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async ({ ctx }) => {
      if (!ctx.auth?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthenticated",
        });
      }

      try {
        const user = await prisma.user.findUnique({
          where: {
            id: ctx.auth?.user?.id,
          },
        });

        return {
          message: `Hello ${ctx.auth?.user?.id}`,
          user,
        };
      } catch (error) {
        console.error("DB ERROR:", error);
        throw new Error("Database connection failed");
      }
    }),

  // 🔹 Get all users
  getUsers: protectedProcedure.query(async () => {
    try {
      return await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error("DB ERROR:", error);
      throw new Error("Database connection failed");
    }
  }),
});

export type AppRouter = typeof appRouter;