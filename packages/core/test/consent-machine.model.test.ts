import { describe, expect, it } from "@effect/vitest";
import { Effect, Ref, Schema } from "effect";

import { ConsentChoiceSchema } from "../src/consent-choice.js";
import type { ConsentChoice } from "../src/consent-choice.js";
import { ConsentStore, runConsentMachine } from "../src/consent-machine.js";
import type { ConsentState } from "../src/consent-machine.js";

const Scenario = Schema.Struct({
  choose: Schema.UndefinedOr(ConsentChoiceSchema),
  stored: Schema.UndefinedOr(ConsentChoiceSchema),
});

type ConsentScenario = typeof Scenario.Type;

const expectedState = ({ choose, stored }: ConsentScenario): ConsentState => {
  const choice = choose ?? stored;

  return {
    analyticsAllowed: choice === "all",
    bannerVisible: choice === undefined,
    choice,
  };
};

const expectedClears = ({ choose, stored }: ConsentScenario): number => {
  const choice = choose ?? stored;

  return choice === "all" ? 0 : 1;
};

const fakeStore = (stored: ConsentChoice | undefined) =>
  Effect.gen(function* makeFakeStore() {
    const saved = yield* Ref.make<ConsentChoice | null>(null);
    const cleared = yield* Ref.make(0);

    return {
      cleared,
      saved,
      store: ConsentStore.of({
        clearAnalytics: Ref.update(cleared, (count) => count + 1),
        read: Effect.succeed(stored),
        save: (choice: ConsentChoice) => Ref.set(saved, choice),
      }),
    };
  });

describe("consent lifecycle contract", () => {
  it.effect.prop(
    "restores or records one consent choice and clears analytics only without consent",
    { scenario: Scenario },
    ({ scenario }) =>
      Effect.gen(function* keepsOneChoice() {
        const { cleared, saved, store } = yield* fakeStore(scenario.stored);

        const state = yield* runConsentMachine(scenario.choose).pipe(
          Effect.provideService(ConsentStore, store)
        );

        expect(state).toStrictEqual(expectedState(scenario));
        expect(yield* Ref.get(saved)).toStrictEqual(scenario.choose ?? null);
        expect(yield* Ref.get(cleared)).toBe(expectedClears(scenario));
      }),
    { arbitrary: { runs: 100 } }
  );
});
