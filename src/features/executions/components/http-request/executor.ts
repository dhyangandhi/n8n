import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HTTPRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HTTPRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  if (!data.endpoint?.trim()) {
    throw new NonRetriableError(
      "HTTP Request node: No endpoint configured"
    );
  }

  const variableName =
    data.variableName?.trim() || `http_${nodeId}`;

  const stepResult = await step.run(
    `http_request_${nodeId}`,
    async () => {
      const method = data.method || "GET";

      const options: KyOptions = {
        method,
      };

      if (
        ["POST", "PUT", "PATCH"].includes(method)
      ) {
        options.body = data.body || "";

        options.headers = {
          "Content-Type": "application/json",
        };
      }

      const response = await ky(
        data.endpoint!,
        options
      );

      const contentType =
        response.headers.get("content-type") || "";

      const responseData =
        contentType.includes("application/json")
          ? await response.json()
          : await response.text();

      return {
        ...context,
        [variableName]: {
          httpResponse: {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          },
        },
      };
    }
  );

  return stepResult;
};