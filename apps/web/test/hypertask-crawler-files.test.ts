import { NodeCrypto, NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path, Schema } from "effect";
import * as Digest from "effect/crypto/Digest";

import { crawlerFileHeaders } from "../scripts/crawler-files.js";
import { publishedBlogPosts } from "../src/hypertask/blog-index.js";
import {
  hypertaskOrigin,
  sitemapIndexXml,
} from "../src/hypertask/crawler-files.js";
import {
  hiddenPagePaths,
  isHiddenSitemapPath,
} from "../src/hypertask/route-manifest.js";

const OldSite = Schema.Struct({
  files: Schema.Record(
    Schema.String,
    Schema.Struct({ bytes: Schema.Number, sha256: Schema.String })
  ),
});

const delivered = [
  { built: "rss.xml", old: "rss.xml" },
  { built: "sitemap.xml", old: "sitemap-0.xml" },
  { built: "llms-full.txt", old: "llms-full.txt" },
  { built: "llms.txt", old: "llms.txt" },
  { built: "robots.txt", old: "robots.txt" },
] as const;

it.layer(Layer.mergeAll(NodeServices.layer, NodeCrypto.layerDigest))(
  "hypertask crawler files",
  (test) => {
    test.effect("every crawler file keeps the bytes the old site serves", () =>
      Effect.gen(function* checkOldSiteBytes() {
        const fs = yield* FileSystem.FileSystem;
        const paths = yield* Path.Path;
        const digest = yield* Digest.Digest;
        const directory = paths.join(import.meta.dirname, "..");

        const fixtures = paths.join(
          directory,
          "test/fixtures/hypertask-crawler"
        );

        const client = paths.join(directory, "dist/client");

        const pinned = yield* fs
          .readFileString(paths.join(fixtures, "old-site.json"))
          .pipe(
            Effect.flatMap(Schema.decodeEffect(Schema.fromJsonString(OldSite)))
          );

        for (const file of delivered) {
          const bytes = yield* fs.readFile(paths.join(client, file.built));

          const expected = pinned.files[file.old];

          expect(expected).toBeDefined();
          expect(bytes.length).toBe(expected?.bytes);
          expect(yield* digest.digestHex(Digest.sha256, bytes)).toBe(
            expected?.sha256
          );
        }
      })
    );

    test.effect("the sitemap index points at the crawlable sitemap", () =>
      Effect.gen(function* checkSitemapIndex() {
        const fs = yield* FileSystem.FileSystem;
        const paths = yield* Path.Path;
        const directory = paths.join(import.meta.dirname, "..");

        expect(
          yield* fs.readFileString(
            paths.join(directory, "dist/client/sitemap-index.xml")
          )
        ).toBe(sitemapIndexXml(hypertaskOrigin));
      })
    );

    test.effect("hidden pages stay out of the sitemap", () =>
      Effect.gen(function* checkHiddenPages() {
        const fs = yield* FileSystem.FileSystem;
        const paths = yield* Path.Path;
        const directory = paths.join(import.meta.dirname, "..");

        const sitemap = yield* fs.readFileString(
          paths.join(directory, "dist/client/sitemap.xml")
        );

        for (const hidden of hiddenPagePaths) {
          expect(isHiddenSitemapPath(hidden)).toBe(true);
          expect(sitemap).not.toContain(
            `<loc>${hypertaskOrigin}${hidden}</loc>`
          );
        }

        expect(isHiddenSitemapPath("/blog/tags/ai-agents/")).toBe(true);
        expect(sitemap).not.toContain("/blog/tags/");

        for (const post of publishedBlogPosts()) {
          expect(sitemap).toContain(
            `<loc>${hypertaskOrigin}/blog/${post.slug}/</loc>`
          );
        }

        const locs = [...sitemap.matchAll(/<loc>(?<loc>.*?)<\/loc>/gu)].map(
          (match) => match.groups?.loc ?? ""
        );

        expect(locs.length).toBe(52);

        for (const loc of locs) {
          expect(loc.startsWith(`${hypertaskOrigin}/`)).toBe(true);
          expect(loc.endsWith("/")).toBe(true);
        }
      })
    );

    test.effect("the feed lists every published post newest first", () =>
      Effect.gen(function* checkFeedOrder() {
        const fs = yield* FileSystem.FileSystem;
        const paths = yield* Path.Path;
        const directory = paths.join(import.meta.dirname, "..");

        const feed = yield* fs.readFileString(
          paths.join(directory, "dist/client/rss.xml")
        );

        const posts = publishedBlogPosts();
        const dates = posts.map((post) => post.date);

        expect(feed.match(/<item>/gu)?.length).toBe(posts.length);
        expect(dates).toEqual(dates.toSorted().toReversed());
        expect(feed).toContain(
          `<link>${hypertaskOrigin}/blog/${posts[0]?.slug}/</link>`
        );
      })
    );

    test.effect("the headers describe every crawler file", () =>
      Effect.gen(function* checkHeaders() {
        const fs = yield* FileSystem.FileSystem;
        const paths = yield* Path.Path;
        const directory = paths.join(import.meta.dirname, "..");

        const headers = yield* fs.readFileString(
          paths.join(directory, "dist/client/_headers")
        );

        expect(headers).toContain(crawlerFileHeaders);
      })
    );
  }
);
