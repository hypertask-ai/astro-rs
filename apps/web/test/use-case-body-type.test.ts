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
import liveBodyType from "./fixtures/live-use-case-body-type.json" with { type: "json" };

const stylesheetFiles = (listing: readonly string[]): readonly string[] =>
  listing
    .filter((file) => file.endsWith(".css"))
    .toSorted((left, right) => left.localeCompare(right));

const stylesheetDeclarations = Effect.gen(function* readBuiltStylesheets() {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const client = path.resolve(import.meta.dirname, "../dist/client");
  const listing = yield* fs.readDirectory(client, { recursive: true });

  const sheets = yield* Effect.forEach(stylesheetFiles(listing), (file) =>
    fs.readFileString(path.join(client, file))
  );

  return declarationsIn(sheets.join("\n"));
});

const escapeForPattern = (text: string): string =>
  text.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");

const classesOfElementContaining = (
  html: string,
  tag: string,
  text: string
): readonly string[] => {
  const pattern = new RegExp(
    `<${tag}\\b[^>]*class="(?<classes>[^"]*)"[^>]*>${escapeForPattern(text)}`,
    "u"
  );

  const classes = pattern.exec(html)?.groups?.classes;

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

it.layer(NodeServices.layer)("use case body type", (test) => {
  for (const page of useCasePages) {
    test.effect(
      `${page.path} sets module and closing body text at the line heights the live page uses`,
      () =>
        Effect.gen(function* compareBodyType() {
          const declarations = yield* stylesheetDeclarations;
          const rendered = yield* renderUseCasePage(page.path);
          const firstModule = page.modules.at(0);

          if (firstModule === undefined) {
            throw new Error(`No module for ${page.path}`);
          }

          const bodies = [
            {
              classes: classesOfElementContaining(
                rendered.html,
                "div",
                firstModule.body.join("\n\n")
              ),
              live: "moduleBody" as const,
            },
            {
              classes: classesOfElementContaining(
                rendered.html,
                "p",
                page.bottomBody
              ),
              live: "ctaBody" as const,
            },
          ];

          for (const body of bodies) {
            expect(body.classes.length).toBeGreaterThan(0);

            for (const [width, live] of Object.entries(liveBodyType)) {
              const fontSize =
                winningValue(
                  declarations,
                  body.classes,
                  "font-size",
                  Number(width)
                ) ?? "";

              const lineHeight = computedLineHeight(
                fontSize,
                winningValue(
                  declarations,
                  body.classes,
                  "line-height",
                  Number(width)
                ) ?? ""
              );

              expect({ fontSize, lineHeight, which: body.live, width }).toEqual(
                {
                  fontSize: live[body.live].fontSize,
                  lineHeight: live[body.live].lineHeight,
                  which: body.live,
                  width,
                }
              );
            }
          }
        })
    );
  }
});
