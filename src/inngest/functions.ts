  import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { NodeType } from "@prisma/client";
import { getExecutor } from "@/features/executions/lib/execute-registry";
import { topologicalSort } from "./utils";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { httpRequestChannel } from "./channels/http-request";

  export const executeWorkflow = inngest.createFunction(
    { id: "execute-workflow", retries: 0, triggers: [{ event: "workflows/execute.workflow" }]},
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
          const workflow = await prisma.workflow.findUniqueOrThrow({
            where: { id: workflowId },
            include: {
              nodes: true,
              connections: true,
            },
          });

          return topologicalSort(
            workflow.nodes,
            workflow.connections
          );
        }
      );

      let context = data.initialData || {};

      for (const node of sortedNodes) {
        console.log(`➡️ Executing node: ${node.id} (${node.type})`);

        const executor = getExecutor(node.type as NodeType);

        if (!executor) {
          throw new NonRetriableError(
            `No executor found for node type: ${node.type}`
          );
        }

        context = await executor({
          data: node.data as Record<string, unknown>,
          nodeId: node.id,
          context,
          step,

          // ✅ FIXED PUBLISH (this is what makes event visible in Inngest)
          publish: async (msg) => {
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
        });
      }

      return {
        workflowId,
        result: context,
      };
    }
  );