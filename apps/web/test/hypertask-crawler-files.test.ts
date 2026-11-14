import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Schema } from "effect";
import { Digest } from "effect/crypto";

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

const application = `${import.meta.dirname}/..`;

const OldSiteFiles = Schema.Struct({
  files: Schema.Record(
    Schema.String,
    Schema.Struct({ bytes: Schema.Finite, sha256: Schema.String })
  ),
});

const services = Layer.mergeAll(NodeServices.layer, Digest.layerWebCrypto);

const servicesForTests = it.layer(services);

const readOldSite = Effect.gen(function* readOldSiteFixture() {
  const fs = yield* FileSystem.FileSystem;

  const text = yield* fs.readFileString(
    `${application}/test/fixtures/hypertask-crawler/old-site.json`
  );

  return Schema.decodeSync(Schema.fromJsonString(OldSiteFiles))(text);
});

const utf8 = (text: string) => new TextEncoder().encode(text);

const sha256 = (content: Uint8Array) =>
  Effect.gen(function* sha256Hex() {
    const digest = yield* Digest.Digest;

    return yield* digest.digestHex(Digest.sha256, content);
  });

const sitemap = () => sitemapXml(hypertaskOrigin, sitemapPaths(sitePaths()));

const feed = () => rssXml(hypertaskOrigin, publishedBlogPosts());

const readStatic = (name: string) =>
  Effect.gen(function* readStaticCrawlerFile() {
    const fs = yield* FileSystem.FileSystem;

    return yield* fs.readFileString(`${application}/static/${name}`);
  });

const matchesOldSite = (name: string, content: Uint8Array) =>
  Effect.gen(function* matchesOldSiteBytes() {
    const oldSite = yield* readOldSite;
    const expected = oldSite.files[name];

    expect(content.length).toBe(expected?.bytes);
    expect(yield* sha256(content)).toBe(expected?.sha256);
  });

servicesForTests("hypertask crawler files", (test) => {
  test.effect("serves the feed bytes the old site serves", () =>
    matchesOldSite("rss.xml", utf8(feed()))
  );

  test.effect("serves the sitemap bytes the old site serves", () =>
    matchesOldSite("sitemap-0.xml", utf8(sitemap()))
  );

  test.effect("serves the crawler text files the old site serves", () =>
    Effect.gen(function* crawlerTextFiles() {
      for (const name of ["llms-full.txt", "llms.txt", "robots.txt"]) {
        yield* matchesOldSite(name, utf8(yield* readStatic(name)));
      }
    })
  );

  test.effect("keeps hidden pages out of the sitemap", () =>
    Effect.sync(() => {
      const sitemapBytes = sitemap();

      const locs = [...sitemapBytes.matchAll(/<loc>(?<loc>.*?)<\/loc>/gu)].map(
        (match) => match.groups?.loc ?? ""
      );

      for (const hidden of hiddenPagePaths) {
        expect(isHiddenSitemapPath(hidden)).toBe(true);
        expect(locs).not.toContain(`${hypertaskOrigin}${hidden}`);
      }

      expect(isHiddenSitemapPath("/blog/tags/ai-agents/")).toBe(true);
      expect(sitemapBytes).not.toContain("/blog/tags/");

      expect(locs.length).toBe(52);

      for (const loc of locs) {
        expect(loc.startsWith(`${hypertaskOrigin}/`)).toBe(true);
        expect(loc.endsWith("/")).toBe(true);
      }
    })
  );

  test.effect("lists every published post newest first", () =>
    Effect.sync(() => {
      const posts = publishedBlogPosts();
      const dates = posts.map((post) => post.date);
      const feedBytes = feed();
      const sitemapBytes = sitemap();

      expect(feedBytes.match(/<item>/gu)?.length).toBe(posts.length);
      expect(dates).toEqual(dates.toSorted().toReversed());

      for (const post of posts) {
        expect(sitemapBytes).toContain(
          `<loc>${hypertaskOrigin}/blog/${post.slug}/</loc>`
        );
      }

      expect(feedBytes).toContain(
        `<link>${hypertaskOrigin}/blog/${posts[0]?.slug}/</link>`
      );
    })
  );

  test.effect("points the sitemap index at the crawlable sitemap", () =>
    matchesOldSite("sitemap-index.xml", utf8(sitemapIndexXml(hypertaskOrigin)))
  );

  test.effect("gives every crawler file its content type", () =>
    Effect.sync(() => {
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
    })
  );
});
