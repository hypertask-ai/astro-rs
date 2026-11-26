import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import * as hallmark from "../src/features/hallmark/copy.js";
import { view as hallmarkView } from "../src/features/hallmark/index.js";
import * as ida from "../src/features/testimonial-ida/copy.js";
import { view as idaView } from "../src/features/testimonial-ida/index.js";
import { declarationsIn, winningValue } from "./css-cascade.js";
import { elementsIn } from "./html-tree.js";

const widths = [390, 639, 640, 767, 768, 1023, 1024, 1440];

const stylesheetDeclarations = Effect.gen(function* readBuiltStylesheets() {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const client = path.resolve(import.meta.dirname, "../dist/client");
  const listing = yield* fs.readDirectory(client, { recursive: true });
  const files = listing.filter((file) => file.endsWith(".css")).toSorted();

  const sheets = yield* Effect.all(
    files.map((file) => fs.readFileString(path.join(client, file)))
  );

  return declarationsIn(sheets.join("\n"));
});

const renderedHallmark = renderToString(
  { init: () => ({ model: initialModel }), view: hallmarkView },
  { isHydratable: false }
);

it.layer(NodeServices.layer)("Ida and Hallmark responsive layout", (test) => {
  test.effect(
    "keeps Ida's larger hero gap on desktop without moving phone content",
    () =>
      Effect.gen(function* checkHeroGaps() {
        const declarations = yield* stylesheetDeclarations;

        const rendered = yield* renderToString(
          { init: () => ({ model: initialModel }), view: idaView },
          { isHydratable: false }
        );

        const elements = elementsIn(rendered.html);
        const title = elements.find((element) => element.tag === "h1");

        const inner =
          title?.parent === undefined ? undefined : elements[title.parent];

        expect(inner).toBeDefined();

        for (const width of widths) {
          expect(
            winningValue(declarations, inner?.classes ?? [], "gap", width),
            `Ida hero gap at ${width}px`
          ).toBe(width >= 1024 ? "2rem" : "1.5rem");
        }
      })
  );

  test.effect(
    "keeps Ida descriptions, quotes and closing copy at the live line heights",
    () =>
      Effect.gen(function* checkBodyLineHeights() {
        const declarations = yield* stylesheetDeclarations;

        const rendered = yield* renderToString(
          { init: () => ({ model: initialModel }), view: idaView },
          { isHydratable: false }
        );

        const bodies = [
          ...rendered.html.matchAll(
            /<(?<tag>div|blockquote|p)\b[^>]*>(?<text>[^<]*)<\/\k<tag>>/gu
          ),
        ];

        const rows = [...ida.solutions, ...ida.keyFeatures];

        const groups = [
          {
            desktop: "1.5rem",
            texts: rows.flatMap((row) =>
              row.description === undefined ? [] : [row.description]
            ),
          },
          {
            desktop: "1.75rem",
            texts: [
              ida.bottomBody,
              ...rows.flatMap((row) =>
                row.quote === undefined ? [] : [`“${row.quote}”`]
              ),
            ],
          },
        ];

        for (const group of groups) {
          for (const text of group.texts) {
            const body = bodies.find(
              (match) => match.groups?.text?.replaceAll("&amp;", "&") === text
            );

            const [element] = elementsIn(body?.[0] ?? "");

            expect(element, text).toBeDefined();

            for (const width of widths) {
              expect(
                winningValue(
                  declarations,
                  element?.classes ?? [],
                  "line-height",
                  width
                ),
                `${text} at ${width}px`
              ).toBe(width >= 768 ? group.desktop : "1.625");
            }
          }
        }
      })
  );

  test.effect("keeps Ida's demo buttons transparent at both widths", () =>
    Effect.gen(function* checkDemoBackgrounds() {
      const declarations = yield* stylesheetDeclarations;

      const rendered = yield* renderToString(
        { init: () => ({ model: initialModel }), view: idaView },
        { isHydratable: false }
      );

      const links = [...rendered.html.matchAll(/<a\b[^>]*>Book Demo<\/a>/gu)];

      expect(links).toHaveLength(2);

      for (const link of links) {
        const [element] = elementsIn(link[0]);

        for (const width of [390, 1440]) {
          expect(
            winningValue(
              declarations,
              element?.classes ?? [],
              "background-color",
              width
            )
          ).toBe("#0000");
        }
      }
    })
  );

  test.effect("keeps each Hallmark step at its own live text width", () =>
    Effect.gen(function* checkStepWidths() {
      const declarations = yield* stylesheetDeclarations;
      const rendered = yield* renderedHallmark;
      const elements = elementsIn(rendered.html);
      const headings = elements.filter((element) => element.tag === "h3");

      expect(headings).toHaveLength(3);

      for (const [index, heading] of headings.entries()) {
        const body =
          heading.parent === undefined ? undefined : elements[heading.parent];

        for (const width of widths) {
          expect(
            winningValue(declarations, body?.classes ?? [], "max-width", width),
            `Hallmark step ${index + 1} at ${width}px`
          ).toBe(["44ch", "34ch", "40ch"][index]);
        }
      }
    })
  );

  test.effect(
    "keeps Hallmark chips, labels and step numbers monospace at both widths",
    () =>
      Effect.gen(function* checkMonospaceLabels() {
        const declarations = yield* stylesheetDeclarations;
        const rendered = yield* renderedHallmark;

        const monospaceLabels = [
          hallmark.codingLabel,
          hallmark.chatLabel,
          ...hallmark.codingAgents,
          ...hallmark.chatAgents,
          "1",
          "2",
          "3",
        ];

        const labels = [
          ...rendered.html.matchAll(
            /<(?:span|div)\b[^>]*>(?<text>[^<]*)<\/(?:span|div)>/gu
          ),
        ].filter((match) =>
          monospaceLabels.includes(
            (match.groups?.text ?? "").replaceAll("&amp;", "&")
          )
        );

        expect(labels).toHaveLength(monospaceLabels.length);

        for (const label of labels) {
          const [element] = elementsIn(label[0]);

          for (const width of widths) {
            expect(
              winningValue(
                declarations,
                element?.classes ?? [],
                "font-family",
                width
              )
            ).toMatch(/^["']?JetBrains Mono["']?,\s*ui-monospace/u);
          }
        }
      })
  );
});
