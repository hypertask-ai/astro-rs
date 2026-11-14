const projectToken = String(import.meta.env.VITE_POSTHOG_TOKEN ?? "");

export const POSTHOG_TOKEN = projectToken;

export const ANALYTICS_ID_KEY = "ph_ht_analytics_id";

export const RELAY_URL = "/relay-8ddg/e/";

export interface CaptureInput {
  readonly distinctId: string;
  readonly event: string;
  readonly properties: Readonly<Record<string, unknown>>;
  readonly timestamp: string;
}

export const capturePayload = (input: CaptureInput) => ({
  api_key: POSTHOG_TOKEN,
  distinct_id: input.distinctId,
  event: input.event,
  properties: input.properties,
  timestamp: input.timestamp,
});
