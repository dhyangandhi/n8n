import "server-only";

import type { NodeExecutor } from "@/features/executions/types";
import * as Handlebars from "handlebars";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(
    JSON.stringify(context, null, 2)
  );
});

type OLLAMAData = {
  variableName: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const OLLAMAExecutor: NodeExecutor<OLLAMAData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful AI assistant.";

  const userPrompt = data.userPrompt
    ? Handlebars.compile(data.userPrompt)(context)
    : "";

  const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL:
      process.env.OPENROUTER_BASE_URL ||
      "https://openrouter.ai/api/v1",
  });

  try {
    const result = await step.run(
      `openrouter_${nodeId}`,
      async () => {
        console.log("SYSTEM:", systemPrompt);
        console.log("PROMPT:", userPrompt);

        const response = await generateText({
          model: openrouter(
            data.model ||
            "nvidia/llama-3.1-nemotron-ultra-253b-v1:free"
          ),
          system: systemPrompt,
          prompt: userPrompt,
        });

        return response.text;
      }
    );

    return {
      ...context,
      [data.variableName]: {
        aiResponse: result,
      },
    };
  } catch (error) {
    console.error("OPENROUTER ERROR:", error);

    return {
      ...context,
      [data.variableName]: {
        aiResponse: "Failed to generate response.",
      },
    };
  }
};