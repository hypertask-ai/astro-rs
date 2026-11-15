import { fileURLToPath } from "node:url";

import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { AuthProviders, Stage } from "alchemy";
import { AlchemyContextLive } from "alchemy/AlchemyContext";
import { Effect, FileSystem, Layer } from "effect";
import * as HttpClient from "effect/http/HttpClient";

import stack from "../alchemy.run.js";
import {
  liveDomains,
  liveProjectName,
  liveResourceTypes,
  liveResources,
  liveSettings,
  liveSwitchTicket,
  liveZoneName,
} from "../src/live-items.js";

const services = Layer.mergeAll(
  AlchemyContextLive.pipe(Layer.provideMerge(NodeServices.layer)),
  Layer.succeed(Stage, "prod"),
  Layer.succeed(AuthProviders, {}),
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make(() => Effect.die("live-items-test-must-not-call-cloud-api"))
  )
);

const infraRoot = new URL("..", import.meta.url);

const infraPath = (file: string) => fileURLToPath(new URL(file, infraRoot));

const settingNamePattern = /^[A-Z][A-Z0-9_]*$/u;

const credentialValuePattern = /[0-9a-f]{32,}/iu;

it.effect("the Stack declares none of the live hypertask.ai items", () =>
  Effect.gen(function* checkStack() {
    const compiled = yield* stack.pipe(Effect.provide(services));

    for (const live of liveResources) {
      expect(
        compiled.resources[live.logicalId],
        live.logicalId
      ).toBeUndefined();
    }

    for (const resource of Object.values(compiled.resources)) {
      if (resource.Props === undefined) {
        continue;
      }

      expect(resource.Props, resource.FQN).not.toHaveProperty(
        "name",
        liveZoneName
      );
      expect(resource.Props, resource.FQN).not.toHaveProperty(
        "name",
        liveProjectName
      );
      expect(resource.Props, resource.FQN).not.toHaveProperty(
        "domain",
        liveZoneName
      );
      expect(resource.Props, resource.FQN).not.toHaveProperty("domain", {
        name: liveZoneName,
      });
      expect(resource.Props, resource.FQN).not.toHaveProperty("domain", {
        name: liveDomains[1],
      });
    }
  }).pipe(Effect.provide(services))
);

it("lists every live item as adopt only and undeclared", () => {
  expect(liveResources.map((live) => live.logicalId)).toEqual([
    "HypertaskAiZone",
    "HypertaskWebsiteProject",
    "ApexDomain",
    "WwwDomain",
    "ApexRecord",
    "WwwRecord",
  ]);

  expect(liveResources.map((live) => live.name)).toEqual([
    liveZoneName,
    liveProjectName,
    liveDomains[0],
    liveDomains[1],
    liveZoneName,
    `www.${liveZoneName}`,
  ]);

  for (const live of liveResources) {
    expect(live.action, live.logicalId).toBe("adopt");
    expect(live.declaredInStack, live.logicalId).toBe(false);
    expect(live.declareIn, live.logicalId).toBe(liveSwitchTicket);
    expect(liveSwitchTicket, live.logicalId).toBe("HTPR-9149");
    expect(live.purpose.length, live.logicalId).toBeGreaterThan(0);
    expect(liveResourceTypes, live.logicalId).toContain(live.type);
  }
});

it("keeps setting names only", () => {
  expect(liveSettings.map((setting) => setting.name)).toEqual([
    "CLOUDFLARE_API_TOKEN",
  ]);

  for (const setting of liveSettings) {
    expect(setting.name).toMatch(settingNamePattern);
    expect(setting.purpose.length).toBeGreaterThan(0);
    expect(setting.sensitive).toBe(true);
  }

  expect(JSON.stringify(liveResources)).not.toMatch(credentialValuePattern);
  expect(JSON.stringify(liveSettings)).not.toMatch(credentialValuePattern);
});

it.effect(
  "keeps no live plan entrypoint and no account id or token value",
  () =>
    Effect.gen(function* checkFiles() {
      const fs = yield* FileSystem.FileSystem;

      for (const file of ["alchemy.run.ts", "src/live-items.ts"]) {
        const text = yield* fs.readFileString(infraPath(file));

        expect(text, file).not.toMatch(credentialValuePattern);
        expect(text, file).not.toMatch(/Bearer /u);
      }

      const entries = yield* fs.readDirectory(fileURLToPath(infraRoot));

      expect(entries).not.toContain("alchemy.live.ts");
    }).pipe(Effect.provide(NodeServices.layer))
);
