import type { NodeExecutor } from "@/features/exections/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HTTpRequestData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
};

export const httpRequestExecutor: NodeExecutor<HTTpRequestData> = async ({
    data,
    nodeId,
    context,
    step,
}) => {
    if (!data.endpoint) {
        throw new NonRetriableError("HTTP Request node: No endpoint configured");
    }

    // Renamed to 'stepResult' to avoid confusion with the HTTP response
    const stepResult = await step.run("http_request", async () => {
        const method = data.method || "GET";
        const endpoint = data.endpoint!;
        const options: KyOptions = { method };

        if (["POST", "PUT", "PATCH"].includes(method)) {
            options.body = data.body;
        }
        
        // Renamed to 'kyResponse'
        const kyResponse = await ky(endpoint, options);
        
        // FIX 1: "content-type" was misspelled as "context-type"
        const contentType = kyResponse.headers.get("content-type");
        
        // FIX 2: Use the instance (kyResponse), not the global Response class
        const responseData = contentType?.includes("application/json")
            ? await kyResponse.json()
            : await kyResponse.text();
            
        return {
            ...context,
            httpResponse: {
                status: kyResponse.status,
                statusText: kyResponse.statusText,
                data: responseData,
            }
        }
    });

    // FIX 3: Access the nested httpResponse object from stepResult
    return {
        status: stepResult.httpResponse.status,
        // Since 'ok' isn't explicitly returned from step.run, we calculate it here
        ok: stepResult.httpResponse.status >= 200 && stepResult.httpResponse.status < 300,
        // body: stepResult.httpResponse.data, 
    };
};