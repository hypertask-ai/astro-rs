import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import { crawlerFileHeaders } from "../scripts/crawler-files.js";
import { publishedBlogPosts } from "../src/hypertask/blog-index.js";
import {
  hypertaskOrigin,
  rssXml,
  sitemapIndexXml,
  sitemapXml,
} from "../src/hypertask/crawler-files.js";
import {
  hiddenPagePaths,
  isHiddenSitemapPath,
  sitePaths,
  sitemapPaths,
} from "../src/hypertask/route-manifest.js";

const application = path.join(import.meta.dirname, "..");

const OldSiteFiles = Schema.Struct({
  files: Schema.Record(
    Schema.String,
    Schema.Struct({ bytes: Schema.Number, sha256: Schema.String })
  ),
});

const oldSite = Schema.decodeUnknownSync(Schema.fromJsonString(OldSiteFiles))(
  readFileSync(
    path.join(application, "test/fixtures/hypertask-crawler/old-site.json"),
    "utf-8"
  )
);

const sha256 = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

const sitemap = () => sitemapXml(hypertaskOrigin, sitemapPaths(sitePaths()));

const feed = () => rssXml(hypertaskOrigin, publishedBlogPosts());

const matchesOldSite = (name: string, bytes: Uint8Array) => {
  const expected = oldSite.files[name];

  expect(bytes.length).toBe(expected?.bytes);
  expect(sha256(bytes)).toBe(expected?.sha256);
};

describe("hypertask crawler files", () => {
  it("serves the feed bytes the old site serves", () => {
    matchesOldSite("rss.xml", new TextEncoder().encode(feed()));
  });

  it("serves the sitemap bytes the old site serves", () => {
    matchesOldSite("sitemap-0.xml", new TextEncoder().encode(sitemap()));
  });

  it("serves the crawler text files the old site serves", () => {
    for (const name of ["llms-full.txt", "llms.txt", "robots.txt"]) {
      matchesOldSite(
        name,
        readFileSync(path.join(application, "static", name))
      );
    }
  });

  it("keeps hidden pages out of the sitemap", () => {
    const locs = [...sitemap().matchAll(/<loc>(?<loc>.*?)<\/loc>/gu)].map(
      (match) => match.groups?.loc ?? ""
    );

    for (const hidden of hiddenPagePaths) {
      expect(isHiddenSitemapPath(hidden)).toBe(true);
      expect(locs).not.toContain(`${hypertaskOrigin}${hidden}`);
    }

    expect(isHiddenSitemapPath("/blog/tags/ai-agents/")).toBe(true);
    expect(sitemap()).not.toContain("/blog/tags/");

    expect(locs.length).toBe(52);

    for (const loc of locs) {
      expect(loc.startsWith(`${hypertaskOrigin}/`)).toBe(true);
      expect(loc.endsWith("/")).toBe(true);
    }
  });

  it("lists every published post newest first", () => {
    const posts = publishedBlogPosts();
    const dates = posts.map((post) => post.date);

    expect(feed().match(/<item>/gu)?.length).toBe(posts.length);
    expect(dates).toEqual(dates.toSorted().toReversed());

    for (const post of posts) {
      expect(sitemap()).toContain(
        `<loc>${hypertaskOrigin}/blog/${post.slug}/</loc>`
      );
    }

    expect(feed()).toContain(
      `<link>${hypertaskOrigin}/blog/${posts[0]?.slug}/</link>`
    );
  });

  it("points the sitemap index at the crawlable sitemap", () => {
    matchesOldSite(
      "sitemap-index.xml",
      new TextEncoder().encode(sitemapIndexXml(hypertaskOrigin))
    );
  });

  it("gives every crawler file its content type", () => {
    for (const name of ["llms-full.txt", "llms.txt", "robots.txt"]) {
      expect(crawlerFileHeaders).toContain(
        `/${name}\n  Content-Type: text/plain; charset=utf-8\n`
      );
    }

    for (const crawlerPath of [
      "/rss.xml",
      "/sitemap-0.xml",
      "/sitemap-index.xml",
    ]) {
      expect(crawlerFileHeaders).toContain(
        `${crawlerPath}\n  Content-Type: application/xml\n`
      );
    }
  });
});
