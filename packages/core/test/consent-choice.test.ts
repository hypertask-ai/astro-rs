import { describe, expect, it } from "@effect/vitest";

import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  allowsAnalytics,
  clearedAnalyticsDomains,
  consentCookie,
  expiredCookie,
  isAnalyticsKey,
  parseConsentCookie,
  sharedCookieDomain,
} from "../src/consent.js";
import oldCookieHeaders from "./fixtures/old-cookie-consent.json" with { type: "json" };

const sixMonthsInSeconds = 180 * 86_400;

describe("consent cookie memory", () => {
  it("reads the stored choice from the cookie header", () => {
    expect(parseConsentCookie("theme=dark; ht_cookie_consent=all")).toBe("all");
    expect(parseConsentCookie("ht_cookie_consent=essential")).toBe("essential");
    expect(parseConsentCookie("ht_cookie_consent=")).toBeUndefined();
    expect(parseConsentCookie("ht_cookie_consent=maybe")).toBeUndefined();
    expect(parseConsentCookie("theme=dark")).toBeUndefined();
    expect(parseConsentCookie()).toBeUndefined();
  });

  it("names the cookie the app and the old site read", () => {
    expect(CONSENT_COOKIE).toBe("ht_cookie_consent");
    expect(CONSENT_MAX_AGE_SECONDS).toBe(sixMonthsInSeconds);
  });

  it("writes the old cookie header byte for byte", () => {
    expect(consentCookie("all", "hypertask.ai")).toBe(
      oldCookieHeaders.consent.allOnSharedDomain
    );
    expect(consentCookie("essential", "app.hypertask.ai")).toBe(
      oldCookieHeaders.consent.essentialOnSharedDomain
    );
    expect(consentCookie("all", "astro-rs.pages.dev")).toBe(
      oldCookieHeaders.consent.allOnOtherHost
    );
    expect(consentCookie("essential", "localhost")).toBe(
      oldCookieHeaders.consent.essentialOnOtherHost
    );
  });

  it("expires an old analytics cookie with the header the old site wrote", () => {
    expect(expiredCookie("ph_phc_example")).toBe(
      oldCookieHeaders.cleared.hostOnly
    );
    expect(expiredCookie("ph_phc_example", "hypertask.ai")).toBe(
      oldCookieHeaders.cleared.hostDomain
    );
    expect(expiredCookie("ph_phc_example", ".hypertask.ai")).toBe(
      oldCookieHeaders.cleared.sharedDomain
    );
  });

  it("shares the cookie with hypertask.ai subdomains only", () => {
    expect(sharedCookieDomain("hypertask.ai")).toBe(".hypertask.ai");
    expect(sharedCookieDomain("app.hypertask.ai")).toBe(".hypertask.ai");
    expect(sharedCookieDomain("hypertask.ai.example")).toBeUndefined();
    expect(sharedCookieDomain("astro-rs.pages.dev")).toBeUndefined();
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
  });
});
