import { randomBytesUnsafe } from "effect/crypto/SecureRandom";

import { parseConsentCookie } from "../../consent/index.js";
import { analyticsMode, allowsEvent } from "./gate.js";
import type { AnalyticsMode } from "./gate.js";
import { ANALYTICS_ID_KEY, RELAY_URL, capturePayload } from "./payload.js";

const ignore = (): void => undefined;

const readChoice = () =>
  // oxlint-disable-next-line unicorn/no-document-cookie -- The shared consent cookie is the only cross-subdomain source of the visitor's choice.
  parseConsentCookie(document.cookie);

const readStoredId = (): string | undefined => {
  try {
    return localStorage.getItem(ANALYTICS_ID_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

const rememberId = (id: string): void => {
  try {
    localStorage.setItem(ANALYTICS_ID_KEY, id);
  } catch {
    ignore();
  }
};

const forgetId = (): void => {
  try {
    localStorage.removeItem(ANALYTICS_ID_KEY);
  } catch {
    ignore();
  }
};

const oneLine = (value: string): string =>
  value.replaceAll(/\s+/gu, " ").trim().slice(0, 120);

const currentUrl = (): string => location.href;

const newId = (): string => {
  const bytes = randomBytesUnsafe(16);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

const referringDomain = (referrer: string): string => {
  try {
    return new URL(referrer).hostname;
  } catch {
    return "$direct";
  }
};

const pageProperties = () => {
  const { referrer } = document;

  return {
    $current_url: currentUrl(),
    $host: location.host,
    $pathname: location.pathname,
    $referrer: referrer === "" ? "$direct" : referrer,
    $referring_domain: referringDomain(referrer),
  };
};

const send = (body: string): void => {
  try {
    navigator.sendBeacon(
      RELAY_URL,
      new Blob([body], { type: "application/json" })
    );
  } catch {
    ignore();
  }
};

export const startAnalytics = (): void => {
  let mode: AnalyticsMode = analyticsMode(readChoice());

  let distinctId: string | undefined;

  let lastUrl = "";

  let leaveSent = false;

  const visitorId = (): string => {
    if (distinctId === undefined) {
      distinctId = readStoredId() ?? newId();

      if (mode === "full") {
        rememberId(distinctId);
      }
    }

    return distinctId;
  };

  const emit = (
    event: string,
    properties: Readonly<Record<string, string>> = {}
  ): void => {
    if (!allowsEvent(mode)) {
      return;
    }

    send(
      JSON.stringify(
        capturePayload({
          distinctId: visitorId(),
          event,
          properties: { ...pageProperties(), ...properties },
        })
      )
    );
  };

  const capturePageView = (): void => {
    if (!allowsEvent(mode)) {
      return;
    }

    const url = currentUrl();

    if (lastUrl === url) {
      return;
    }

    lastUrl = url;
    leaveSent = false;

    emit("$pageview");
  };

  const capturePageLeave = (): void => {
    if (!allowsEvent(mode) || leaveSent) {
      return;
    }

    leaveSent = true;

    emit("$pageleave");
  };

  const syncChoice = (): void => {
    const next = analyticsMode(readChoice());

    if (next === mode) {
      return;
    }

    mode = next;

    if (mode === "off") {
      distinctId = undefined;
      lastUrl = "";
      leaveSent = false;
      forgetId();

      return;
    }

    capturePageView();
  };

  document.addEventListener("click", (event) => {
    if (!allowsEvent(mode)) {
      return;
    }

    const target =
      event.target instanceof Element
        ? event.target.closest("[data-ph-capture], a, button")
        : null;

    if (target === null) {
      return;
    }

    const text = oneLine(target.textContent ?? "");

    const custom =
      target instanceof HTMLElement ? target.dataset.phCapture : undefined;

    if (custom !== undefined) {
      emit(custom, { $el_text: text });

      return;
    }

    emit("$autocapture", { $el_text: text, $event_type: "click" });
  });

  document.addEventListener("ht:consent", syncChoice);
  window.addEventListener("focus", syncChoice);
  window.addEventListener("pagehide", capturePageLeave);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      capturePageLeave();

      return;
    }

    leaveSent = false;

    syncChoice();
  });

  capturePageView();
};
