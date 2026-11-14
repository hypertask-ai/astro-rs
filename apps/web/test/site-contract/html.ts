export interface HtmlTag {
  readonly attributes: ReadonlyMap<string, string>;
  readonly name: string;
}

const tagPattern = /<(?<name>[a-z][a-z0-9]*)\b(?<source>[^>]*)>/giu;

const attributePattern =
  /(?<key>[a-z][\w:-]*)\s*=\s*(?:"(?<double>[^"]*)"|'(?<single>[^']*)')/giu;

const parseAttributes = (source: string) =>
  new Map(
    [...source.matchAll(attributePattern)].flatMap((match) => {
      const { double, key, single } = match.groups ?? {};

      return key === undefined
        ? []
        : [[key.toLowerCase(), double ?? single ?? ""] as const];
    })
  );

export const tagsOf = (html: string, name: string): readonly HtmlTag[] => {
  const wanted = name.toLowerCase();

  return [...html.matchAll(tagPattern)].flatMap((match) => {
    const { name: tagName, source } = match.groups ?? {};

    return tagName?.toLowerCase() === wanted
      ? [{ attributes: parseAttributes(source ?? ""), name: wanted }]
      : [];
  });
};

export const titleOf = (html: string): string => {
  const match = /<title\b[^>]*>(?<text>[^<]*)<\/title>/iu.exec(html);

  const { text } = match?.groups ?? {};

  return text?.trim() ?? "";
};

export const metaContent = (
  html: string,
  key: "name" | "property",
  value: string
): string => {
  const tag = tagsOf(html, "meta").find(
    (candidate) => candidate.attributes.get(key) === value
  );

  return tag?.attributes.get("content")?.trim() ?? "";
};

export const internalHrefs = (html: string): readonly string[] => {
  const hrefs = new Set<string>();

  for (const tag of tagsOf(html, "a")) {
    const href = tag.attributes.get("href")?.trim();

    if (href?.startsWith("/") === true && !href.startsWith("//")) {
      hrefs.add(href.split("#")[0]?.split("?")[0] ?? "");
    }
  }

  hrefs.delete("");

  return [...hrefs];
};
