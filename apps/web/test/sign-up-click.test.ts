import { describe, expect, it } from "@effect/vitest";

import {
  clickedAppAddress,
  installSignUpClicks,
  signUpEventFor,
} from "../src/client/analytics/sign-up-click.js";
import type {
  ClickEvent,
  ClickListener,
} from "../src/client/analytics/sign-up-click.js";
import { signUpClickEvent } from "../src/features/analytics/index.js";

const appLink = "https://app.hypertask.ai/login";

const clickTarget = (href: string) => ({
  closest: (selector: string) => (selector === "a[href]" ? { href } : null),
});

const fakeDocument = () => {
  const listeners: ClickListener[] = [];

  return {
    addEventListener: (type: "click", listener: ClickListener) => {
      if (type === "click") {
        listeners.push(listener);
      }
    },
    click: (event: ClickEvent) => {
      for (const listener of listeners) {
        listener(event);
      }
    },
    listenerCount: () => listeners.length,
  };
};

const fakeTracker = () => {
  const events: string[] = [];

  return {
    events,
    track: (event: string) => {
      events.push(event);
    },
  };
};

describe("sign up click", () => {
  it("counts a click on a link to the app", () => {
    const page = fakeDocument();
    const { events, track } = fakeTracker();

    installSignUpClicks(page, track);
    page.click({ target: clickTarget(appLink) });

    expect(events).toEqual(["Sign up click"]);
    expect(signUpClickEvent).toBe("Sign up click");
  });

  it("counts once for a click inside a link", () => {
    const page = fakeDocument();
    const { events, track } = fakeTracker();

    installSignUpClicks(page, track);
    page.click({ target: clickTarget(appLink) });

    expect(events).toHaveLength(1);
  });

  it("ignores a link to another host", () => {
    const page = fakeDocument();
    const { events, track } = fakeTracker();

    installSignUpClicks(page, track);
    page.click({ target: clickTarget("https://hypertask.ai/pricing/") });
    page.click({ target: clickTarget("https://docs.hypertask.ai/") });

    expect(events).toEqual([]);
  });

  it("ignores a click that is not on a link", () => {
    const page = fakeDocument();
    const { events, track } = fakeTracker();

    installSignUpClicks(page, track);
    page.click({ target: { closest: () => null } });
    page.click({ target: null });
    page.click({ target: {} });

    expect(events).toEqual([]);
  });

  it("listens once for the whole page", () => {
    const page = fakeDocument();
    const { track } = fakeTracker();

    installSignUpClicks(page, track);

    expect(page.listenerCount()).toBe(1);
  });

  it("decides the event from the resolved address", () => {
    expect(signUpEventFor(appLink)).toBe("Sign up click");
    expect(signUpEventFor("https://app.hypertask.ai/demo")).toBe(
      "Sign up click"
    );
    expect(signUpEventFor("https://hypertask.ai/")).toBe(null);
    expect(signUpEventFor(null)).toBe(null);
  });

  it("resolves the link a click landed in", () => {
    expect(clickedAppAddress({ target: clickTarget(appLink) })).toBe(appLink);
    expect(clickedAppAddress({ target: null })).toBe(null);
    expect(clickedAppAddress({ target: {} })).toBe(null);
    expect(clickedAppAddress({ target: { closest: () => null } })).toBe(null);
  });
});
