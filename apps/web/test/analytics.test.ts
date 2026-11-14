import { describe, expect, it } from "@effect/vitest";

import { allowsEvent, analyticsMode } from "../src/client/analytics/gate.js";
import {
  POSTHOG_TOKEN,
  capturePayload,
} from "../src/client/analytics/payload.js";

describe("analytics consent gate", () => {
  it("counts nothing before the visitor chooses", () => {
    expect(analyticsMode()).toBe("off");
    expect(allowsEvent("off")).toBe(false);
  });

  it("counts nothing after the visitor chooses essential only", () => {
    expect(analyticsMode("essential")).toBe("off");
    expect(allowsEvent("off")).toBe(false);
  });

  it("counts every event after the visitor chooses all", () => {
    expect(analyticsMode("all")).toBe("full");
    expect(allowsEvent("full")).toBe(true);
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
        properties: { $el_text: "Copy" },
      }).event
    ).toBe("hp-install-copy");
  });
});
