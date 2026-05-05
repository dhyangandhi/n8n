import { channel, topic } from "@inngest/realtime";

export const MANUAL_TRIGGER_CHANNEL_Name = "manual-trigger-execution";

export const manualTriggerChannel = channel("MANUAL_TRIGGER_CHANNEL_Name").addTopic(
  topic("node").type<{ 
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);