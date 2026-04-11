import prisma from "@/lib/db";
import { inngest } from "./client";
import { Ollama } from "ollama";

const ollama = new Ollama({
  host: "http://192.168.0.144:11434",
});

export const execute = inngest.createFunction(
  {
    id: "execute-ai",
    triggers: [{ event: "execute/ai" }],
  },
  async ({ event }: any) => {
    const { prompt, recordId } = event.data;

    if (!prompt) throw new Error("No prompt");

    const response = await ollama.generate({
      model: "qwen2.5-coder:latest",
      prompt,
    });

    const result = response.response;

    await prisma.aiResult.update({
      where: { id: recordId },
      data: {
        result,
        status: "done",
      },
    });

    return { result };
  }
);