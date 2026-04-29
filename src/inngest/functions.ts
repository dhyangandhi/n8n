import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSorl } from "./utils";
import { NodeType } from "@prisma/client";
import { getExecutor } from "@/features/executions/lib/execute-registry";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    triggers: [{ event: "workflows/execute.workflow" }],
  },
  async ({ event, step }) => {
    console.log("FUNCTION STARTED:", event.data);

    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });
      return topologicalSorl (workflow.nodes, workflow.connections);
    });
    let context = event.data.initialData || {};
    for (const node of sortedNodes ) {
      const exectuor = getExecutor(node.type as NodeType);
      context = await exectuor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
      });
    }
    return { workflowId, result: context, };
  },
);