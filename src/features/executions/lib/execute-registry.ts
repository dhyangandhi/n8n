import { NodeType } from "@prisma/client";

import type { NodeExecutor } from "../types";

import { httpRequestExecutor } from "../components/http-request/executor";

import { OLLAMAExecutor } from "../components/ollama/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";

type ExecutorRegistry = Partial<
  Record<NodeType, NodeExecutor<any>>
>;

export const EXECUTOR_REGISTRY: ExecutorRegistry = {
    [NodeType.HTTP_REQUEST]: httpRequestExecutor,
    [NodeType.INITIAL]: manualTriggerExecutor,
    [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
    [NodeType.OLLAMA]: OLLAMAExecutor,
};

export function getExecutor(
  type: NodeType
): NodeExecutor<any> | undefined {
  return EXECUTOR_REGISTRY[type];
}