import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import * as ida from "../src/features/testimonial-ida/copy.js";
import { view as idaView } from "../src/features/testimonial-ida/index.js";
import { view as linearView } from "../src/features/vs-linear/index.js";
import {
  computedLineHeight,
  declarationsIn,
  winningValue,
} from "./css-cascade.js";

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

const classesIn = (element: string): readonly string[] =>
  (/class="(?<classes>[^"]*)"/u.exec(element)?.groups?.classes ?? "")
    .split(/\s+/u)
    .filter((name) => name.length > 0);

const pixels = (value: string): string =>
  value.endsWith("rem") ? `${Number(value.slice(0, -3)) * 16}px` : value;

const headingGroups = [
  {
    titles: [
      ida.challengeBefore.title,
      ida.challengeAfter.title,
      ...ida.results.map((result) => result.title),
    ],
    typeAt: () => ({ fontSize: "24px", lineHeight: "32px" }),
  },
  {
    titles: [
      ...ida.solutions.map((row) => row.title),
      ...ida.keyFeatures.map((row) => row.title),
      ida.bottomTitle,
    ],
    typeAt: (width: number) => {
      if (width >= 768) {
        return { fontSize: "36px", lineHeight: "40px" };
      }

      return width >= 640
        ? { fontSize: "30px", lineHeight: "36px" }
        : { fontSize: "24px", lineHeight: "30px" };
    },
  },
  {
    titles: ida.whyItWorks.map((reason) => reason.title),
    typeAt: () => ({ fontSize: "20px", lineHeight: "28px" }),
  },
];

it.layer(NodeServices.layer)("Linear and Ida live spacing", (test) => {
  test.effect(
    "keeps the live space around each phone comparison list item",
    () =>
      Effect.gen(function* checkPhoneListMargins() {
        const declarations = yield* stylesheetDeclarations;

        const page = yield* renderToString(
          { init: () => ({ model: initialModel }), view: linearView },
          { isHydratable: false }
        );

        const list = /<ul\b[^>]*>(?<items>[\s\S]*?)<\/ul>/u.exec(page.html);

        const items = [
          ...(list?.groups?.items ?? "").matchAll(/<li\b[^>]*>/gu),
        ];

        expect(items).toHaveLength(3);

        for (const item of items) {
          expect(
            winningValue(declarations, classesIn(item[0]), "margin-block", 390)
          ).toMatch(/^0?\.5em$/u);
        }
      })
  );

  test.effect(
    "keeps Ida phone details and captions at their live line heights",
    () =>
      Effect.gen(function* checkPhoneSmallType() {
        const declarations = yield* stylesheetDeclarations;

        const page = yield* renderToString(
          { init: () => ({ model: initialModel }), view: idaView },
          { isHydratable: false }
        );

        const paragraphs = [
          ...page.html.matchAll(/<p\b[^>]*>(?<text>[^<]*)<\/p>/gu),
        ];

        const groups = [
          {
            lineHeight: "20px",
            titles: [
              ...ida.challengeBefore.items.map((item) => item.detail),
              ...ida.challengeAfter.items.map((item) => item.detail),
              ...ida.results.map((result) => result.note),
            ],
          },
          {
            lineHeight: "16px",
            titles: [ida.challengeBefore.caption, ida.challengeAfter.caption],
          },
        ];

        for (const group of groups) {
          for (const title of group.titles) {
            const paragraph = paragraphs.find(
              (match) => match.groups?.text === title
            );

            const classes = classesIn(paragraph?.[0] ?? "");

            expect(classes.length, title).toBeGreaterThan(0);
            expect(
              pixels(
                winningValue(declarations, classes, "line-height", 390) ?? ""
              ),
              title
            ).toBe(group.lineHeight);
          }
        }
      })
  );

  test.effect(
    "keeps Ida phone images and calls to action in the live page flow",
    () =>
      Effect.gen(function* checkPhoneFlow() {
        const declarations = yield* stylesheetDeclarations;

        const page = yield* renderToString(
          { init: () => ({ model: initialModel }), view: idaView },
          { isHydratable: false }
        );

        const images = [
          ...page.html.matchAll(/<img\b[^>]*alt="[^"]*Feature Visual"[^>]*>/gu),
        ];

        const actions = [...page.html.matchAll(/<a\b[^>]*>Get Started<\/a>/gu)];
        const bottom = /<section\b[^>]*id="cta"[^>]*>/u.exec(page.html);

        expect(images).toHaveLength(7);
        expect(actions).toHaveLength(2);
        expect(bottom).not.toBeNull();

        for (const image of images) {
          expect(
            winningValue(declarations, classesIn(image[0]), "display", 390)
          ).toBe("block");
        }

        for (const [index, action] of actions.entries()) {
          const classes = classesIn(action[0]);

          expect(
            pixels(
              winningValue(declarations, classes, "line-height", 390) ?? ""
            )
          ).toBe(index === 0 ? "20px" : "24px");
          expect(winningValue(declarations, classes, "border-width", 390)).toBe(
            "0"
          );
        }

        expect(
          winningValue(
            declarations,
            classesIn(bottom?.[0] ?? ""),
            "padding-block",
            390
          )
        ).toBe("60px");
      })
  );

  test.effect("pads all three comparison headers like the live table", () =>
    Effect.gen(function* checkTableHeaders() {
      const declarations = yield* stylesheetDeclarations;

      const page = yield* renderToString(
        { init: () => ({ model: initialModel }), view: linearView },
        { isHydratable: false }
      );

      const headers = [...page.html.matchAll(/<th\b[^>]*scope="col"[^>]*>/gu)];

      expect(headers).toHaveLength(3);

      for (const header of headers) {
        const classes = classesIn(header[0]);

        for (const width of [390, 720, 721, 1440]) {
          expect(winningValue(declarations, classes, "padding", width)).toBe(
            width <= 720 ? "1rem" : "1.25rem 1.35rem"
          );
        }
      }
    })
  );

  test.effect(
    "keeps every Ida card and feature heading at its live line height",
    () =>
      Effect.gen(function* checkHeadingType() {
        const declarations = yield* stylesheetDeclarations;

        const page = yield* renderToString(
          { init: () => ({ model: initialModel }), view: idaView },
          { isHydratable: false }
        );

        const headings = [
          ...page.html.matchAll(/<h3\b[^>]*>(?<text>[^<]*)<\/h3>/gu),
        ];

        expect(headings).toHaveLength(17);

        for (const group of headingGroups) {
          for (const title of group.titles) {
            const heading = headings.find(
              (match) => match.groups?.text?.replaceAll("&amp;", "&") === title
            );

            const classes = classesIn(heading?.[0] ?? "");

            expect(classes.length, title).toBeGreaterThan(0);

            for (const width of [390, 639, 640, 767, 768, 1440]) {
              const fontSize = pixels(
                winningValue(declarations, classes, "font-size", width) ?? ""
              );

              const lineHeight = computedLineHeight(
                fontSize,
                pixels(
                  winningValue(declarations, classes, "line-height", width) ??
                    ""
                )
              );

              expect(
                { fontSize, lineHeight },
                `${title} at ${width}px`
              ).toEqual(group.typeAt(width));
            }
          }
        }
      })
  );
});
