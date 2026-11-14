import { describe, expect, it } from "@effect/vitest";

import {
  allowsEvent,
  allowsPageCount,
  analyticsMode,
} from "../src/client/analytics/gate.js";
import {
  POSTHOG_TOKEN,
  capturePayload,
} from "../src/client/analytics/payload.js";

describe("analytics consent gate", () => {
  it("counts page views and leaves, nothing else, before the visitor chooses", () => {
    const mode = analyticsMode();

    expect(mode).toBe("pageviews");
    expect(allowsPageCount(mode)).toBe(true);
    expect(allowsEvent(mode)).toBe(false);
  });

  it("counts nothing after the visitor chooses essential only", () => {
    const mode = analyticsMode("essential");

    expect(mode).toBe("off");
    expect(allowsPageCount(mode)).toBe(false);
    expect(allowsEvent(mode)).toBe(false);
  });

  it("counts every event after the visitor chooses all", () => {
    const mode = analyticsMode("all");

    expect(mode).toBe("full");
    expect(allowsPageCount(mode)).toBe(true);
    expect(allowsEvent(mode)).toBe(true);
  });
});

describe("PostHog capture payload", () => {
  it("builds the capture shape with the configured token", () => {
    expect(
      capturePayload({
        distinctId: "visitor-1",
        event: "$pageview",
        properties: { $pathname: "/" },
      })
    ).toStrictEqual({
      api_key: POSTHOG_TOKEN,
      distinct_id: "visitor-1",
      event: "$pageview",
      properties: { $pathname: "/" },
    });
  });

  it("keeps the install-copy click as its own event", () => {
    expect(
      capturePayload({
        distinctId: "visitor-1",
        event: "hp-install-copy",
        properties: { $event_type: "click" },
      }).event
    ).toBe("hp-install-copy");
  });
});
