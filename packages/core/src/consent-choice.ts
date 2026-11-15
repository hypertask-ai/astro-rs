import { Schema } from "effect";

export const ConsentChoiceSchema = Schema.Literals(["all", "essential"]);

export type ConsentChoice = typeof ConsentChoiceSchema.Type;

export const CONSENT_COOKIE = "ht_cookie_consent";

export const CONSENT_MAX_AGE_SECONDS = 15_552_000;

export const SHARED_COOKIE_DOMAIN = ".hypertask.ai";

const analyticsKeyPattern =
  /^(?:ph_|__ph_|posthog_hypertask|_fbp$|_fbc$|utm_|ip$|userAgent$)/u;

export const allowsAnalytics = (choice?: ConsentChoice): boolean =>
  choice === "all";

export const isAnalyticsKey = (name: string): boolean =>
  analyticsKeyPattern.test(name);

export const parseConsentCookie = (
  cookie?: string
): ConsentChoice | undefined => {
  if (cookie === undefined) {
    return undefined;
  }

  for (const pair of cookie.split(";")) {
    const entry = pair.trim();

    if (!entry.startsWith(`${CONSENT_COOKIE}=`)) {
      continue;
    }

    const value = entry.slice(CONSENT_COOKIE.length + 1);

    return value === "all" || value === "essential" ? value : undefined;
  }

  return undefined;
};

export const sharedCookieDomain = (hostname: string): string | undefined =>
  hostname === "hypertask.ai" || hostname.endsWith(".hypertask.ai")
    ? SHARED_COOKIE_DOMAIN
    : undefined;

export const consentCookie = (
  choice: ConsentChoice,
  hostname: string
): string => {
  const domain = sharedCookieDomain(hostname);

  return [
    `${CONSENT_COOKIE}=${choice}`,
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
    "Secure",
    ...(domain === undefined ? [] : [`Domain=${domain}`]),
  ].join("; ");
};

export const expiredCookie = (name: string, domain?: string): string =>
  [
    `${name}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
    "Secure",
    ...(domain === undefined ? [] : [`Domain=${domain}`]),
  ].join("; ");

export const clearedAnalyticsDomains = (hostname: string): string[] => {
  const shared = sharedCookieDomain(hostname);

  return shared === undefined ? [hostname] : [hostname, shared];
};
