import { describe, expect, it } from "@effect/vitest";

import { allowsEvent, analyticsMode } from "../src/client/analytics/gate.js";
import {
  POSTHOG_TOKEN,
  capturePayload,
} from "../src/client/analytics/payload.js";

describe("analytics consent gate", () => {
  it("counts page views and leaves before the visitor chooses", () => {
    expect(analyticsMode()).toBe("pageview");
    expect(allowsEvent("pageview", "$pageview")).toBe(true);
    expect(allowsEvent("pageview", "$pageleave")).toBe(true);
  });

  it("counts nothing after the visitor chooses essential only", () => {
    expect(analyticsMode("essential")).toBe("off");
    expect(allowsEvent("off", "$pageview")).toBe(false);
    expect(allowsEvent("off", "$pageleave")).toBe(false);
    expect(allowsEvent("off", "hp-install-copy")).toBe(false);
  });

  it("counts page views, leaves, clicks and the install copy after yes", () => {
    expect(analyticsMode("all")).toBe("full");
    for (const event of [
      "$pageview",
      "$pageleave",
      "$autocapture",
      "hp-install-copy",
      "hp-install-tab",
    ]) {
      expect(allowsEvent("full", event)).toBe(true);
    }
  });

  it("sends before consent only the two page events", () => {
    expect(allowsEvent("pageview", "$autocapture")).toBe(false);
    expect(allowsEvent("pageview", "hp-install-copy")).toBe(false);
  });
});

describe("PostHog capture payload", () => {
  it("keeps the old project token and event shape", () => {
    expect(
      capturePayload({
        distinctId: "visitor-1",
        event: "$pageview",
        properties: { $pathname: "/" },
        timestamp: "2026-11-14T00:00:00.000Z",
      })
    ).toStrictEqual({
      api_key: POSTHOG_TOKEN,
      distinct_id: "visitor-1",
      event: "$pageview",
      properties: { $pathname: "/" },
      timestamp: "2026-11-14T00:00:00.000Z",
    });
  });
});
