import { describe, expect, it } from "@effect/vitest";

import {
  CONSENT_MAX_AGE_SECONDS,
  allowsAnalytics,
  clearedAnalyticsDomains,
  consentCookie,
  expiredCookie,
  isAnalyticsKey,
  parseConsentCookie,
} from "../src/consent.js";

describe("consent cookie memory", () => {
  it("reads the stored choice from the cookie header", () => {
    expect(parseConsentCookie("theme=dark; ht_cookie_consent=all")).toBe("all");
    expect(parseConsentCookie("ht_cookie_consent=essential")).toBe("essential");
    expect(parseConsentCookie("ht_cookie_consent=")).toBeUndefined();
    expect(parseConsentCookie("ht_cookie_consent=maybe")).toBeUndefined();
    expect(parseConsentCookie("theme=dark")).toBeUndefined();
    expect(parseConsentCookie()).toBeUndefined();
  });

  it("writes the shared cookie for six months", () => {
    const cookie = consentCookie("all", "hypertask.ai");

    expect(cookie).toContain("ht_cookie_consent=all");
    expect(cookie).toContain(`Max-Age=${CONSENT_MAX_AGE_SECONDS}`);
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("Domain=.hypertask.ai");
  });

  it("shares the cookie with hypertask.ai subdomains only", () => {
    expect(consentCookie("essential", "app.hypertask.ai")).toContain(
      "Domain=.hypertask.ai"
    );
    expect(consentCookie("essential", "hypertask.ai.example")).not.toContain(
      "Domain="
    );
  });
});

describe("analytics gate", () => {
  it("opens only for the all choice", () => {
    expect(allowsAnalytics("all")).toBe(true);
    expect(allowsAnalytics("essential")).toBe(false);
    expect(allowsAnalytics()).toBe(false);
  });

  it("names the analytics keys the old scripts cleared", () => {
    for (const key of [
      "ph_phc_key",
      "__ph_debug",
      "posthog_hypertask",
      "_fbp",
      "_fbc",
      "utm_source",
      "ip",
      "userAgent",
    ]) {
      expect(isAnalyticsKey(key)).toBe(true);
    }

    for (const key of ["ht_cookie_consent", "theme", "sidebar"]) {
      expect(isAnalyticsKey(key)).toBe(false);
    }
  });

  it("clears the host and the shared domain cookies", () => {
    expect(clearedAnalyticsDomains("hypertask.ai")).toStrictEqual([
      "hypertask.ai",
      ".hypertask.ai",
    ]);
    expect(clearedAnalyticsDomains("help.hypertask.ai")).toStrictEqual([
      "help.hypertask.ai",
      ".hypertask.ai",
    ]);
    expect(clearedAnalyticsDomains("localhost")).toStrictEqual(["localhost"]);
    expect(expiredCookie("ph_key")).toContain("Max-Age=0");
    expect(expiredCookie("ph_key", ".hypertask.ai")).toContain(
      "Domain=.hypertask.ai"
    );
  });
});
