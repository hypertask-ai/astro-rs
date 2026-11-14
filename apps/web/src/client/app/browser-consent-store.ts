import { Effect, Layer } from "effect";

import {
  ConsentStore,
  allowsAnalytics,
  clearedAnalyticsDomains,
  consentCookie,
  expiredCookie,
  isAnalyticsKey,
  parseConsentCookie,
} from "../../consent/index.js";
import type { ConsentChoice } from "../../consent/index.js";

const clearAnalytics = (): void => {
  for (const open of [() => localStorage, () => sessionStorage]) {
    try {
      const storage = open();

      for (const key of Object.keys(storage)) {
        if (isAnalyticsKey(key)) {
          storage.removeItem(key);
        }
      }
    } catch {
      continue;
    }
  }

  const domains = clearedAnalyticsDomains(location.hostname);

  for (const entry of document.cookie.split(";")) {
    const [name] = entry.trim().split("=");

    if (name === undefined || !isAnalyticsKey(name)) {
      continue;
    }

    // oxlint-disable-next-line unicorn/no-document-cookie -- The shared first-party consent and analytics cookies are plain document cookies today.
    document.cookie = expiredCookie(name);

    for (const domain of domains) {
      // oxlint-disable-next-line unicorn/no-document-cookie -- Clearing the shared cookie needs the same Domain attribute the old site used.
      document.cookie = expiredCookie(name, domain);
    }
  }
};

const announce = (choice: ConsentChoice | undefined): void => {
  document.dispatchEvent(
    new CustomEvent("ht:consent", {
      detail: { analytics: allowsAnalytics(choice) },
    })
  );
};

const consentStore = ConsentStore.of({
  clearAnalytics: Effect.sync(clearAnalytics),
  // oxlint-disable-next-line unicorn/no-document-cookie -- The stored choice lives in the same first-party cookie the app and the old site read.
  read: Effect.sync(() => parseConsentCookie(document.cookie)),
  save: (choice: ConsentChoice) =>
    Effect.sync(() => {
      // oxlint-disable-next-line unicorn/no-document-cookie -- The app and the old site read this exact first-party cookie, so its format and Domain must not change.
      document.cookie = consentCookie(choice, location.hostname);
      announce(choice);
    }),
});

export const BrowserConsentStore = {
  layer: Layer.succeed(ConsentStore, consentStore),
};
