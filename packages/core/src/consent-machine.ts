import { watchActor } from "@rat-stack/capability/actor-watch";
import {
  createEffectActor,
  createEffectLogic,
  join,
  setupEffect,
} from "@xstate/effect";
import { Context, Effect, Schema } from "effect";
import { types } from "xstate";

import { allowsAnalytics, ConsentChoiceSchema } from "./consent-choice.js";
import type { ConsentChoice } from "./consent-choice.js";

export interface ConsentState {
  readonly analyticsAllowed: boolean;
  readonly bannerVisible: boolean;
  readonly choice: ConsentChoice | undefined;
}

export class ConsentStore extends Context.Service<
  ConsentStore,
  {
    readonly clearAnalytics: Effect.Effect<void>;
    readonly read: Effect.Effect<ConsentChoice | undefined>;
    readonly save: (choice: ConsentChoice) => Effect.Effect<void>;
  }
>()("@rat-stack/core/ConsentStore") {}

const restoreConsent = createEffectLogic({
  effect: Effect.gen(function* restoreConsent() {
    const store = yield* ConsentStore;
    const choice = yield* store.read;

    if (!allowsAnalytics(choice)) {
      yield* store.clearAnalytics;
    }

    return choice;
  }),
});

const recordChoice = createEffectLogic({
  effect: ({ input }) => {
    const { choice } = input;

    return choice === undefined
      ? Effect.void
      : ConsentStore.use((store) =>
          Effect.gen(function* saveChoice() {
            yield* store.save(choice);

            if (!allowsAnalytics(choice)) {
              yield* store.clearAnalytics;
            }
          })
        );
  },
  schemas: {
    input: Schema.Struct({ choice: Schema.UndefinedOr(ConsentChoiceSchema) }),
  },
});

const stateFor = (
  choice: ConsentChoice | undefined,
  bannerVisible: boolean
): ConsentState => ({
  analyticsAllowed: allowsAnalytics(choice),
  bannerVisible,
  choice,
});

interface ConsentContext {
  readonly choice: ConsentChoice | undefined;
  readonly state: ConsentState | undefined;
}

const ConsentInput = Schema.Struct({
  choose: Schema.UndefinedOr(ConsentChoiceSchema),
});

export const consentMachine = setupEffect({
  actors: { recordChoice, restoreConsent },
  schemas: {
    context: types<ConsentContext>(),
    input: ConsentInput,
  },
}).createMachine({
  context: ({ input }) => ({ choice: input.choose, state: undefined }),
  initial: "starting",
  output: ({ context }) => context.state,
  states: {
    applying: {
      invoke: {
        input: ({ context }) => ({ choice: context.choice }),
        onDone: {
          context: ({ context }) => ({
            ...context,
            state: stateFor(context.choice, false),
          }),
          target: "settled",
        },
        src: "recordChoice",
      },
    },
    awaiting: { type: "final" },
    resolved: {
      always: ({ context }) =>
        context.choice === undefined
          ? { target: "awaiting" }
          : { target: "settled" },
    },
    restoring: {
      invoke: {
        onDone: {
          context: ({ event }) => ({
            choice: event.output,
            state: stateFor(event.output, event.output === undefined),
          }),
          target: "resolved",
        },
        src: "restoreConsent",
      },
    },
    settled: { type: "final" },
    starting: {
      always: ({ context }) =>
        context.choice === undefined
          ? { target: "restoring" }
          : { target: "applying" },
    },
  },
});

export const runConsentMachine = Effect.fn("runConsentMachine")(
  function* runConsentMachine(choose: ConsentChoice | undefined) {
    const actor = yield* createEffectActor(consentMachine, {
      input: { choose },
    });

    yield* watchActor("consentMachine", actor);
    // @effect-diagnostics-next-line anyUnknownInErrorContext:off -- A machine-level error or early stop is a programming error: this lifecycle has no domain failure, so orDie keeps the unknown channel out of the runner.
    const state = yield* join(actor).pipe(Effect.orDie);

    if (state === undefined) {
      return yield* Effect.die(
        new Error("consentMachine completed without a state")
      );
    }

    return state;
  },
  Effect.scoped
);
