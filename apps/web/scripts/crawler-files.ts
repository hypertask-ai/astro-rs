import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem } from "effect";

import { publishedBlogPosts } from "../src/hypertask/blog-index.js";
import {
  hypertaskOrigin,
  rssXml,
  sitemapIndexXml,
  sitemapXml,
} from "../src/hypertask/crawler-files.js";
import { sitePaths, sitemapPaths } from "../src/hypertask/route-manifest.js";

export const generatedCrawlerFiles = () => [
  {
    content: rssXml(hypertaskOrigin, publishedBlogPosts()),
    path: "/rss.xml",
  },
  {
    content: sitemapXml(hypertaskOrigin, sitemapPaths(sitePaths())),
    path: "/sitemap-0.xml",
  },
  { content: sitemapIndexXml(hypertaskOrigin), path: "/sitemap-index.xml" },
];

export const finalizeCrawlerFiles = Effect.fn("site.finalizeCrawlerFiles")(
  function* finalizeCrawlerFiles(clientDirectory: string) {
    const fs = yield* FileSystem.FileSystem;

    yield* Effect.forEach(generatedCrawlerFiles(), (file) =>
      fs.writeFileString(`${clientDirectory}${file.path}`, file.content)
    );
  },
  Effect.provide(NodeServices.layer)
);
