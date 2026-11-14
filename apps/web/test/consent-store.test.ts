import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { afterEach, beforeEach, vi } from "vitest";

import { BrowserConsentStore } from "../src/client/app/browser-consent-store.js";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  runConsentMachine,
} from "../src/consent/index.js";
import type { ConsentChoice } from "../src/consent/index.js";

interface JarCookie {
  readonly attributes: ReadonlyMap<string, string>;
  readonly domain: string;
  readonly name: string;
  readonly value: string;
}

const host = "hypertask.ai";

const makeJar = () => {
  const cookies = new Map<string, JarCookie>();

  const write = (header: string): void => {
    const [pair = "", ...parts] = header.split(";").map((part) => part.trim());
    const separator = pair.indexOf("=");
    const name = pair.slice(0, separator);
    const value = pair.slice(separator + 1);
    const attributes = new Map<string, string>();

    for (const part of parts) {
      const [key = "", ...rest] = part.split("=");

      attributes.set(key.toLowerCase(), rest.join("="));
    }

    const domain = attributes.get("domain") ?? host;
    const key = `${name}@${domain}`;

    if (attributes.get("max-age") === "0") {
      cookies.delete(key);
    } else {
      cookies.set(key, { attributes, domain, name, value });
    }
  };

  const read = (): string =>
    [...cookies.values()]
      .flatMap((cookie) =>
        cookie.domain === host || cookie.domain === `.${host}`
          ? [`${cookie.name}=${cookie.value}`]
          : []
      )
      .join("; ");

  const seed = (name: string, domain: string, value: string): void => {
    cookies.set(`${name}@${domain}`, {
      attributes: new Map(),
      domain,
      name,
      value,
    });
  };

  const find = (name: string): JarCookie | undefined =>
    [...cookies.values()].find((cookie) => cookie.name === name);

  const names = (): readonly string[] =>
    [...cookies.values()].map((cookie) => cookie.name).toSorted();

  return { find, names, read, seed, write };
};

const makeStorage = (initial: Readonly<Record<string, string>>) => {
  const storage = { ...initial };

  Object.defineProperty(storage, "removeItem", {
    enumerable: false,
    value: (key: string): void => {
      Reflect.deleteProperty(storage, key);
    },
  });

  return storage;
};

interface Browser {
  readonly events: CustomEvent<{ readonly analytics: boolean }>[];
  readonly jar: ReturnType<typeof makeJar>;
  readonly local: Record<string, string>;
  readonly session: Record<string, string>;
}

const installBrowser = (): Browser => {
  const jar = makeJar();
  const events: CustomEvent<{ readonly analytics: boolean }>[] = [];

  const local = makeStorage({
    keep_theme: "dark",
    ph_legacy: "legacy",
    posthog_hypertask: "legacy",
  });

  const session = makeStorage({ __ph_session: "legacy" });

  jar.seed("ph_legacy", `.${host}`, "legacy");
  jar.seed("_fbp", `.${host}`, "legacy");
  jar.seed("ph_host_only", host, "legacy");
  jar.seed("theme", `.${host}`, "dark");

  vi.stubGlobal("document", {
    get cookie(): string {
      return jar.read();
    },
    set cookie(header: string) {
      jar.write(header);
    },
    dispatchEvent: (
      event: CustomEvent<{ readonly analytics: boolean }>
    ): boolean => {
      events.push(event);

      return true;
    },
  });
  vi.stubGlobal("location", { hostname: host });
  vi.stubGlobal("localStorage", local);
  vi.stubGlobal("sessionStorage", session);

  return { events, jar, local, session };
};

const runChoice = (choose?: ConsentChoice) =>
  runConsentMachine(choose).pipe(Effect.provide(BrowserConsentStore.layer));

describe("browser consent store", () => {
  let browser: Browser = installBrowser();

  beforeEach(() => {
    browser = installBrowser();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.effect("clears old analytics storage for a visitor with no choice", () =>
    Effect.gen(function* legacyCleanup() {
      const state = yield* runChoice();

      expect(state).toStrictEqual({
        analyticsAllowed: false,
        bannerVisible: true,
        choice: undefined,
      });
      expect(browser.jar.names()).toStrictEqual(["theme"]);
      expect(Object.keys(browser.local)).toStrictEqual(["keep_theme"]);
      expect(Object.keys(browser.session)).toStrictEqual([]);
    })
  );

  it.effect("stores accept as one cookie the app can read", () =>
    Effect.gen(function* acceptAll() {
      const state = yield* runChoice("all");
      const cookie = browser.jar.find(CONSENT_COOKIE);

      expect(state).toStrictEqual({
        analyticsAllowed: true,
        bannerVisible: false,
        choice: "all",
      });
      expect(cookie?.value).toBe("all");
      expect(cookie?.domain).toBe(`.${host}`);
      expect(cookie?.attributes.get("path")).toBe("/");
      expect(cookie?.attributes.get("samesite")).toBe("Lax");
      expect(cookie?.attributes.has("secure")).toBe(true);
      expect(Number(cookie?.attributes.get("max-age"))).toBe(
        CONSENT_MAX_AGE_SECONDS
      );
      expect(CONSENT_MAX_AGE_SECONDS).toBeGreaterThan(170 * 86_400);
      expect(CONSENT_MAX_AGE_SECONDS).toBeLessThan(360 * 86_400);
      expect(browser.jar.names()).toContain("ph_legacy");
      expect(Object.keys(browser.local)).toContain("ph_legacy");
    })
  );

  it.effect("clears analytics storage when a visitor rejects", () =>
    Effect.gen(function* rejectOptional() {
      const state = yield* runChoice("essential");

      expect(state).toStrictEqual({
        analyticsAllowed: false,
        bannerVisible: false,
        choice: "essential",
      });
      expect(browser.jar.find(CONSENT_COOKIE)?.value).toBe("essential");
      expect(browser.jar.names()).toStrictEqual([CONSENT_COOKIE, "theme"]);
      expect(Object.keys(browser.local)).toStrictEqual(["keep_theme"]);
      expect(Object.keys(browser.session)).toStrictEqual([]);
    })
  );

  it.effect("drops analytics when the app or another tab withdraws", () =>
    Effect.gen(function* withdrawal() {
      yield* runChoice("all");
      browser.jar.seed("ph_after_accept", `.${host}`, "fresh");
      browser.jar.write(
        `${CONSENT_COOKIE}=essential; Max-Age=15552000; Path=/; SameSite=Lax; Secure; Domain=.${host}`
      );

      const state = yield* runChoice();

      expect(state.choice).toBe("essential");
      expect(state.analyticsAllowed).toBe(false);
      expect(state.bannerVisible).toBe(false);
      expect(browser.jar.names()).toStrictEqual([CONSENT_COOKIE, "theme"]);
      expect(Object.keys(browser.local)).toStrictEqual(["keep_theme"]);
    })
  );

  it.effect("keeps a stored accept across a reload", () =>
    Effect.gen(function* reload() {
      yield* runChoice("all");

      const state = yield* runChoice();

      expect(state).toStrictEqual({
        analyticsAllowed: true,
        bannerVisible: false,
        choice: "all",
      });
      expect(Object.keys(browser.local)).toContain("ph_legacy");
    })
  );

  it.effect("tells the page about each choice", () =>
    Effect.gen(function* announces() {
      yield* runChoice("all");
      yield* runChoice("essential");

      expect(browser.events.map((event) => event.type)).toStrictEqual([
        "ht:consent",
        "ht:consent",
      ]);
      expect(browser.events.map((event) => event.detail)).toStrictEqual([
        { analytics: true },
        { analytics: false },
      ]);
    })
  );
});
