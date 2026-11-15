import { DateTime } from "effect";

import type { HypertaskBlogPost } from "./blog-index.js";

export const hypertaskOrigin = "https://hypertask.ai";

const feedDescription =
  "Field notes on running humans and AI agents on one board — async work, agent orchestration, and getting out of project-management chaos.";

const xmlEscapes = new Map([
  ['"', "&quot;"],
  ["&", "&amp;"],
  ["'", "&apos;"],
  ["<", "&lt;"],
  [">", "&gt;"],
]);

const xmlText = (value: string) =>
  value.replaceAll(
    /["&'<>]/gu,
    (character) => xmlEscapes.get(character) ?? character
  );

const pubDate = (date: string) =>
  DateTime.toDateUtc(DateTime.makeUnsafe(`${date}T00:00:00Z`)).toUTCString();

const feedItem = (origin: string, post: HypertaskBlogPost) => {
  const link = `${origin}/blog/${post.slug}/`;

  return [
    "<item>",
    `<title>${xmlText(post.title)}</title>`,
    `<link>${link}</link>`,
    `<guid isPermaLink="true">${link}</guid>`,
    `<description>${xmlText(post.description)}</description>`,
    `<pubDate>${pubDate(post.date)}</pubDate>`,
    ...post.tags.map((tag) => `<category>${xmlText(tag)}</category>`),
    "</item>",
  ].join("");
};

export const rssXml = (origin: string, posts: readonly HypertaskBlogPost[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The Hypertask Blog</title><description>${xmlText(feedDescription)}</description><link>${origin}/</link><language>en-us</language>${posts
    .map((post) => feedItem(origin, post))
    .join("")}</channel></rss>`;

const sitemapNamespaces = [
  'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  'xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"',
  'xmlns:xhtml="http://www.w3.org/1999/xhtml"',
  'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
  'xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"',
].join(" ");

export const sitemapXml = (origin: string, paths: readonly string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset ${sitemapNamespaces}>${paths
    .map((path) => `<url><loc>${origin}${path}</loc></url>`)
    .join("")}</urlset>`;

export const sitemapIndexXml = (origin: string) =>
  `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${origin}/sitemap-0.xml</loc></sitemap></sitemapindex>`;
