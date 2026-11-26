export interface Element {
  readonly classes: readonly string[];
  readonly parent: number | undefined;
  readonly tag: string;
}

const tokenPattern =
  /<(?<closing>\/?)(?<tag>[a-z][a-z0-9]*)\b(?<attributes>[^>]*)>/giu;

const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

const classesIn = (attributes: string): readonly string[] => {
  const quoted = /class="(?<value>[^"]*)"/u.exec(attributes)?.groups?.value;

  return (quoted ?? "").split(/\s+/u).filter((name) => name.length > 0);
};

export const elementsIn = (html: string): readonly Element[] => {
  const elements: Element[] = [];
  const open: number[] = [];

  for (const match of html.matchAll(tokenPattern)) {
    const tag = (match.groups?.tag ?? "").toLowerCase();
    const attributes = match.groups?.attributes ?? "";

    if (match.groups?.closing === "/") {
      const start = open.findLastIndex((index) => elements[index]?.tag === tag);

      if (start !== -1) {
        open.length = start;
      }

      continue;
    }

    elements.push({ classes: classesIn(attributes), parent: open.at(-1), tag });

    if (!voidElements.has(tag) && !attributes.trim().endsWith("/")) {
      open.push(elements.length - 1);
    }
  }

  return elements;
};

export const ancestorsOf = (
  elements: readonly Element[],
  index: number
): readonly Element[] => {
  const chain: Element[] = [];
  let current = elements[index]?.parent;

  while (current !== undefined) {
    const element = elements[current];

    if (element === undefined) {
      return chain;
    }

    chain.push(element);
    current = element.parent;
  }

  return chain;
};

export const childrenOf = (
  elements: readonly Element[],
  index: number
): readonly Element[] => elements.filter((element) => element.parent === index);
