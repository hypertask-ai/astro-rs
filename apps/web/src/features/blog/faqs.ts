import type { Block, MarkdownDocument } from "@foldkit/markdown";
import { Predicate } from "effect";

import { blockTexts, inlineText } from "./headings.js";

export type Faq = Readonly<{
  answer: string;
  question: string;
}>;

const faqTitle = "Frequently Asked Questions";

const normalise = (value: string): string =>
  value.replaceAll(/\s+/gu, " ").trim();

type HeadingBlock = Extract<Block, { readonly _tag: "Heading" }>;

const isHeadingAt = (block: Block, level: number): block is HeadingBlock =>
  Predicate.isTagged(block, "Heading") && block.level === level;

export const faqsFrom = (document: MarkdownDocument): readonly Faq[] => {
  const start = document.blocks.findIndex(
    (block) =>
      isHeadingAt(block, 2) && normalise(inlineText(block.content)) === faqTitle
  );

  if (start === -1) {
    return [];
  }

  const section: Block[] = [];

  for (const block of document.blocks.slice(start + 1)) {
    if (Predicate.isTagged(block, "ThematicBreak")) {
      break;
    }

    if (isHeadingAt(block, 1) || isHeadingAt(block, 2)) {
      break;
    }

    section.push(block);
  }

  const faqs: Faq[] = [];
  let question: string | null = null;
  let answers: Block[] = [];

  const flush = (): void => {
    if (question !== null) {
      const answer = normalise(blockTexts(answers));

      if (question !== "" && answer !== "") {
        faqs.push({ answer, question });
      }
    }
  };

  for (const block of section) {
    if (isHeadingAt(block, 3)) {
      flush();
      question = normalise(inlineText(block.content));
      answers = [];
    } else if (question !== null) {
      answers.push(block);
    }
  }

  flush();

  return faqs;
};
