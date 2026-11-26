import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";

import liveGrid from "./fixtures/live-blog-column.json" with { type: "json" };

const stylesheetFiles = (listing: readonly string[]): readonly string[] =>
  listing.filter((file) => file.endsWith(".css"));

const gridColumns = (css: string): readonly string[] =>
  [...css.matchAll(/grid-template-columns\s*:\s*(?<value>[^;}]+)/gu)].flatMap(
    (match) => match.groups?.value ?? []
  );

const comparable = (value: string): string => value.replaceAll(/\s+/gu, "");

it.layer(NodeServices.layer)("blog column", (test) => {
  const builtStylesheets = Effect.gen(function* readBuiltStylesheets() {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const client = path.resolve(import.meta.dirname, "../dist/client");
    const listing = yield* fs.readDirectory(client, { recursive: true });

    const sheets = yield* Effect.forEach(stylesheetFiles(listing), (file) =>
      fs.readFileString(path.join(client, file))
    );

    return sheets.join("\n");
  });

  test.effect(
    "sizes the contents sidebar to its words like the live site",
    () =>
      Effect.gen(function* compareBlogGrid() {
        const stylesheets = yield* builtStylesheets;
        const declared = gridColumns(stylesheets).map(comparable);

        expect(declared).toContain(comparable(liveGrid.gridTemplateColumns));
      })
  );
});
