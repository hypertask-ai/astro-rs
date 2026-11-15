import { NodeServices } from "@effect/platform-node";
import { Effect, Path } from "effect";
import type { Plugin } from "vite";

import { finalizeSiteRules } from "./scripts/site-rules.js";
import { normalizeSiteBasePath } from "./src/site-base-path.js";

export const siteRulesPlugin = (): Plugin => ({
  apply: "build",
  buildApp: {
    // @effect-diagnostics-next-line asyncFunction:off -- Vite awaits finalization after the Foldkit prerender hook.
    handler: async (builder) => {
      const { client } = builder.environments;

      if (client === undefined) {
        throw new Error("Site rules require a completed client build");
      }

      await Effect.runPromise(
        Effect.gen(function* finalizeBuild() {
          const path = yield* Path.Path;

          yield* finalizeSiteRules(
            path.resolve(client.config.root, client.config.build.outDir),
            normalizeSiteBasePath(client.config.base)
          );
        }).pipe(Effect.provide(NodeServices.layer))
      );
    },
    order: "post",
  },
  name: "site-rules",
  sharedDuringBuild: true,
});
