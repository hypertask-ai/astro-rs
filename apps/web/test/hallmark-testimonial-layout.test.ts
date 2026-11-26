import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import { view } from "../src/features/hallmark/index.js";
import { declarationsIn, winningValue } from "./css-cascade.js";
import { ancestorsOf, elementsIn } from "./html-tree.js";

const stylesheetDeclarations = Effect.gen(function* readBuiltStylesheets() {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const client = path.resolve(import.meta.dirname, "../dist/client");
  const listing = yield* fs.readDirectory(client, { recursive: true });

  const files = listing
    .filter((file) => file.endsWith(".css"))
    .toSorted((left, right) => left.localeCompare(right));

  const sheets = yield* Effect.all(
    files.map((file) => fs.readFileString(path.join(client, file)))
  );

  return declarationsIn(sheets.join("\n"));
});

const renderedPage = renderToString(
  { init: () => ({ model: initialModel }), view },
  { isHydratable: false }
);

it.layer(NodeServices.layer)("Hallmark testimonial layout", (test) => {
  test.effect("keeps the phone hero from shifting the stacked cards", () =>
    Effect.gen(function* checkPhoneHeroSpacing() {
      const declarations = yield* stylesheetDeclarations;
      const rendered = yield* renderedPage;
      const elements = elementsIn(rendered.html);
      const title = elements.findIndex((element) => element.tag === "h1");

      const hero = ancestorsOf(elements, title).find(
        (element) => element.tag === "section"
      );

      const button =
        /<button\b[^>]*aria-label="Copy CLI install command"[^>]*>/u.exec(
          rendered.html
        );

      const [command] = elementsIn(button?.[0] ?? "");

      expect(hero).toBeDefined();
      expect(command).toBeDefined();
      expect(
        winningValue(declarations, hero?.classes ?? [], "padding-bottom", 390)
      ).toBe("60px");
      expect(
        winningValue(declarations, command?.classes ?? [], "font-family", 390)
      ).toBe("Inter, ui-sans-serif, system-ui, sans-serif");
      expect(
        winningValue(declarations, command?.classes ?? [], "line-height", 390)
      ).toBe("1.5");
    })
  );

  test.effect(
    "keeps all five phone cards stacked without a horizontal scroll frame",
    () =>
      Effect.gen(function* checkPhoneStack() {
        const declarations = yield* stylesheetDeclarations;
        const rendered = yield* renderedPage;
        const start = rendered.html.indexOf('aria-label="What our users say"');

        expect(start).toBeGreaterThan(0);

        const elements = elementsIn(rendered.html.slice(start));

        const quotes = elements.flatMap((element, index) =>
          element.tag === "h4" ? [index] : []
        );

        expect(quotes).toHaveLength(5);

        for (const width of [390, 640, 767]) {
          for (const quote of quotes) {
            for (const ancestor of ancestorsOf(elements, quote)) {
              const value = (property: string) =>
                winningValue(declarations, ancestor.classes, property, width);

              expect(value("display")).not.toBe("grid");
              expect(
                value("display") === "flex" &&
                  value("flex-direction") !== "column"
              ).toBe(false);
              expect(value("overflow-x")).not.toBe("auto");
            }
          }
        }
      })
  );

  test.effect(
    "uses the live card line heights at phone, tablet and desktop widths",
    () =>
      Effect.gen(function* checkCardType() {
        const declarations = yield* stylesheetDeclarations;
        const rendered = yield* renderedPage;
        const elements = elementsIn(rendered.html);

        const quoteIndex = elements.findIndex(
          (element) => element.tag === "h4"
        );

        const quote = elements[quoteIndex];

        const quoteWrapper = quote?.parent;

        const content =
          quoteWrapper === undefined
            ? undefined
            : elements[quoteWrapper]?.parent;

        const body = elements.find(
          (element) => element.parent === content && element.tag === "p"
        );

        expect(content).toBeDefined();
        expect(quote).toBeDefined();
        expect(body).toBeDefined();

        for (const width of [390, 768, 1440]) {
          expect(
            winningValue(
              declarations,
              quote?.classes ?? [],
              "line-height",
              width
            )
          ).toBe("1.75rem");
          expect(
            winningValue(
              declarations,
              body?.classes ?? [],
              "line-height",
              width
            )
          ).toBe(width < 768 ? "1.5rem" : "1.75rem");
        }
      })
  );
});
