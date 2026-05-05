import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

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
  publish,
}) => {
  // Fix 1: Access the topic as a property rather than calling the channel as a function
  await publish({
    channel: httpRequestChannel.name,
    topic: "node", // Emitting to the "node" topic you defined
    data: {
      nodeId,
      status: "loading",
    },
  });

  if (!data.endpoint) {
    await publish({
      channel: httpRequestChannel.name,
      topic: "node",
      data: {
        nodeId,
        status: "error",
      },
    });
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  if (!data.variableName) {
    await publish({
      channel: httpRequestChannel.name,
      topic: "node",
      data: {
        nodeId,
        status: "error",
      },
    });
    throw new NonRetriableError("Variable name not configured");
  }

  if (!data.method) {
    await publish({
      channel: httpRequestChannel.name,
      topic: "node",
      data: {
        nodeId,
        status: "error",
      },
    });
    throw new NonRetriableError("Method not configured");
  }
  try {
  const result = await step.run("http_request", async () => {
    const method = data.method;
    const endpoint = Handlebars.compile(data.endpoint)(context);
    console.log("ENDPOINT", { endpoint });
    
    const options: KyOptions = {
      method,
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolved = Handlebars.compile(data.body || "{}")(context);
      JSON.parse(resolved); // This will safely throw within the step if JSON is invalid
      options.body = resolved;
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await ky(endpoint, options);

    const contentType = response.headers.get("content-type");

    const responseData = contentType?.includes("application/json")
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
      [data.variableName]: responsePayload,
    };
  });

  await publish({
    channel: httpRequestChannel.name,
    topic: "node",
    data: {
      nodeId,
      status: "success",
    },
  });

  return result;
} catch (error) {
  await publish({
    channel: httpRequestChannel.name,
    topic: "node",
    data: {
      nodeId,
      status: "error",
    },
  });
  throw error; // Re-throw the error to ensure the workflow step is marked as failed
}
};