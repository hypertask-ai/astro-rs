import { describe, expect, it } from "@effect/vitest";
import { Option } from "effect";

import { initialModel, Message, update } from "../src/client/app/index.js";

describe("cookie consent choices", () => {
  it("asks a visitor with no stored choice", () => {
    expect(initialModel.bannerVisible).toBe(true);
    expect(Option.isNone(initialModel.choice)).toBe(true);
    expect(initialModel.analyticsAllowed).toBe(false);
  });

  it("hides the banner after a stored choice is restored", () => {
    const accepted = update(
      initialModel,
      Message.ConsentResolved({
        analyticsAllowed: true,
        bannerVisible: false,
        choice: "all",
      })
    ).model;

    expect(accepted.bannerVisible).toBe(false);
    expect(accepted.choice).toStrictEqual(Option.some("all"));
    expect(accepted.analyticsAllowed).toBe(true);
  });

  it("keeps analytics off when a visitor rejects", () => {
    const rejected = update(
      initialModel,
      Message.ConsentResolved({
        analyticsAllowed: false,
        bannerVisible: false,
        choice: "essential",
      })
    ).model;

    expect(rejected.choice).toStrictEqual(Option.some("essential"));
    expect(rejected.analyticsAllowed).toBe(false);
  });

  it("records the choice through a named command before hiding the banner", () => {
    const accepted = update(initialModel, Message.ChoseAll());

    expect(accepted.model.bannerVisible).toBe(true);
    expect(accepted.commands?.map((command) => command.name)).toStrictEqual([
      "AcceptAllCookies",
    ]);

    const rejected = update(initialModel, Message.ChoseEssential());

    expect(rejected.commands?.map((command) => command.name)).toStrictEqual([
      "RejectOptionalCookies",
    ]);
  });

  it("rechecks a shared cookie changed by the app or another tab", () => {
    const rechecked = update(initialModel, Message.ConsentRecheck());

    expect(rechecked.commands?.map((command) => command.name)).toStrictEqual([
      "LoadConsent",
    ]);
  });

  it("reopens the choices from the cookie settings button", () => {
    const decided = update(
      initialModel,
      Message.ConsentResolved({
        analyticsAllowed: true,
        bannerVisible: false,
        choice: "all",
      })
    ).model;

    expect(
      update(decided, Message.OpenedCookieSettings()).model.bannerVisible
    ).toBe(true);
  });
});
