"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { inngest } from "@/inngest/client";
import { ollamaChannel } from "@/inngest/channels/ollama";

export type OLLAMAtToken = Realtime.Token<
  typeof ollamaChannel,
  any
>;

export async function fetchOLLAMARealtimeToken(): Promise<OLLAMAtToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: ollamaChannel(),
    topics: ["node"],
  });
  
  return token;
}