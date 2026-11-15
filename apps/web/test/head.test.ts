import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import {
  buildHead,
  canonicalFor,
  pageHeads,
} from "../src/features/head/index.js";
import oldHeadsJson from "./fixtures/old-heads.json" with { type: "json" };

const metaKeys = [
  "description",
  "robots",
  "og:title",
  "og:description",
  "og:image",
  "og:image:alt",
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

type MetaKey = (typeof metaKeys)[number];

type OldHead = Readonly<
  Partial<Record<MetaKey | "canonical" | "og:url" | "title", string>>
> & { readonly ld: readonly object[] };

const oldHeads = new Map<string, OldHead>(Object.entries(oldHeadsJson));

const parseJson = Schema.decodeUnknownSync(
  Schema.fromJsonString(Schema.Unknown)
);

const unescapeAttribute = (value: string): string =>
  value
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

const readMeta = (head: string): ReadonlyMap<string, string> =>
  new Map(
    [
      ...head.matchAll(
        /<meta (?:name|property)="(?<key>[^"]+)" content="(?<value>[^"]*)">/gu
      ),
    ].map(
      (match) =>
        [
          match.groups?.key ?? "",
          unescapeAttribute(match.groups?.value ?? ""),
        ] as const
    )
  );

const readJsonLd = (head: string): readonly unknown[] =>
  [
    ...head.matchAll(
      /<script type="application\/ld\+json">(?<json>.*?)<\/script>/gu
    ),
  ].map((match) => parseJson(match.groups?.json ?? "null"));

const headFor = (path: string): string => {
  const page = pageHeads.get(path);

  if (page === undefined) {
    throw new Error(`No head for ${path}`);
  }

  return buildHead(path, page);
};

const samplePaths = [...oldHeads.keys()];

const expectedMeta = (old: OldHead): ReadonlyMap<string, string> =>
  new Map(
    metaKeys.flatMap((key) => {
      const value = old[key];

      return value === undefined ? [] : [[key, value] as const];
    })
  );

describe("page head", () => {
  it("covers every captured page", () => {
    expect(samplePaths).toHaveLength(9);
    expect([...pageHeads.keys()].toSorted()).toEqual(samplePaths.toSorted());
  });

  for (const path of samplePaths) {
    describe(path, () => {
      const old = oldHeads.get(path);

      if (old === undefined) {
        throw new Error(`No old head for ${path}`);
      }

      it("keeps the old title", () => {
        expect(pageHeads.get(path)?.title).toBe(old.title);
      });

      it("keeps the old canonical and share address", () => {
        expect(canonicalFor(path)).toBe(old.canonical);
        expect(canonicalFor(path)).toBe(old["og:url"]);
      });

      it("keeps every old meta field and adds none", () => {
        expect(readMeta(headFor(path))).toEqual(expectedMeta(old));
      });

      it("keeps the old structured data", () => {
        expect(readJsonLd(headFor(path))).toEqual(old.ld);
      });
    });
  }

  it("marks the thank you page noindex", () => {
    expect(readMeta(headFor("/thank-you/")).get("robots")).toBe(
      "noindex, follow"
    );
  });

  it("escapes markup in values", () => {
    const head = buildHead("/x/", {
      description: 'a "b" <c> & d',
      title: "t",
    });

    expect(head).toContain("a &quot;b&quot; &lt;c&gt; &amp; d");
  });

  it("never loads anything from another host", () => {
    const loaded = samplePaths.flatMap((path) =>
      [...headFor(path).matchAll(/(?:src|href)="(?<url>https?:[^"]+)"/gu)].map(
        (match) => match.groups?.url
      )
    );

    expect(loaded).toEqual([]);
  });
});
