import "server-only";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import * as Handlebars from "handlebars";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(
    JSON.stringify(context, null, 2)
  );
});

type HTTPRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<
  HTTPRequestData
> = async ({
  data,
  nodeId,
  context,
  step,
}) => {

  if (!data.endpoint) {
    throw new NonRetriableError(
      "HTTP Request node: No endpoint configured"
    );
  }

  if (!data.variableName) {
    throw new NonRetriableError(
      "Variable name not configured"
    );
  }

  if (!data.method) {
    throw new NonRetriableError(
      "Method not configured"
    );
  }

  try {

    const result = await step.run(
      `http_request_${nodeId}`,

      async () => {

        const endpoint = Handlebars
          .compile(data.endpoint)(context);

        console.log(
          "HTTP ENDPOINT:",
          endpoint
        );

        const options: KyOptions = {

          method: data.method,

          timeout: 30000,

          retry: {
            limit: 1,
          },

          headers: {
            "Content-Type":
              "application/json",
          },
        };

        if (
          ["POST", "PUT", "PATCH"]
            .includes(data.method)
        ) {

          const resolvedBody =
            Handlebars.compile(
              data.body || "{}"
            )(context);

          try {

            options.json =
              JSON.parse(resolvedBody);

          } catch {

            throw new NonRetriableError(
              "Invalid JSON body"
            );
          }
        }

        console.log(
          "HTTP REQUEST:",
          data.method,
          endpoint
        );

        const response = await ky(
          endpoint,
          options
        );

        console.log(
          "HTTP RESPONSE:",
          response.status,
          response.statusText
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let responseData: unknown;

        try {

          responseData =
            contentType.includes(
              "application/json"
            )
              ? await response.json()
              : await response.text();

        } catch {

          responseData =
            "Failed to parse response";
        }

        return {
          ...context,

          [data.variableName]: {
            httpRequest: {

              status: response.status,

              statusText:
                response.statusText,

              data: responseData,
            },
          },
        };
      }
    );

    return result;

  } catch (error) {

    console.error(
      "HTTP REQUEST EXECUTOR ERROR:",
      error
    );

    if (error instanceof Error) {

      throw new NonRetriableError(
        error.message
      );
    }

    throw new NonRetriableError(
      "Unknown HTTP request error"
    );
  }
};
