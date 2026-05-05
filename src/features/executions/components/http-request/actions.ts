"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { inngest } from "@/inngest/client";

export type HttpRequestToken = Realtime.Token<
  any,
  ["node"]
>;

export async function fetchHttpRequestRealtimeToken(): Promise<HttpRequestToken> {
  return await getSubscriptionToken(inngest, {
    channel: httpRequestChannel as any,
    topics: ["node"],
  });
}