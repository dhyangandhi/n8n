import { NonRetriableError } from "inngest";
import { inngest } from "./client";

import prisma from "@/lib/db";

import { ExecutionStatus, NodeType } from "@prisma/client";

import { getExecutor } from "@/features/executions/lib/execute-registry";
import { topologicalSort } from "./utils";

import { manualTriggerChannel } from "./channels/manual-trigger";
import { httpRequestChannel } from "./channels/http-request";
import { ollamaChannel } from "./channels/ollama";

console.log("✅ INNGEST FUNCTIONS LOADED");

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0,
    triggers: [
      {
        event: "workflow.execution",
        channels: [
          httpRequestChannel(),
          manualTriggerChannel(),
          ollamaChannel(),
        ],
      },
    ],
    onFailure: async ({ event }) => {
      const inngestEventId = event.data.event?.id || event.data.event?.data?.inngestEventId;
      const workflowId = event.data.event?.data?.workflowId;

      if (inngestEventId && workflowId) {
        await prisma.execution.upsert({
          where: {
            inngestEventId,
          },
          create: {
            inngestEventId,
            workflowId,
            status: ExecutionStatus.FAILED,
            error: event.data.error.message,
            errorStack: event.data.error.stack,
            completedAt: new Date(),
          },
          update: {
            status: ExecutionStatus.FAILED,
            error: event.data.error.message,
            errorStack: event.data.error.stack,
            completedAt: new Date(),
          },
        });
      } else if (inngestEventId) {
        await prisma.execution.updateMany({
          where: {
            inngestEventId,
          },
          data: {
            status: ExecutionStatus.FAILED,
            error: event.data.error.message,
            errorStack: event.data.error.stack,
            completedAt: new Date(),
          },
        });
      }
    },
  },
  async ({ event, step }) => {
    console.log("🚀 FUNCTION STARTED:", event.data);
    const inngestEventId = event.id;
    const data = event.data as {
      workflowId: string;
      initialData?: Record<string, unknown>;
    };

    const workflowId = data.workflowId;

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Event Id or Workflow ID is missing");
    }

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          inngestEventId,
          workflowId,
          status: ExecutionStatus.RUNNING,
        },
      });
    });

    const sortedNodes = await step.run(
      "prepare-workflow",
      async () => {
        console.log("📦 FETCHING WORKFLOW:", workflowId);

        const workflow = await prisma.workflow.findUniqueOrThrow({
          where: {
            id: workflowId,
          },
          include: {
            nodes: true,
            connections: true,
          },
        });

        console.log("✅ WORKFLOW LOADED");

        const sorted = topologicalSort(
          workflow.nodes,
          workflow.connections
        );

        console.log("📊 SORTED NODES:", sorted.length);

        return sorted;
      }
    );

    let context = data.initialData || {};

    for (const node of sortedNodes) {
      console.log(`➡️ EXECUTING NODE: ${node.id} (${node.type})`);

      const executor = getExecutor(node.type as NodeType);

      if (!executor) {
        throw new NonRetriableError(
          `No executor found for node type: ${node.type}`
        );
      }

      try {
        // FIX: Added 'as any' to bypass the strict object literal checking 
        // until 'publish' is added to the NodeExecutorParams type definition.
        context = await executor({
          data: node.data as Record<string, unknown>,
          nodeId: node.id,
          context,
          step,
          publish: async (msg: any) => {
            console.log("🔥 PUBLISH CALLED");

            const safeMsg =
              typeof msg === "object"
                ? JSON.parse(JSON.stringify(msg))
                : msg;

            try {
              await inngest.send({
                name: "publish:http-request-execution",
                data: {
                  nodeId: node.id,
                  workflowId,
                  payload: safeMsg,
                },
              });

              console.log("✅ EVENT SENT TO INNGEST");
            } catch (err) {
              console.error("❌ SEND FAILED", err);
            }

            console.log(`[NODE ${node.id}]`, safeMsg);
          },
        } as any);

        console.log(`✅ NODE COMPLETED: ${node.id}`);
      } catch (error) {
        console.error(`❌ NODE FAILED: ${node.id}`, error);
        throw error;
      }
    }

    await step.run("update-execution", async () => {
      return prisma.execution.update({
        where: {
          inngestEventId,
        },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context as any,
        },
      });
    });
    console.log("🎉 WORKFLOW COMPLETED");

    return {
      workflowId,
      result: context,
    };
  }
);