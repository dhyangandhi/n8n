import prisma from "@/lib/db";
import { inngest } from "./client";
import { Ollama } from "ollama";
import * as Sentry from "@sentry/nextjs"; // ✅ Import Sentry

const ollama = new Ollama({
  host: "http://192.168.0.144:11434",
});

export const execute = inngest.createFunction(
  {
    id: "execute-ai",
    triggers: [{ event: "execute/ai" }],
  },
  async ({ event, step }) => {
    const { prompt, recordId } = event.data;

    if (!prompt) throw new Error("No prompt");

    // 1. Ask Ollama (Wrapped in Sentry!)
    const result = await step.run("generate-ai-response", async () => {
      
      // ✅ Wrap the AI call so Sentry tracks it as an LLM operation
      return await Sentry.startSpan(
        {
          name: "Ollama Qwen2.5 Generate",
          op: "ai.pipeline.step", // This tells Sentry it's an AI task
        },
        async () => {
          const response = await ollama.generate({
            model: "qwen2.5-coder:latest",
            prompt,
          });
          return response.response;
        }
      );

    });

    // 2. Save to Database
    await step.run("update-database", async () => {
      await prisma.aiResult.update({
        where: { id: recordId },
        data: {
          result,
          status: "done",
        },
      });
    });

    return { result };
  }
);