import type { ConsentChoice } from "../../consent/index.js";

export type AnalyticsMode = "full" | "off";

export const analyticsMode = (choice?: ConsentChoice): AnalyticsMode =>
  choice === "all" ? "full" : "off";

export const allowsEvent = (mode: AnalyticsMode): boolean => mode === "full";
