import { channel, topic } from "@inngest/realtime";

export const OLLAMA_CHANNEL_Name = "gemini-execution";

export const ollamaChannel = channel("OLLAMA_CHANNEL_Name")
  .addTopic(
    topic("node").type<{ 
      nodeId: string;
      status: "loading" | "success" | "error";
    }>()
  )