import type { ConsentChoice } from "../../consent/index.js";

export type AnalyticsMode = "pageviews" | "full" | "off";

export const analyticsMode = (choice?: ConsentChoice): AnalyticsMode =>
  choice === "all" ? "full" : choice === "essential" ? "off" : "pageviews";

export const allowsPageCount = (mode: AnalyticsMode): boolean =>
  mode === "pageviews" || mode === "full";

export const allowsEvent = (mode: AnalyticsMode): boolean => mode === "full";
