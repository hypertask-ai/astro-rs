import type { Block, HeadingLevel, Inline } from "@foldkit/markdown";
import { Match, Predicate } from "effect";

export type TocHeading = Readonly<{
  id: string;
  level: HeadingLevel;
  text: string;
}>;

export const inlineText = (content: readonly Inline[]): string => {
  const parts: string[] = [];

  for (const node of content) {
    parts.push(
      Match.value(node).pipe(
        Match.withReturnType<string>(),
        Match.tagsExhaustive({
          Emphasis: (emphasis) => inlineText(emphasis.content),
          HardBreak: () => " ",
          Image: (image) => image.alt,
          InlineCode: (code) => code.value,
          Link: (link) => inlineText(link.content),
          Strikethrough: (strikethrough) => inlineText(strikethrough.content),
          Strong: (strong) => inlineText(strong.content),
          Text: (text) => text.value,
        })
      )
    );
  }

  return parts.join("");
};

export const blockText = (block: Block): string =>
  Match.value(block).pipe(
    Match.withReturnType<string>(),
    Match.tagsExhaustive({
      Blockquote: (blockquote) =>
        blockquote.blocks.map((child) => blockText(child)).join(" "),
      CodeBlock: (codeBlock) => codeBlock.value,
      Heading: (heading) => inlineText(heading.content),
      Island: (island) =>
        island.blocks.map((child) => blockText(child)).join(" "),
      List: (list) =>
        list.items
          .map((item) => item.blocks.map((child) => blockText(child)).join(" "))
          .join(" "),
      Paragraph: (paragraph) => inlineText(paragraph.content),
      Table: (table) =>
        [table.headerRow, ...table.bodyRows]
          .map((row) =>
            row.cells.map((cell) => inlineText(cell.content)).join(" ")
          )
          .join(" "),
      ThematicBreak: () => "",
    })
  );

export const blockTexts = (blocks: readonly Block[]): string =>
  blocks.map((block) => blockText(block)).join(" ");

const slug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replaceAll(/<[!/a-z].*?>/gu, "")
    .replaceAll(
      /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/gu,
      ""
    )
    .replaceAll(/\s/gu, "-");

const uniqueSlug = (seen: Map<string, number>, value: string): string => {
  const base = slug(value);
  const count = seen.get(base);

  if (count === undefined) {
    seen.set(base, 0);

    return base;
  }

  const next = count + 1;
  seen.set(base, next);

  return `${base}-${next}`;
};

export const headingTree = (
  blocks: readonly Block[]
): readonly TocHeading[] => {
  const seen = new Map<string, number>();
  const headings: TocHeading[] = [];

  const walk = (items: readonly Block[]): void => {
    for (const block of items) {
      if (Predicate.isTagged(block, "Heading")) {
        const text = inlineText(block.content);

        headings.push({
          id: uniqueSlug(seen, text),
          level: block.level,
          text,
        });
      } else if (Predicate.isTagged(block, "List")) {
        for (const item of block.items) {
          walk(item.blocks);
        }
      } else if (Predicate.isTagged(block, "Blockquote")) {
        walk(block.blocks);
      } else if (Predicate.isTagged(block, "Island")) {
        walk(block.blocks);
      }
    }
  };

  walk(blocks);

  return headings;
};
