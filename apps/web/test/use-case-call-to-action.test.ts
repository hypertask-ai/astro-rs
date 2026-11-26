import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import { loginCta, useCasePages } from "../src/features/use-cases/copy.js";
import { useCaseViewFor } from "../src/features/use-cases/index.js";
import { declarationsIn, winningValue } from "./css-cascade.js";
import type { Declaration } from "./css-cascade.js";
import liveCta from "./fixtures/live-use-case-cta.json" with { type: "json" };

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

const classesOfLinksLabelled = (
  html: string,
  label: string
): readonly (readonly string[])[] => {
  const pattern = new RegExp(
    `<a\\b[^>]*class="(?<classes>[^"]*)"[^>]*>${escapeForPattern(label)}</a>`,
    "gu"
  );

  return [...html.matchAll(pattern)].map((match) =>
    (match.groups?.classes ?? "")
      .split(/\s+/u)
      .filter((name) => name.length > 0)
  );
};

const pseudoValue = (
  declarations: readonly Declaration[],
  classes: readonly string[],
  property: string,
  pseudo: string
): string | undefined =>
  declarations.findLast(
    (declaration) =>
      declaration.property === property &&
      classes.some((name) => declaration.selector === `.${name}${pseudo}`)
  )?.value;

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

it.layer(NodeServices.layer)("use case call to action", (test) => {
  for (const page of useCasePages) {
    test.effect(
      `${page.path} transitions, hovers and shows focus like the live page`,
      () =>
        Effect.gen(function* compareCallToAction() {
          const declarations = yield* stylesheetDeclarations;
          const rendered = yield* renderUseCasePage(page.path);
          const primary = classesOfLinksLabelled(rendered.html, loginCta.label);

          const secondary = classesOfLinksLabelled(
            rendered.html,
            page.secondaryCta.label
          );

          expect({
            primary: primary.length,
            secondary: secondary.length,
          }).toEqual({ primary: 2, secondary: 2 });

          for (const classes of primary) {
            for (const width of liveCta.widths) {
              const transitionDuration =
                winningValue(
                  declarations,
                  classes,
                  "transition-duration",
                  width
                ) ?? "";

              expect({ transitionDuration, width }).toEqual({
                transitionDuration: liveCta.transitionDuration,
                width,
              });
            }

            const hoverBackground = pseudoValue(
              declarations,
              classes,
              "background-color",
              ":hover"
            );

            expect(hoverBackground).toBe(liveCta.primaryHoverBackgroundColor);
          }

          for (const classes of [...primary, ...secondary]) {
            const focusRing =
              pseudoValue(
                declarations,
                classes,
                "box-shadow",
                ":focus-visible"
              ) ?? "";

            expect(focusRing).toContain(liveCta.focusVisibleRingColor);
          }
        })
    );
  }
});
