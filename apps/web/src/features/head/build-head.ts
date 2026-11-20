import { addSiteBasePath } from "../../site-base-path.js";
import { organizationGraph } from "./organization.js";

export const siteOrigin = "https://hypertask.ai";

export const defaultImage = {
  alt: "Hypertask — AI-powered project management for humans and AI agents",
  url: `${siteOrigin}/hypertasklogo.avif`,
} as const;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export type JsonLd = Readonly<Record<string, JsonValue>>;

export type PageHead = Readonly<{
  article?: Readonly<{
    author: string;
    modified: string;
    published: string;
    section: string;
  }>;
  description: string;
  extraStructuredData?: readonly JsonLd[];
  image?: Readonly<{ alt: string; url: string }>;
  noindex?: boolean;
  ogType?: string;
  title: string;
}>;

const escapeAttribute = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const escapeJson = (value: JsonLd): string =>
  JSON.stringify(value).replaceAll("<", String.raw`<`);

const metaName = (name: string, content: string): string =>
  `<meta name="${name}" content="${escapeAttribute(content)}">`;

const metaProperty = (property: string, content: string): string =>
  `<meta property="${property}" content="${escapeAttribute(content)}">`;

const jsonLd = (value: JsonLd): string =>
  `<script type="application/ld+json">${escapeJson(value)}</script>`;

export const canonicalFor = (path: string): string => `${siteOrigin}${path}`;

const homeRedirect = `<script>if(/(?:^|;\\s*)ht_in=1(?:;|$)/.test(document.cookie)&&!location.search.includes("stay")){location.replace("https://app.hypertask.ai/login")}</script>`;

const articleTags = (page: PageHead): readonly string[] =>
  page.article === undefined
    ? []
    : [
        metaProperty("article:published_time", page.article.published),
        metaProperty("article:modified_time", page.article.modified),
        metaProperty("article:author", page.article.author),
        metaProperty("article:section", page.article.section),
      ];

export const buildHead = (
  path: string,
  page: PageHead,
  basePath = ""
): string => {
  const image = page.image ?? defaultImage;
  const noindex = page.noindex === true || basePath !== "";

  return [
    ...(path === "/" ? [homeRedirect] : []),
    metaName("description", page.description),
    metaName("robots", noindex ? "noindex, follow" : "index, follow"),
    metaProperty("og:title", page.title),
    metaProperty("og:description", page.description),
    metaProperty("og:image", image.url),
    metaProperty("og:image:alt", image.alt),
    metaProperty("og:type", page.ogType ?? "website"),
    metaProperty("og:site_name", "Hypertask"),
    ...articleTags(page),
    metaName("twitter:card", "summary_large_image"),
    metaName("twitter:title", page.title),
    metaName("twitter:description", page.description),
    metaName("twitter:image", image.url),
    metaName("twitter:image:alt", image.alt),
    jsonLd(organizationGraph),
    ...(page.extraStructuredData ?? []).map(jsonLd),
    `<link rel="icon" type="image/png" href="${addSiteBasePath(basePath, "/Favicon%20-%20Light.png")}" media="(prefers-color-scheme: dark)">`,
    `<link rel="icon" type="image/png" href="${addSiteBasePath(basePath, "/Favicon%20-%20Dark.png")}" media="(prefers-color-scheme: light)">`,
    `<link rel="alternate" type="application/rss+xml" title="The Hypertask Blog" href="${addSiteBasePath(basePath, "/rss.xml")}">`,
  ].join("\n");
};
