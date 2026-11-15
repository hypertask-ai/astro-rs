import { NodeServices } from "@effect/platform-node";
import { Effect, Path } from "effect";
import type { Plugin } from "vite";

import { finalizeCrawlerFiles } from "./scripts/crawler-files.js";

export const crawlerFilesPlugin = (): Plugin => ({
  apply: "build",
  buildApp: {
    // @effect-diagnostics-next-line asyncFunction:off -- Vite awaits the file writes after the client build.
    handler: async (builder) => {
      const { client } = builder.environments;

      if (client === undefined) {
        throw new Error("Crawler files require a completed client build");
      }

      await Effect.runPromise(
        Effect.gen(function* finalizeBuild() {
          const path = yield* Path.Path;

          yield* finalizeCrawlerFiles(
            path.resolve(client.config.root, client.config.build.outDir)
          );
        }).pipe(Effect.provide(NodeServices.layer))
      );
    },
    order: "post",
  },
  name: "crawler-files",
  sharedDuringBuild: true,
});
