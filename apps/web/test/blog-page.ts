import { Schema } from "effect";

import type { HeadTags } from "./page-facts.js";
import { linkTargets } from "./page-facts.js";

export interface BlogImage {
  readonly alt: string;
  readonly fetchpriority: string;
  readonly loading: string;
  readonly src: string;
}

export interface BlogHeading {
  readonly id: string;
  readonly level: number;
  readonly text: string;
}

export interface BlogCodeBlock {
  readonly language: string;
  readonly text: string;
}

export type BlogTable = readonly (readonly string[])[];

export interface BlogSource {
  readonly bytes: number;
  readonly fetchedAt: string;
  readonly method: string;
  readonly sha256: string;
  readonly status: number;
  readonly url: string;
}

export interface BlogFacts {
  readonly address: string;
  readonly codeBlocks: readonly BlogCodeBlock[];
  readonly head: HeadTags;
  readonly headings: readonly BlogHeading[];
  readonly images: readonly BlogImage[];
  readonly links: readonly string[];
  readonly source: BlogSource;
  readonly structuredData: readonly unknown[];
  readonly tables: readonly BlogTable[];
  readonly visibleText: readonly string[];
}

const namedEntities = new Map<string, string>([
  ["amp", "&"],
  ["apos", "'"],
  ["copy", "©"],
  ["gt", ">"],
  ["lt", "<"],
  ["minus", "−"],
  ["nbsp", "\u00A0"],
  ["quot", '"'],
  ["rsquo", "’"],
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

const attributesOf = (source: string): ReadonlyMap<string, string> =>
  new Map(
    [...source.matchAll(/(?<key>[a-z][\w:-]*)\s*=\s*"(?<value>[^"]*)"/giu)].map(
      (match) =>
        [
          (match.groups?.key ?? "").toLowerCase(),
          match.groups?.value ?? "",
        ] as const
    )
  );

const bodyOf = (html: string): string => {
  const start = html.indexOf("<body");
  const end = html.indexOf("</body>");

  return start === -1 || end === -1 ? "" : html.slice(start, end);
};

const withoutNoise = (html: string): string =>
  bodyOf(html)
    .replaceAll(
      /<section\b[^>]*id="cookie-consent"[^>]*>[\s\S]*?<\/section>/gu,
      ""
    )
    .replaceAll(/<!--[\s\S]*?-->/gu, "")
    .replaceAll(
      /<(?<tag>script|style|template)\b[^>]*>[\s\S]*?<\/\k<tag>>/gu,
      ""
    );

const withoutCode = (html: string): string =>
  html.replaceAll(/<pre\b[^>]*>[\s\S]*?<\/pre>/gu, "");

const visibleTextOf = (html: string): readonly string[] =>
  withoutNoise(withoutCode(html))
    .replaceAll(/<[^>]+>/gu, "\u0000")
    .split("\u0000")
    .map((chunk) => decodeEntities(chunk).replaceAll(/\s+/gu, " ").trim())
    .filter((chunk) => chunk !== "");

const inlineText = (html: string): string =>
  decodeEntities(html.replaceAll(/<[^>]+>/gu, " "))
    .replaceAll(/\s+/gu, " ")
    .trim();

const headingsOf = (html: string): readonly BlogHeading[] =>
  [
    ...bodyOf(html).matchAll(
      /<h(?<level>[1-6])\b(?<attributes>[^>]*)>(?<text>[\s\S]*?)<\/h[1-6]>/gu
    ),
  ].map((match) => {
    const attributes = attributesOf(match.groups?.attributes ?? "");

    return {
      id: attributes.get("id") ?? "",
      level: Number(match.groups?.level ?? "0"),
      text: inlineText(match.groups?.text ?? ""),
    };
  });

const imagesOf = (html: string): readonly BlogImage[] =>
  [...withoutNoise(html).matchAll(/<img\b(?<attributes>[^>]*)>/gu)].map(
    (match) => {
      const attributes = attributesOf(match.groups?.attributes ?? "");

      return {
        alt: attributes.get("alt") ?? "",
        fetchpriority: attributes.get("fetchpriority") ?? "",
        loading: attributes.get("loading") ?? "",
        src: decodeURI(attributes.get("src") ?? ""),
      };
    }
  );

const tablesOf = (html: string): readonly BlogTable[] =>
  [...bodyOf(html).matchAll(/<table\b[^>]*>(?<table>[\s\S]*?)<\/table>/gu)].map(
    (table) =>
      [
        ...(table.groups?.table ?? "").matchAll(
          /<tr\b[^>]*>(?<row>[\s\S]*?)<\/tr>/gu
        ),
      ].map((row) =>
        [
          ...(row.groups?.row ?? "").matchAll(
            /<t[hd]\b[^>]*>(?<cell>[\s\S]*?)<\/t[hd]>/gu
          ),
        ].map((cell) => inlineText(cell.groups?.cell ?? ""))
      )
  );

const codeBlocksOf = (html: string): readonly BlogCodeBlock[] =>
  [
    ...bodyOf(html).matchAll(
      /<pre\b(?<attributes>[^>]*)>(?<body>[\s\S]*?)<\/pre>/gu
    ),
  ].map((match) => {
    const attributes = attributesOf(match.groups?.attributes ?? "");

    return {
      language: attributes.get("data-language") ?? "",
      text: decodeEntities(
        (match.groups?.body ?? "").replaceAll(/<[^>]+>/gu, "")
      ),
    };
  });

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
  "article:published_time",
  "article:modified_time",
  "article:author",
  "article:section",
] as const;

const headTagsOf = (html: string): HeadTags => {
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

const parseJson = Schema.decodeUnknownSync(
  Schema.fromJsonString(Schema.Unknown)
);

const structuredDataOf = (html: string): readonly unknown[] =>
  [
    ...html.matchAll(
      /<script type="application\/ld\+json">(?<json>.*?)<\/script>/gu
    ),
  ].map((match) => parseJson(match.groups?.json ?? "null"));

export const factsOf = (
  html: string
): Omit<BlogFacts, "address" | "source"> => ({
  codeBlocks: codeBlocksOf(html),
  head: headTagsOf(html),
  headings: headingsOf(html),
  images: imagesOf(html),
  links: linkTargets(html),
  structuredData: structuredDataOf(html),
  tables: tablesOf(html),
  visibleText: visibleTextOf(html),
});
