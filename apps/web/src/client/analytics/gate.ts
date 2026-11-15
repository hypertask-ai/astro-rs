import type { ConsentChoice } from "../../consent/index.js";

export type AnalyticsMode = "pageviews" | "full" | "off";

export const analyticsMode = (choice?: ConsentChoice): AnalyticsMode => {
  if (choice === "all") {
    return "full";
  }

  if (choice === "essential") {
    return "off";
  }

  return "pageviews";
};

export const allowsPageCount = (mode: AnalyticsMode): boolean =>
  mode === "pageviews" || mode === "full";

export const allowsEvent = (mode: AnalyticsMode): boolean => mode === "full";
