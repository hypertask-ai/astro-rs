import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Path } from "effect";

import { headersFile, redirectsFile } from "../src/hypertask/site-rules.js";
import { normalizeSiteBasePath } from "../src/site-base-path.js";

export const siteBasePathAtBuild = normalizeSiteBasePath(
  process.env.SITE_BASE_PATH
);

const indexPageSuffix = "/index.html";

export const prerenderedPagePaths = (
  files: readonly string[],
  separator: string
): readonly string[] =>
  files
    .map((file) => file.split(separator).join("/"))
    .flatMap((file) =>
      file.endsWith(indexPageSuffix)
        ? [`/${file.slice(0, -indexPageSuffix.length)}/`]
        : []
    );

export const finalizeSiteRules = Effect.fn("site.finalizeSiteRules")(
  function* finalizeSiteRules(clientDirectory: string) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const listing = yield* fs.readDirectory(clientDirectory, {
      recursive: true,
    });

    const headersPath = `${clientDirectory}/_headers`;

    const existingHeaders = (yield* fs.exists(headersPath))
      ? yield* fs.readFileString(headersPath)
      : "";

    yield* fs.writeFileString(
      `${clientDirectory}/_redirects`,
      redirectsFile(
        prerenderedPagePaths(listing, path.sep),
        siteBasePathAtBuild
      )
    );

    return yield* fs.writeFileString(
      headersPath,
      headersFile(existingHeaders, siteBasePathAtBuild)
    );
  },
  Effect.provide(NodeServices.layer)
);
