import { publishedBlogPosts } from "./blog-index.js";

export const publicPagePaths: readonly string[] = [
  "/",
  "/about/",
  "/blog/",
  "/contact/",
  "/hallmark/",
  "/hypertask-vs-linear/",
  "/pricing/",
  "/privacy/",
  "/terms/",
  "/testimonial-ida/",
  "/use-cases/agency/",
  "/use-cases/cro/",
  "/use-cases/marketing/",
  "/use-cases/product/",
];

export const hiddenPagePaths: readonly string[] = [
  "/thank-you/",
  "/v2/",
  "/v3-cursor/",
  "/v3-linear/",
  "/v3-resend/",
  "/v3-shell/",
  "/v3-superhuman/",
  "/v3-vercel/",
  "/v4/",
  "/versions/",
];

export const hiddenPagePrefixes: readonly string[] = ["/blog/tags/"];

export const trailingSlashPath = (path: string): string =>
  path === "/" || path.endsWith("/") ? path : `${path}/`;

export const blogPostPath = (slug: string): string => `/blog/${slug}/`;

export const isHiddenSitemapPath = (path: string): boolean =>
  hiddenPagePaths.includes(trailingSlashPath(path)) ||
  hiddenPagePrefixes.some((prefix) => path.startsWith(prefix));

export const sitePaths = (): readonly string[] => [
  ...publicPagePaths,
  ...publishedBlogPosts().map((post) => blogPostPath(post.slug)),
];

export const sitemapPaths = (paths: readonly string[]): readonly string[] =>
  [...new Set(paths.map(trailingSlashPath))]
    .filter((path) => !isHiddenSitemapPath(path))
    .toSorted();
