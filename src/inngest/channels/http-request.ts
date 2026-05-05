import { channel, topic } from "@inngest/realtime";

export const HTTP_REQUEST_CHANNEL_Name = "http-request-execution";

export const httpRequestChannel = channel("HTTP_REQUEST_CHANNEL_Name").addTopic(
  topic("node").type<{ 
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);