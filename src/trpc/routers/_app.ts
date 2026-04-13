import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "../init";
import { inngest } from "@/inngest/client";
import { z } from "zod";
//import { Ollama } from "ollama"; // ✅ correct import


export const appRouter = createTRPCRouter({

  testAi: protectedProcedure
  .input(z.string())
  .mutation(async ({ input }) => {
    console.log("REAL ROUTER RUNNING:", input);

    const record = await prisma.aiResult.create({
      data: {
        prompt: input,
        status: "pending",
      },
    });

    await inngest.send({
      name: "execute/ai",
      data: {
        prompt: input,
        recordId: record.id,
      },
    });

    return { success: true, id: record.id };
  }),

  getWorkflows: protectedProcedure.query(() => {
    return prisma.workflow.findMany();
  }),

  createWorkflow: protectedProcedure.input(z.string()).mutation(async ({ input: raw }) => {
    try {

      const cleaned = raw.replace(/```json|```/g, "").trim();
      const workflowData = JSON.parse(cleaned);

      const workflow = await prisma.workflow.create({
        data: {
          name: workflowData.name,
          steps: workflowData.steps,
        },
      });

      await inngest.send({
        name: "app/task.created",
        data: {
          email: "pbox1120@gmail.com",
          workflowId: workflow.id,
        },
      });

      return {
        success: true,
        workflow,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Workflow creation failed");
    }
  }),
});

export type AppRouter = typeof appRouter;