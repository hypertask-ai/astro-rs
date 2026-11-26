export interface FooterMarks {
  readonly linkClasses: readonly string[];
  readonly navClasses: readonly string[];
}

const classAttribute = /class="(?<names>[^"]*)"/u;

const classesOf = (tag: string | undefined): readonly string[] =>
  (tag === undefined ? "" : (classAttribute.exec(tag)?.groups?.names ?? ""))
    .split(" ")
    .filter((name) => name.length > 0);

export const footerMarks = (html: string): FooterMarks => {
  const navTag = /<nav\b[^>]*aria-label="Footer"[^>]*>/u.exec(html)?.[0];
  const navStart = navTag === undefined ? -1 : html.indexOf(navTag);
  const linkTag =
    navStart < 0 ? undefined : /<a\b[^>]*>/u.exec(html.slice(navStart))?.[0];

  return {
    linkClasses: classesOf(linkTag),
    navClasses: classesOf(navTag),
  };
};

const firstToken = (value: string): string =>
  value.trim().split(/\s+/u)[0] ?? "";

const pixels = (value: string | undefined): number | undefined => {
  const found = /^(?<size>\d+(?:\.\d+)?)px$/u.exec(value ?? "");
  const size = found?.groups?.size;

  return size === undefined ? undefined : Number.parseFloat(size);
};

const declarationValue = (
  body: string | undefined,
  property: string
): string | undefined => {
  const found = new RegExp(
    `(?:^|;)\\s*${property}\\s*:\\s*(?<value>[^;]*)`,
    "u"
  ).exec(body ?? "");
  const value = found?.groups?.value;

  return value === undefined ? undefined : value.trim();
};

const baseRuleBody = (css: string, className: string): string | undefined =>
  new RegExp(`(?<![.\\w-])\\.${className}\\s*\\{([^{}]*)\\}`, "u").exec(css)?.[1];

const ruleBodies = (css: string, className: string): readonly string[] =>
  [
    ...css.matchAll(
      new RegExp(`\\.${className}(?:\\.${className})?\\s*\\{([^{}]*)\\}`, "gu")
    ),
  ].flatMap((match) => match[1] ?? "");

const firstPixels = (
  css: string,
  classNames: readonly string[],
  property: string
): number | undefined =>
  pixels(
    firstToken(
      classNames
        .flatMap(
          (name) => declarationValue(baseRuleBody(css, name), property) ?? []
        )
        .at(0) ?? ""
    )
  );

export const footerRowGaps = (
  css: string,
  navClasses: readonly string[]
): readonly number[] =>
  [
    ...new Set(
      navClasses
        .flatMap((name) => ruleBodies(css, name))
        .flatMap((body) => declarationValue(body, "row-gap") ?? [])
        .flatMap((value) => pixels(firstToken(value)) ?? [])
    ),
  ].sort((left, right) => left - right);

export const footerPhoneRowGap = (
  css: string,
  navClasses: readonly string[]
): number | undefined => firstPixels(css, navClasses, "row-gap");

export const footerLinkHeight = (
  css: string,
  linkClasses: readonly string[]
): number | undefined => {
  const lineHeight = firstPixels(css, linkClasses, "line-height");
  const block = firstPixels(css, linkClasses, "padding-block");
  const top = firstPixels(css, linkClasses, "padding-top") ?? block;
  const bottom = firstPixels(css, linkClasses, "padding-bottom") ?? block;

  return lineHeight === undefined || top === undefined || bottom === undefined
    ? undefined
    : lineHeight + top + bottom;
};
