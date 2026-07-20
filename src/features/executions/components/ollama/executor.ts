import "server-only";

import type { NodeExecutor } from "@/features/executions/types";
import * as Handlebars from "handlebars";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(
    JSON.stringify(context, null, 2)
  );
});

type OLLAMAData = {
  variableName: string;
  credentialId: string;
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
  if (!data.credentialId) {
    throw new NonRetriableError(
      "OPENROUTER node: Credential is required"
    );
  }

  const credential = await step.run(
    `credential_${data.credentialId}`,
    async () => {
      return prisma.credential.findUnique({
        where: {
          id: data.credentialId,
        },
      });
    }
  );

  if (!credential) {
    throw new NonRetriableError(
      "OPENROUTER node: Credential not found"
    );
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful AI assistant.";

  const userPrompt = data.userPrompt
    ? Handlebars.compile(data.userPrompt)(context)
    : "";

  const openrouter = createOpenAI({
    apiKey: credential.value,
    baseURL:
      process.env.OPENROUTER_BASE_URL ??
      "https://openrouter.ai/api/v1",
  });

  try {
    const result = await step.run(
      `openrouter_${nodeId}`,
      async () => {
        console.log("Credential:", credential.name);
        console.log("Model:", data.model);
        console.log("System:", systemPrompt);
        console.log("Prompt:", userPrompt);

        const response = await generateText({
          model: openrouter(
            data.model ??
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
        text: result,
        aiResponse: result,
      },
    };
  } catch (err) {
    console.error("OPENROUTER ERROR:", err);

    throw new NonRetriableError(
      err instanceof Error
        ? err.message
        : "Failed to generate response."
    );
  }
};