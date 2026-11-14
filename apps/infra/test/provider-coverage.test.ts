import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { AuthProviders, Stage } from "alchemy";
import { AlchemyContextLive } from "alchemy/AlchemyContext";
import { tryFindProviderRegistrationByType } from "alchemy/Provider";
import { Effect, Layer, Option } from "effect";
import * as HttpClient from "effect/http/HttpClient";

import stack from "../alchemy.run.js";

const services = Layer.mergeAll(
  AlchemyContextLive.pipe(Layer.provideMerge(NodeServices.layer)),
  Layer.succeed(Stage, "prod"),
  Layer.succeed(AuthProviders, {}),
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make(() =>
      Effect.die("provider-coverage-must-not-call-cloud-api")
    )
  )
);

it.effect("the stack registers a provider for every resource", () =>
  Effect.gen(function* checkStackProviders() {
    const compiled = yield* stack.pipe(Effect.provide(services));
    const resources = Object.values(compiled.resources);

    expect(resources.length).toBeGreaterThan(0);
    expect(
      resources.some((resource) => resource.Type === "Drizzle.Schema")
    ).toBe(false);
    expect(
      Object.values(compiled.actions).some(
        (action) => action.Type === "BetterAuth.Migrate"
      )
    ).toBe(false);

    for (const resource of resources) {
      const provider = yield* tryFindProviderRegistrationByType(
        resource.Type
      ).pipe(Effect.provideContext(compiled.services));

      expect(
        Option.isSome(provider),
        `${resource.FQN}: provider missing for ${resource.Type}`
      ).toBe(true);
    }
  })
);
