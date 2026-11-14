import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem } from "effect";

import { publishedBlogPosts } from "../src/hypertask/blog-index.ts";
import {
  hypertaskOrigin,
  rssXml,
  sitemapIndexXml,
  sitemapXml,
} from "../src/hypertask/crawler-files.ts";
import { sitePaths, sitemapPaths } from "../src/hypertask/route-manifest.ts";

const staticCrawlerFiles = [
  { contentTypes: "text/plain; charset=utf-8", name: "llms-full.txt" },
  { contentTypes: "text/plain; charset=utf-8", name: "llms.txt" },
  { contentTypes: "text/plain; charset=utf-8", name: "robots.txt" },
] as const;

export const generatedCrawlerFiles = () => [
  {
    content: rssXml(hypertaskOrigin, publishedBlogPosts()),
    path: "/rss.xml",
  },
  {
    content: sitemapXml(hypertaskOrigin, sitemapPaths(sitePaths())),
    path: "/sitemap.xml",
  },
  { content: sitemapIndexXml(hypertaskOrigin), path: "/sitemap-index.xml" },
];

interface CrawlerFileHeader {
  readonly contentTypes: string;
  readonly path: string;
}

const crawlerFileHeaderLines: readonly CrawlerFileHeader[] = [
  ...generatedCrawlerFiles().map((file) => ({
    contentTypes: "application/xml",
    path: file.path,
  })),
  ...staticCrawlerFiles.map((file) => ({
    contentTypes: file.contentTypes,
    path: `/${file.name}`,
  })),
];

const crawlerFileHeaderLine = (header: CrawlerFileHeader) =>
  `${header.path}\n  Content-Type: ${header.contentTypes}\n`;

export const crawlerFileHeaders = crawlerFileHeaderLines
  .map((header) => crawlerFileHeaderLine(header))
  .join("");

export const copyCrawlerFiles = Effect.fn("reader.copyCrawlerFiles")(
  function* copyCrawlerFiles(staticDirectory: string, clientDirectory: string) {
    const fs = yield* FileSystem.FileSystem;
    const generated = generatedCrawlerFiles();

    yield* Effect.forEach((file: (typeof staticCrawlerFiles)[number]) =>
      fs.copyFile(
        `${staticDirectory}/${file.name}`,
        `${clientDirectory}/${file.name}`
      )
    )(staticCrawlerFiles);

    yield* Effect.forEach((file: (typeof generated)[number]) =>
      fs.writeFileString(`${clientDirectory}${file.path}`, file.content)
    )(generated);
  }
);

export const finalizeCrawlerFiles = Effect.fn("reader.finalizeCrawlerFiles")(
  function* finalizeCrawlerFiles(
    staticDirectory: string,
    clientDirectory: string
  ) {
    const fs = yield* FileSystem.FileSystem;
    const headersPath = `${clientDirectory}/_headers`;

    yield* copyCrawlerFiles(staticDirectory, clientDirectory);

    const headers = (yield* fs.exists(headersPath))
      ? yield* fs.readFileString(headersPath)
      : "";

    return yield* fs.writeFileString(
      headersPath,
      `${headers}${crawlerFileHeaders}`
    );
  },
  Effect.provide(NodeServices.layer)
);
