import { NonRetriableError } from "inngest";
import { inngest } from "./client";

import prisma from "@/lib/db";

import { NodeType } from "@prisma/client";

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
  },
  async ({ event, step }) => {
    console.log("🚀 FUNCTION STARTED:", event.data);

    const data = event.data as {
      workflowId: string;
      initialData?: Record<string, unknown>;
    };

    const workflowId = data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

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

    console.log("🎉 WORKFLOW COMPLETED");

    return {
      workflowId,
      result: context,
    };
  }
);