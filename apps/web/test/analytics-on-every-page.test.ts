import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";

import { prerenderedPagePaths } from "../scripts/site-rules.js";
import type { BuiltPage } from "./analytics-rules.js";
import { analyticsViolations } from "./analytics-rules.js";
import { fathomScriptSource, fathomSiteId } from "./site-contract/manifest.js";

const headOwner = "apps/web/src/features/head/build-head.ts";

const pageSuffix = "index.html";

it.layer(NodeServices.layer)("analytics on every built page", (test) => {
  test.effect(
    "every generated page loads Fathom once from the head owner and names no Google Analytics",
    () =>
      Effect.gen(function* checkBuiltPages() {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const client = path.resolve(import.meta.dirname, "../dist/client");
        const listing = yield* fs.readDirectory(client, { recursive: true });

        const pageFiles = listing.filter((file) =>
          file.split(path.sep).join("/").endsWith(pageSuffix)
        );

        const pages = yield* Effect.forEach(pageFiles, (file) =>
          Effect.gen(function* readPage() {
            const pagePath = prerenderedPagePaths([file], path.sep)[0] ?? "";

            return {
              html: yield* fs.readFileString(path.join(client, file)),
              path: pagePath,
            } satisfies BuiltPage;
          })
        );

        const headSource = yield* fs.readFileString(
          path.resolve(
            import.meta.dirname,
            "../src/features/head/build-head.ts"
          )
        );

        expect(pages.length).toBeGreaterThan(0);

        expect(
          analyticsViolations(pages, headSource, {
            headOwner,
            siteId: fathomSiteId,
            source: fathomScriptSource,
          })
        ).toEqual([]);
      })
  );
});
