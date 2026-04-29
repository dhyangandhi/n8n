import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString)

  return safeString;
});
type HTTPRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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
  if (!data.variableName) {
    throw new NonRetriableError("Variable name not configured")
  }
  if (!data.method) {
    throw new NonRetriableError("Method not configured")
  }
  const variableName =
    data.variableName?.trim() || `http_${nodeId}`;

  const stepResult = await step.run(
    `http_request_${nodeId}`,
    async () => {
      const method = data.method;
      const endpoint = Handlebars.compile(data.endpoint)(context);
      console.log("ENDPOINT", { endpoint })
      const options: KyOptions = {
        method,
      };

      if (
        ["POST", "PUT", "PATCH"].includes(method)
      ) {
        const resloved = Handlebars.compile(data.body || "{}")(context);
        console.log("BODY: ", resloved);
        JSON.parse(resloved);
        options.body = resloved;
        options.headers = {
          "Content-Type": "application/json",
        };
      }

      const response = await ky(
        data.endpoint,
        options
      );

      const contentType =
        response.headers.get("content-type") || "";

      const responseData =
        contentType.includes("application/json")
          ? await response.json()
          : await response.text();
        const responsePayload = {
          httpRequest: {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          },
        };
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