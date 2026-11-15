// @effect-diagnostics nodeBuiltinImport:off -- The test reads the shipped crawler files and hashes them, a file-system boundary.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";

import { generatedCrawlerFiles } from "../scripts/crawler-files.js";
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
import { blogSlugs } from "./site-contract/manifest.js";

const OldSiteFiles = Schema.Struct({
  files: Schema.Record(
    Schema.String,
    Schema.Struct({ bytes: Schema.Int, sha256: Schema.String })
  ),
});

const oldSite = Schema.decodeSync(Schema.fromJsonString(OldSiteFiles))(
  readFileSync(
    new URL("fixtures/hypertask-crawler/old-site.json", import.meta.url),
    "utf-8"
  )
);

const read = (directory: string, name: string) =>
  readFileSync(new URL(name, new URL(directory, import.meta.url)));

const publicFile = (name: string) => read("../public/", name);

const builtFile = (name: string) => read("../dist/client/", name);

const digest = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

const utf8 = (text: string) => new TextEncoder().encode(text);

const matchesOldSite = (name: string, content: Uint8Array) => {
  const expected = oldSite.files[name];

  expect(content.length).toBe(expected?.bytes);
  expect(digest(content)).toBe(expected?.sha256);
};

const sitemap = () => sitemapXml(hypertaskOrigin, sitemapPaths(sitePaths()));

const feed = () => rssXml(hypertaskOrigin, publishedBlogPosts());

const crawlerTextFiles = ["llms-full.txt", "llms.txt", "robots.txt"];

const sitemapLocations = (content: string) =>
  [...content.matchAll(/<loc>(?<loc>.*?)<\/loc>/gu)].map(
    (match) => match.groups?.loc ?? ""
  );

describe("hypertask crawler files", () => {
  it("serves the feed bytes the old site serves", () => {
    matchesOldSite("rss.xml", utf8(feed()));
  });

  it("serves the sitemap bytes the old site serves", () => {
    matchesOldSite("sitemap-0.xml", utf8(sitemap()));
  });

  it("points the sitemap index at the crawlable sitemap", () => {
    matchesOldSite("sitemap-index.xml", utf8(sitemapIndexXml(hypertaskOrigin)));
  });

  it("serves the crawler text files the old site serves", () => {
    for (const name of crawlerTextFiles) {
      matchesOldSite(name, publicFile(name));
    }
  });

  it("keeps hidden pages out of the sitemap", () => {
    const content = sitemap();
    const locations = sitemapLocations(content);

    for (const hidden of hiddenPagePaths) {
      expect(isHiddenSitemapPath(hidden)).toBe(true);
      expect(locations).not.toContain(`${hypertaskOrigin}${hidden}`);
    }

    expect(isHiddenSitemapPath("/blog/tags/ai-agents/")).toBe(true);
    expect(content).not.toContain("/blog/tags/");

    expect(locations.length).toBe(52);

    for (const location of locations) {
      expect(location.startsWith(`${hypertaskOrigin}/`)).toBe(true);
      expect(location.endsWith("/")).toBe(true);
    }
  });

  it("lists every published post newest first", () => {
    const posts = publishedBlogPosts();
    const dates = posts.map((post) => post.date);
    const feedContent = feed();
    const sitemapContent = sitemap();

    expect(feedContent.match(/<item>/gu)?.length).toBe(posts.length);
    expect(dates).toEqual(dates.toSorted().toReversed());
    expect(posts.map((post) => post.slug).toSorted()).toEqual(
      [...blogSlugs].toSorted()
    );

    for (const post of posts) {
      expect(sitemapContent).toContain(
        `<loc>${hypertaskOrigin}/blog/${post.slug}/</loc>`
      );
    }

    expect(feedContent).toContain(
      `<link>${hypertaskOrigin}/blog/${posts[0]?.slug}/</link>`
    );
  });

  it("gives every crawler file its content type", () => {
    const headers = builtFile("_headers").toString("utf-8");

    for (const name of crawlerTextFiles) {
      expect(headers).toContain(
        `/${name}\n  Content-Type: text/plain; charset=utf-8`
      );
    }

    for (const crawlerPath of [
      "/rss.xml",
      "/sitemap-0.xml",
      "/sitemap-index.xml",
    ]) {
      expect(headers).toContain(
        `${crawlerPath}\n  Content-Type: application/xml`
      );
    }
  });

  it("ships every crawler file at its address in the built site", () => {
    for (const name of [
      "rss.xml",
      "sitemap-0.xml",
      "sitemap-index.xml",
      ...crawlerTextFiles,
    ]) {
      matchesOldSite(name, builtFile(name));
    }

    for (const file of generatedCrawlerFiles()) {
      expect(builtFile(file.path.slice(1)).toString("utf-8")).toBe(
        file.content
      );
    }
  });
});
