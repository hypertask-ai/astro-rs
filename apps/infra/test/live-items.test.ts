import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { AuthProviders, Stage } from "alchemy";
import { AlchemyContextLive } from "alchemy/AlchemyContext";
import { Effect, Layer } from "effect";
import * as HttpClient from "effect/http/HttpClient";

import live from "../alchemy.live.js";
import {
  liveAllowedTypes,
  liveDomains,
  liveLogicalIds,
  liveResourcesAdoptOnly,
  liveSecretNames,
  secretNamePattern,
} from "../src/live-items.js";

const services = Layer.mergeAll(
  AlchemyContextLive.pipe(Layer.provideMerge(NodeServices.layer)),
  Layer.succeed(Stage, "prod"),
  Layer.succeed(AuthProviders, {}),
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make(() => Effect.die("live-plan-test-must-not-call-cloud-api"))
  )
);

interface Item {
  Adopt: boolean | undefined;
  LogicalId: string;
  RemovalPolicy: string;
  Type: string;
}

const base: Item = {
  Adopt: true,
  LogicalId: "HypertaskAiZone",
  RemovalPolicy: "retain",
  Type: "Cloudflare.Zone.Zone",
};

const full = Object.fromEntries(
  liveLogicalIds.map((id) => [id, { ...base, LogicalId: id }])
);

it.effect("the live stack declares only adopt-only retained items", () =>
  Effect.gen(function* checkLiveStack() {
    const compiled = yield* live.pipe(Effect.provide(services));
    const resources = Object.values(compiled.resources);

    expect(resources.map((resource) => resource.LogicalId).toSorted()).toEqual(
      [...liveLogicalIds].toSorted()
    );
    expect(
      resources.every((resource) =>
        liveAllowedTypes.some((type) => type === resource.Type)
      )
    ).toBe(true);
    expect(resources.every((resource) => resource.Adopt === true)).toBe(true);
    expect(
      resources.every((resource) => resource.RemovalPolicy === "retain")
    ).toBe(true);
    expect(liveResourcesAdoptOnly(compiled.resources)).toBe(true);
  })
);

it("accepts the full adopt-only retained set", () => {
  expect(liveResourcesAdoptOnly(full)).toBe(true);
});

it("rejects an item that could be deleted or recreated", () => {
  const changed = (patch: Partial<Item>) => ({
    ...full,
    ApexRecord: { ...base, LogicalId: "ApexRecord", ...patch },
  });

  expect(liveResourcesAdoptOnly(changed({ Type: "Cloudflare.Worker" }))).toBe(
    false
  );
  expect(liveResourcesAdoptOnly(changed({ RemovalPolicy: "destroy" }))).toBe(
    false
  );
  expect(liveResourcesAdoptOnly(changed({ Adopt: undefined }))).toBe(false);
  expect(liveResourcesAdoptOnly({})).toBe(false);
});

it("lists names only for the kept secrets", () => {
  const names = Object.values(liveSecretNames).flat();

  expect(names).toEqual(["CLOUDFLARE_API_TOKEN"]);
  expect(names.every((name) => secretNamePattern.test(name))).toBe(true);
  expect(liveDomains).toEqual(["hypertask.ai", "www.hypertask.ai"]);
});
