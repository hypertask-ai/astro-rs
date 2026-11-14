export {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  ConsentChoiceSchema,
  SHARED_COOKIE_DOMAIN,
  allowsAnalytics,
  clearedAnalyticsDomains,
  consentCookie,
  expiredCookie,
  isAnalyticsKey,
  parseConsentCookie,
  sharedCookieDomain,
  type ConsentChoice,
} from "./consent-choice.js";

export {
  ConsentStore,
  consentMachine,
  runConsentMachine,
  type ConsentState,
} from "./consent-machine.js";
