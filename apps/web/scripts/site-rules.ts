import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Path } from "effect";

import { headersFile, redirectsFile } from "../src/hypertask/site-rules.ts";

const indexPagePattern = /^(.+)\/index\.html$/u;

export const prerenderedPagePaths = (
  files: readonly string[],
  separator: string
): readonly string[] =>
  files
    .map((file) => file.split(separator).join("/"))
    .flatMap((file) => {
      const directory = indexPagePattern.exec(file)?.[1];

      return directory === undefined ? [] : [`/${directory}/`];
    });

export const finalizeSiteRules = Effect.fn("reader.finalizeSiteRules")(
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
      redirectsFile(prerenderedPagePaths(listing, path.sep))
    );

    return yield* fs.writeFileString(headersPath, headersFile(existingHeaders));
  },
  Effect.provide(NodeServices.layer)
);
