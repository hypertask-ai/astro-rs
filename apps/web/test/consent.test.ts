import { describe, expect, it } from "@effect/vitest";
import { Option } from "effect";

import { initialModel, Message, update } from "../src/client/app/index.js";

const commandNames = (result: ReturnType<typeof update>): readonly string[] =>
  result.commands?.map((command) => command.name) ?? [];

const resolved = (
  analyticsAllowed: boolean,
  bannerVisible: boolean,
  choice?: "all" | "essential"
) => Message.ConsentResolved({ analyticsAllowed, bannerVisible, choice });

describe("cookie consent choices", () => {
  it("keeps the banner hidden until the stored choice is read", () => {
    expect(initialModel.bannerVisible).toBe(false);
    expect(Option.isNone(initialModel.choice)).toBe(true);
    expect(initialModel.analyticsAllowed).toBe(false);
  });

  it("asks a visitor with no stored choice", () => {
    const asked = update(initialModel, resolved(false, true)).model;

    expect(asked.bannerVisible).toBe(true);
    expect(Option.isNone(asked.choice)).toBe(true);
    expect(asked.analyticsAllowed).toBe(false);
  });

  it("hides the banner after a stored choice is restored", () => {
    const accepted = update(initialModel, resolved(true, false, "all")).model;

    expect(accepted.bannerVisible).toBe(false);
    expect(accepted.choice).toStrictEqual(Option.some("all"));
    expect(accepted.analyticsAllowed).toBe(true);
  });

  it("keeps analytics off when a visitor rejects", () => {
    const rejected = update(
      initialModel,
      resolved(false, false, "essential")
    ).model;

    expect(rejected.bannerVisible).toBe(false);
    expect(rejected.choice).toStrictEqual(Option.some("essential"));
    expect(rejected.analyticsAllowed).toBe(false);
  });

  it("records the choice through a named command before hiding the banner", () => {
    const accepted = update(initialModel, Message.ChoseAll());

    expect(accepted.model.bannerVisible).toBe(false);
    expect(commandNames(accepted)).toStrictEqual(["AcceptAllCookies"]);

    const rejected = update(initialModel, Message.ChoseEssential());

    expect(commandNames(rejected)).toStrictEqual(["RejectOptionalCookies"]);
  });

  it("rechecks a shared cookie changed by the app or another tab", () => {
    expect(
      commandNames(update(initialModel, Message.ConsentRecheck()))
    ).toStrictEqual(["LoadConsent"]);
  });

  it("reopens the choices from the cookie settings button and lands focus on Accept", () => {
    const decided = update(initialModel, resolved(true, false, "all")).model;
    const reopened = update(decided, Message.OpenedCookieSettings());

    expect(reopened.model.bannerVisible).toBe(true);
    expect(commandNames(reopened)).toStrictEqual(["FocusCookieChoices"]);
  });

  it("returns focus to the footer settings button once a choice hides the banner", () => {
    const asked = update(initialModel, resolved(false, true)).model;
    const chosen = update(asked, resolved(false, false, "essential"));
    const restored = update(initialModel, resolved(true, false, "all"));

    expect(commandNames(chosen)).toStrictEqual(["FocusCookieSettings"]);
    expect(commandNames(restored)).toStrictEqual([]);
  });

  it("takes a later choice over an earlier one", () => {
    const rejected = update(
      initialModel,
      resolved(false, false, "essential")
    ).model;

    const reopened = update(rejected, Message.OpenedCookieSettings()).model;

    expect(commandNames(update(reopened, Message.ChoseAll()))).toStrictEqual([
      "AcceptAllCookies",
    ]);
    expect(
      update(reopened, resolved(true, false, "all")).model.analyticsAllowed
    ).toBe(true);
  });
});
