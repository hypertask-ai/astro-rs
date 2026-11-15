import * as stylex from "@stylexjs/stylex";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { page } from "../page/index.js";
import { styles } from "./legal.stylex.js";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

export type Inline =
  | Readonly<{ href: string; kind: "link"; label: string }>
  | Readonly<{ kind: "text"; text: string }>;

export type ProseKind = "bullet" | "heading" | "lines" | "paragraph";

export type Prose = Readonly<{ kind: ProseKind; runs: readonly Inline[] }>;

export type LegalPage = Readonly<{
  blocks: readonly Prose[];
  fallbackTitle: string;
  heading: string;
  path: string;
}>;

const run = (h: HtmlBuilder<AppMessage>, inline: Inline): Html | string => {
  if (inline.kind === "link") {
    return h.a(
      [h.Href(inline.href), h.Class(classes(styles.link))],
      [inline.label]
    );
  }

  return inline.text;
};

const prose = (
  h: HtmlBuilder<AppMessage>,
  inline: readonly Inline[]
): readonly (Html | string)[] => inline.map((entry) => run(h, entry));

const spaced = (
  h: HtmlBuilder<AppMessage>,
  inline: readonly Inline[]
): readonly (Html | string)[] =>
  inline.flatMap((entry, index) =>
    index === 0 ? [run(h, entry)] : [h.br([]), run(h, entry)]
  );

const bulletRun = (
  blocks: readonly Prose[],
  start: number
): readonly Prose[] => {
  const rest = blocks.slice(start);
  const stop = rest.findIndex((block) => block.kind !== "bullet");

  return stop === -1 ? rest : rest.slice(0, stop);
};

const list = (
  h: HtmlBuilder<AppMessage>,
  blocks: readonly Prose[],
  start: number
): Html =>
  h.ul(
    [h.Class(classes(styles.list))],
    bulletRun(blocks, start).map((block) => h.li([], prose(h, block.runs)))
  );

const blockAt = (
  h: HtmlBuilder<AppMessage>,
  blocks: readonly Prose[],
  index: number
): readonly Html[] => {
  const block = blocks[index];

  if (block === undefined) {
    return [];
  }

  switch (block.kind) {
    case "bullet": {
      return blocks[index - 1]?.kind === "bullet"
        ? []
        : [list(h, blocks, index)];
    }

    case "heading": {
      return [h.h2([h.Class(classes(styles.heading))], prose(h, block.runs))];
    }

    case "lines": {
      return [h.p([h.Class(classes(styles.paragraph))], spaced(h, block.runs))];
    }

    case "paragraph": {
      return [h.p([h.Class(classes(styles.paragraph))], prose(h, block.runs))];
    }

    default: {
      return block satisfies never;
    }
  }
};

const blocksOf = (
  h: HtmlBuilder<AppMessage>,
  blocks: readonly Prose[]
): readonly Html[] =>
  blocks.flatMap((block, index) => blockAt(h, blocks, index));

export const legalPage = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>,
  contents: LegalPage
): Document =>
  page(
    model,
    h,
    contents.path,
    [
      h.section(
        [h.Class(classes(styles.section))],
        [
          h.div(
            [h.Class(classes(styles.container))],
            [
              h.div(
                [h.Class(classes(styles.header))],
                [h.h1([h.Class(classes(styles.title))], [contents.heading])]
              ),
              h.div(
                [h.Class(classes(styles.card))],
                blocksOf(h, contents.blocks)
              ),
            ]
          ),
        ]
      ),
    ],
    contents.fallbackTitle
  );
