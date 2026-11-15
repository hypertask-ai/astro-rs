import { Option, Schema } from "effect";

import type {
  ObservedScript,
  ScriptPlacement,
} from "../src/features/analytics/index.js";

export type RecordedScript = ObservedScript &
  Readonly<{ order: number; place: ScriptPlacement }>;

const scriptElement = /<script\b(?<attributes>[^>]*)>(?<body>.*?)<\/script>/gsu;

const attribute = /(?<name>[^\s=/>]+)(?:="(?<value>[^"]*)")?/gu;

const rocketLoaderType = /^[0-9a-f]{8,}-(?<type>text\/javascript|module)$/u;

const structuredData = Schema.Struct({
  "@graph": Schema.Array(Schema.Struct({ "@type": Schema.String })),
});

const decodeStructuredData = Schema.decodeUnknownOption(
  Schema.fromJsonString(structuredData)
);

export const sourceScriptType = (served: string | null): string | null => {
  if (served === null) {
    return null;
  }

  const rewritten = rocketLoaderType.exec(served);

  if (rewritten === null) {
    return served;
  }

  return rewritten.groups?.type === "module" ? "module" : null;
};

export const readScriptAttributes = (
  source: string
): ReadonlyMap<string, string> => {
  const found = new Map<string, string>();

  for (const match of source.matchAll(attribute)) {
    const name = match.groups?.name;

    if (name !== undefined) {
      found.set(name.toLowerCase(), match.groups?.value ?? "");
    }
  }

  return found;
};

export const firstGraphType = (inline: string): string | null =>
  Option.match(decodeStructuredData(inline), {
    onNone: () => null,
    onSome: (data) => data["@graph"][0]?.["@type"] ?? null,
  });

const keptAttributes = (
  attributes: ReadonlyMap<string, string>
): readonly string[] =>
  [...attributes]
    .flatMap(([name, value]) =>
      name === "src" || name === "type"
        ? []
        : [value === "" ? name : `${name}="${value}"`]
    )
    .toSorted();

export const recordPageScripts = (html: string): readonly RecordedScript[] => {
  const headEnd = html.indexOf("</head>");

  return [...html.matchAll(scriptElement)].map((match, index) => {
    const attributes = readScriptAttributes(match.groups?.attributes ?? "");
    const type = sourceScriptType(attributes.get("type") ?? null);
    const inline = (match.groups?.body ?? "").trim();

    const place: ScriptPlacement =
      headEnd === -1 || match.index < headEnd ? "head" : "body";

    return {
      attributes: keptAttributes(attributes),
      graphType: type === "application/ld+json" ? firstGraphType(inline) : null,
      inline,
      order: index + 1,
      place,
      src: attributes.get("src") ?? null,
      type,
    };
  });
};
