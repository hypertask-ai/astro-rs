import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import { useCasePages } from "../src/features/use-cases/copy.js";
import { useCaseViewFor } from "../src/features/use-cases/index.js";
import {
  computedLineHeight,
  declarationsIn,
  winningValue,
} from "./css-cascade.js";
import liveHeadingType from "./fixtures/live-use-case-heading-type.json" with { type: "json" };

const stylesheetDeclarations = Effect.gen(function* readBuiltStylesheets() {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const client = path.resolve(import.meta.dirname, "../dist/client");
  const listing = yield* fs.readDirectory(client, { recursive: true });

  const stylesheets = listing
    .filter((file) => file.endsWith(".css"))
    .toSorted((left, right) => left.localeCompare(right));

  const sheets = yield* Effect.all(
    stylesheets.map((file) => fs.readFileString(path.join(client, file)))
  );

  return declarationsIn(sheets.join("\n"));
});

const classesIn = (html: string, tag: string): readonly string[] => {
  const element = new RegExp(`<${tag}[^>]*>`, "u").exec(html)?.[0] ?? "";
  const classes = /class="(?<classes>[^"]*)"/u.exec(element)?.groups?.classes;

  return (classes ?? "").split(/\s+/u).filter((name) => name.length > 0);
};

const renderUseCasePage = (path: string) =>
  Effect.gen(function* renderPage() {
    const view = useCaseViewFor(path);

    if (view === undefined) {
      throw new Error(`No use case view for ${path}`);
    }

    return yield* renderToString(
      {
        init: () => ({ model: initialModel }),
        view,
      },
      { isHydratable: false }
    );
  });

it.layer(NodeServices.layer)("use case heading type", (test) => {
  for (const each of useCasePages) {
    const pagePath = each.path;

    test.effect(
      `${pagePath} sets heading type in the sizes the live page uses`,
      () =>
        Effect.gen(function* compareHeadingType() {
          const declarations = yield* stylesheetDeclarations;
          const page = yield* renderUseCasePage(pagePath);
          const moduleHeading = classesIn(page.html, "h2");
          const bottomCallToAction = classesIn(page.html, "h3");

          expect(moduleHeading.length).toBeGreaterThan(0);
          expect(bottomCallToAction.length).toBeGreaterThan(0);

          for (const [width, live] of Object.entries(liveHeadingType)) {
            for (const classes of [moduleHeading, bottomCallToAction]) {
              const fontSize =
                winningValue(
                  declarations,
                  classes,
                  "font-size",
                  Number(width)
                ) ?? "";

              const lineHeight = computedLineHeight(
                fontSize,
                winningValue(
                  declarations,
                  classes,
                  "line-height",
                  Number(width)
                ) ?? ""
              );

              expect({ fontSize, lineHeight }).toEqual({
                fontSize: live.fontSize,
                lineHeight: live.lineHeight,
              });
            }
          }
        })
    );
  }
});
