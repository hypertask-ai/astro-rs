import type { ConsentChoice } from "../../consent/index.js";

export type AnalyticsMode = "full" | "pageview" | "off";

const PAGE_EVENTS = new Set(["$pageleave", "$pageview"]);

export const analyticsMode = (choice?: ConsentChoice): AnalyticsMode => {
  if (choice === "all") {
    return "full";
  }

  return choice === "essential" ? "off" : "pageview";
};

export const allowsEvent = (mode: AnalyticsMode, event: string): boolean =>
  mode === "full" || (mode === "pageview" && PAGE_EVENTS.has(event));
