// /app/api/stream/route.ts

let clients: ReadableStreamDefaultController[] = [];

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.push(controller);

      console.log("✅ Client connected");

      controller.enqueue(`data: ${JSON.stringify({ status: "connected" })}\n\n`);
    },
    cancel() {
      clients = clients.filter((c) => c !== controller);
      console.log("❌ Client disconnected");
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// helper to send events
export function sendToClients(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;

  clients.forEach((client) => {
    try {
      client.enqueue(message);
    } catch {
      // ignore dead clients
    }
  });
}