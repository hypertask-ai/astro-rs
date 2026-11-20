export interface HomeImage {
  readonly alt: string;
  readonly fetchpriority: string;
  readonly height: string;
  readonly loading: string;
  readonly src: string;
  readonly width: string;
}

export interface HeadTags {
  readonly canonical: string;
  readonly meta: Readonly<Record<string, string>>;
  readonly title: string;
}

const comparedMetaKeys = [
  "description",
  "robots",
  "og:title",
  "og:description",
  "og:image",
  "og:image:alt",
  "og:url",
  "og:type",
  "og:site_name",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
  "twitter:image:alt",
] as const;

const attributePattern = /(?<key>[a-z][\w:-]*)\s*=\s*"(?<value>[^"]*)"/giu;

const attributesOf = (source: string): ReadonlyMap<string, string> =>
  new Map(
    [...source.matchAll(attributePattern)].map(
      (match) =>
        [
          (match.groups?.key ?? "").toLowerCase(),
          match.groups?.value ?? "",
        ] as const
    )
  );

const namedEntities = new Map<string, string>([
  ["amp", "&"],
  ["apos", "'"],
  ["bull", "•"],
  ["copy", "©"],
  ["deg", "°"],
  ["gt", ">"],
  ["hellip", "…"],
  ["larr", "←"],
  ["ldquo", "“"],
  ["lsquo", "‘"],
  ["lt", "<"],
  ["mdash", "—"],
  ["middot", "·"],
  ["minus", "−"],
  ["nbsp", "\u00A0"],
  ["ndash", "–"],
  ["quot", '"'],
  ["rarr", "→"],
  ["rdquo", "”"],
  ["rsquo", "’"],
  ["times", "×"],
]);

const numericEntity = (name: string): string => {
  const code = name.toLowerCase().startsWith("#x")
    ? Number(`0x${name.slice(2)}`)
    : Math.trunc(Number(name.slice(1)));

  return Number.isNaN(code) ? `&${name};` : String.fromCodePoint(code);
};

const decodeEntities = (value: string): string =>
  value.replaceAll(
    /&(?<name>#\d+|#x[0-9a-f]+|[a-z]+);/giu,
    (whole: string, name: string): string =>
      name.startsWith("#")
        ? numericEntity(name)
        : (namedEntities.get(name.toLowerCase()) ?? whole)
  );

const bodyOf = (html: string): string => {
  const start = html.indexOf("<body");
  const end = html.indexOf("</body>");

  return start === -1 || end === -1 ? "" : html.slice(start, end);
};

const withoutCookieBanner = (html: string): string =>
  html.replaceAll(
    /<section\b[^>]*id="cookie-consent"[^>]*>[\s\S]*?<\/section>/gu,
    ""
  );

const commentMarkers = { close: "-->", open: "<!--" } as const;

const withoutComments = (html: string): string => {
  let text = html;

  for (;;) {
    const start = text.indexOf(commentMarkers.open);

    if (start === -1) {
      return text;
    }

    const end = text.indexOf(
      commentMarkers.close,
      start + commentMarkers.open.length
    );

    text =
      end === -1
        ? text.slice(0, start)
        : text.slice(0, start) + text.slice(end + commentMarkers.close.length);
  }
};

const blockedElements = ["script", "style", "template"] as const;

const withoutBlockedElements = (html: string): string => {
  let text = html;

  for (;;) {
    let changed = false;

    for (const element of blockedElements) {
      const open = text.indexOf(`<${element}`);
      const tagEnd = open === -1 ? -1 : text.indexOf(">", open);
      const close = tagEnd === -1 ? -1 : text.indexOf(`</${element}>`, tagEnd);

      if (open === -1 || tagEnd === -1 || close === -1) {
        continue;
      }

      text = text.slice(0, open) + text.slice(close + `</${element}>`.length);
      changed = true;
    }

    if (!changed) {
      return text;
    }
  }
};

const withoutNoise = (html: string): string =>
  withoutBlockedElements(withoutComments(withoutCookieBanner(bodyOf(html))));

const inlineText = (html: string): string =>
  decodeEntities(html.replaceAll(/<[^>]+>/gu, " "))
    .replaceAll(/\s+/gu, " ")
    .trim();

export const visibleText = (html: string): readonly string[] =>
  withoutNoise(html)
    .replaceAll(/<[^>]+>/gu, "\u0000")
    .split("\u0000")
    .map((text) => decodeEntities(text).replaceAll(/\s+/gu, " ").trim())
    .filter((text) => text !== "");

export const headings = (html: string): readonly string[] =>
  [
    ...bodyOf(html).matchAll(
      /<h(?<level>[1-6])\b[^>]*>(?<text>[\s\S]*?)<\/h[1-6]>/gu
    ),
  ].map(
    (match) =>
      `h${match.groups?.level}: ${inlineText(
        withoutComments(match.groups?.text ?? "")
      )}`
  );

export const linkTargets = (html: string): readonly string[] =>
  [...withoutNoise(html).matchAll(/<a\b(?<attributes>[^>]*)>/gu)].map(
    (match) => attributesOf(match.groups?.attributes ?? "").get("href") ?? ""
  );

export const images = (html: string): readonly HomeImage[] =>
  [...withoutNoise(html).matchAll(/<img\b(?<attributes>[^>]*)>/gu)].map(
    (match) => {
      const attributes = attributesOf(match.groups?.attributes ?? "");

      return {
        alt: decodeEntities(attributes.get("alt") ?? ""),
        fetchpriority: attributes.get("fetchpriority") ?? "",
        height: attributes.get("height") ?? "",
        loading: attributes.get("loading") ?? "",
        src: decodeURI(attributes.get("src") ?? ""),
        width: attributes.get("width") ?? "",
      };
    }
  );

export const headTags = (html: string): HeadTags => {
  const start = html.indexOf("<head");
  const end = html.indexOf("</head>");
  const head = start === -1 || end === -1 ? "" : html.slice(start, end);

  const metas = new Map(
    [...head.matchAll(/<meta\b(?<attributes>[^>]*)>/gu)].flatMap((match) => {
      const attributes = attributesOf(match.groups?.attributes ?? "");
      const key = attributes.get("name") ?? attributes.get("property");
      const content = attributes.get("content");

      return key === undefined || content === undefined
        ? []
        : [[key, decodeEntities(content)] as const];
    })
  );

  const canonical = [...head.matchAll(/<link\b(?<attributes>[^>]*)>/gu)]
    .map((match) => attributesOf(match.groups?.attributes ?? ""))
    .find((attributes) => attributes.get("rel") === "canonical");

  const title = /<title\b[^>]*>(?<text>[\s\S]*?)<\/title>/u.exec(head);

  return {
    canonical: decodeURI(canonical?.get("href") ?? ""),
    meta: Object.fromEntries(
      comparedMetaKeys.flatMap((key) => {
        const value = metas.get(key);

        return value === undefined ? [] : [[key, value] as const];
      })
    ),
    title: decodeEntities(title?.groups?.text ?? "").trim(),
  };
};
