import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import { useCasePages } from "../src/features/use-cases/copy.js";
import { useCaseViewFor } from "../src/features/use-cases/index.js";
import { declarationsIn, winningValue } from "./css-cascade.js";
import type { Declaration } from "./css-cascade.js";
import {
  contentCoversGlow,
  customPropertiesIn,
  paintsOverPageBackground,
  resolveColour,
} from "./css-paint.js";
import type { PaintedLayer } from "./css-paint.js";
import { ancestorsOf, childrenOf, elementsIn } from "./html-tree.js";
import type { Element } from "./html-tree.js";

const stylesheetFiles = (listing: readonly string[]): readonly string[] =>
  listing
    .filter((file) => file.endsWith(".css"))
    .toSorted((left, right) => left.localeCompare(right));

interface BuiltSite {
  readonly customProperties: ReadonlyMap<string, string>;
  readonly declarations: readonly Declaration[];
}

const builtSite = Effect.gen(function* readBuiltSite() {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const client = path.resolve(import.meta.dirname, "../dist/client");
  const listing = yield* fs.readDirectory(client, { recursive: true });

  const sheets = yield* Effect.forEach(stylesheetFiles(listing), (file) =>
    fs.readFileString(path.join(client, file))
  );

  const css = sheets.join("\n");

  return {
    customProperties: customPropertiesIn(css),
    declarations: declarationsIn(css),
  };
});

const layerOf = (
  element: Element,
  site: BuiltSite,
  width: number
): PaintedLayer => {
  const read = (property: string, fallback: string): string =>
    winningValue(site.declarations, element.classes, property, width) ??
    fallback;

  return {
    backgroundColor: resolveColour(
      read("background-color", "transparent"),
      site.customProperties
    ),
    position: read("position", "static"),
    tag: element.tag,
    zIndex: read("z-index", "auto"),
  };
};

const blurredIndexes = (
  site: BuiltSite,
  elements: readonly Element[]
): readonly number[] =>
  elements.flatMap((element, index) => {
    const filter =
      winningValue(site.declarations, element.classes, "filter", 1440) ?? "";

    return filter.startsWith("blur(") ? [index] : [];
  });

const glowWrapperOf = (elements: readonly Element[], glow: number): number => {
  const wrapper = elements[glow]?.parent;

  if (wrapper === undefined) {
    throw new Error("A blurred glow has no wrapper element");
  }

  return wrapper;
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

it.layer(NodeServices.layer)("use case glow paint order", (test) => {
  for (const page of useCasePages) {
    test.effect(
      `${page.path} preserves the live gradient alpha after CSS compilation at both widths`,
      () =>
        Effect.gen(function* compareGradientAlpha() {
          const site = yield* builtSite;
          const rendered = yield* renderUseCasePage(page.path);
          const elements = elementsIn(rendered.html);
          const glows = blurredIndexes(site, elements);

          expect(glows).toHaveLength(2);

          for (const width of [390, 1440]) {
            for (const glow of glows) {
              const element = elements[glow];

              if (element === undefined) {
                throw new Error("A glow index is out of range");
              }

              const image =
                winningValue(
                  site.declarations,
                  element.classes,
                  "background-image",
                  width
                ) ?? "";

              const alphas = [
                ...image.matchAll(/var\((?<name>--[\w-]+)\)/gu),
              ].map((match) =>
                Number(site.customProperties.get(match.groups?.name ?? ""))
              );

              expect(alphas, `Glow at ${width}px`).toEqual([0.25, 0.25]);
            }

            const cards = elements.filter((element) => {
              const image =
                winningValue(
                  site.declarations,
                  element.classes,
                  "background-image",
                  width
                ) ?? "";

              return image.startsWith("linear-gradient(to bottom,");
            });

            expect(cards).toHaveLength(1);

            for (const card of cards) {
              const image =
                winningValue(
                  site.declarations,
                  card.classes,
                  "background-image",
                  width
                ) ?? "";

              const name =
                /var\((?<name>--[\w-]+)\)/u.exec(image)?.groups?.name ?? "";

              expect(
                Number(site.customProperties.get(name)),
                `Card at ${width}px`
              ).toBe(0.05);
            }
          }
        })
    );

    test.effect(
      `${page.path} paints its hero and closing glows above the page background`,
      () =>
        Effect.gen(function* compareGlowPaint() {
          const site = yield* builtSite;
          const rendered = yield* renderUseCasePage(page.path);
          const elements = elementsIn(rendered.html);
          const glows = blurredIndexes(site, elements);

          expect(glows.length).toBe(2);

          for (const width of [390, 700, 1440]) {
            for (const glow of glows) {
              const wrapper = glowWrapperOf(elements, glow);
              const wrapperElement = elements[wrapper];

              if (wrapperElement === undefined) {
                throw new Error("A glow wrapper index is out of range");
              }

              const wrapperLayer = layerOf(wrapperElement, site, width);

              const ancestors = ancestorsOf(elements, wrapper).map((ancestor) =>
                layerOf(ancestor, site, width)
              );

              expect({
                paintsOverPageBackground: paintsOverPageBackground(
                  wrapperLayer,
                  ancestors
                ),
                width,
              }).toEqual({ paintsOverPageBackground: true, width });

              const siblings = childrenOf(elements, wrapperElement.parent);
              const content = siblings[siblings.indexOf(wrapperElement) + 1];

              if (content === undefined) {
                throw new Error("A glow wrapper has nothing painted beside it");
              }

              expect({
                contentAboveGlow: contentCoversGlow(
                  layerOf(content, site, width),
                  wrapperLayer
                ),
                width,
              }).toEqual({ contentAboveGlow: true, width });
            }
          }
        })
    );
  }
});
