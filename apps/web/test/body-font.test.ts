import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";

import liveFont from "./fixtures/live-body-font.json" with { type: "json" };

const stylesheetFiles = (listing: readonly string[]): readonly string[] =>
  listing.filter((file) => file.endsWith(".css"));

const declarationsIn = (css: string): readonly string[] =>
  [
    ...css.matchAll(/(?:--[\w-]+|font-family)\s*:\s*(?<value>[^;}]+)/gu),
  ].flatMap((match) => match.groups?.value ?? []);

const bodyFontStack = (css: string): string | undefined =>
  [...css.matchAll(/(?<![\w.#-])body\s*\{(?<body>[^{}]*)\}/gu)]
    .flatMap((match) =>
      [
        ...(match.groups?.body ?? "").matchAll(
          /font-family\s*:\s*(?<value>[^;}]+)/gu
        ),
      ].flatMap((declaration) => declaration.groups?.value ?? [])
    )
    .at(-1);

const comparable = (stack: string): string =>
  stack
    .replaceAll(/["']/gu, "")
    .split(",")
    .map((family) => family.trim().toLowerCase())
    .join(",");

it.layer(NodeServices.layer)("page font", (test) => {
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

  test.effect("sets body text in the stack the live site uses", () =>
    Effect.gen(function* compareBodyFont() {
      const stylesheets = yield* builtStylesheets;
      const body = bodyFontStack(stylesheets);

      expect(body).toBeDefined();

      expect(comparable(body ?? "")).toBe(comparable(liveFont.body));
    })
  );

  test.effect("declares the IBM Plex Sans the live home page keeps", () =>
    Effect.gen(function* compareHomeChromeFont() {
      const stylesheets = yield* builtStylesheets;

      expect(declarationsIn(stylesheets).map(comparable)).toContain(
        comparable(liveFont.homeChrome)
      );
    })
  );
});
