import { Effect } from "effect";

import { internalHrefs, metaContent, tagsOf, titleOf } from "./html.js";
import {
  blogSlugs,
  fathomScriptSource,
  fathomSiteId,
  oldRedirects,
} from "./manifest.js";

export interface SitePage {
  readonly body: string;
  readonly location?: string;
  readonly status: number;
}

export type SiteFetcher = (path: string) => Effect.Effect<SitePage>;

const nameFields = [
  "description",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
] as const;

const propertyFields = [
  "og:title",
  "og:description",
  "og:image",
  "og:url",
  "og:type",
] as const;

export const headViolations = (html: string): readonly string[] => {
  const violations: string[] = [];

  if (titleOf(html) === "") {
    violations.push("missing title");
  }

  if (!/<html\b[^>]*\blang\s*=\s*["'][a-z-]+["']/iu.test(html)) {
    violations.push("missing html lang");
  }

  for (const field of nameFields) {
    if (metaContent(html, "name", field) === "") {
      violations.push(`missing meta ${field}`);
    }
  }

  for (const field of propertyFields) {
    if (metaContent(html, "property", field) === "") {
      violations.push(`missing meta ${field}`);
    }
  }

  const canonical = tagsOf(html, "link").find(
    (tag) => tag.attributes.get("rel") === "canonical"
  );

  if (
    canonical?.attributes.get("href")?.startsWith("https://hypertask.ai/") !==
    true
  ) {
    violations.push("missing canonical link on https://hypertask.ai/");
  }

  return violations;
};

export const fathomViolations = (html: string): readonly string[] => {
  const tag = tagsOf(html, "script").find(
    (candidate) => candidate.attributes.get("src") === fathomScriptSource
  );

  if (tag === undefined) {
    return [`missing Fathom script ${fathomScriptSource}`];
  }

  return tag.attributes.get("data-site") === fathomSiteId
    ? []
    : [`Fathom data-site is not ${fathomSiteId}`];
};

const maxHops = 5;

const follow = (fetchPage: SiteFetcher, path: string) =>
  Effect.gen(function* followRedirects() {
    let current = path;

    for (let hop = 0; hop < maxHops; hop += 1) {
      const page = yield* fetchPage(current);

      if (
        page.status >= 300 &&
        page.status < 400 &&
        page.location !== undefined
      ) {
        current = page.location;
        continue;
      }

      return page;
    }

    return { body: "", status: 508 } satisfies SitePage;
  });

const pageViolations = (path: string, html: string): readonly string[] =>
  [...headViolations(html), ...fathomViolations(html)].map(
    (violation) => `${path}: ${violation}`
  );

export const redirectViolations = (fetchPage: SiteFetcher) =>
  Effect.gen(function* checkRedirects() {
    const violations: string[] = [];

    for (const redirect of oldRedirects) {
      const page = yield* fetchPage(redirect.from);

      if (page.status !== redirect.status) {
        violations.push(
          `${redirect.from} answers ${page.status}, expected ${redirect.status}`
        );
      } else if (redirect.status !== 200 && page.location !== redirect.to) {
        violations.push(
          `${redirect.from} goes to ${page.location ?? "nowhere"}, expected ${redirect.to}`
        );
      }
    }

    return violations;
  });

export const blogViolations = (fetchPage: SiteFetcher) =>
  Effect.gen(function* checkBlog() {
    const violations: string[] = [];

    for (const slug of blogSlugs) {
      const path = `/blog/${slug}/`;
      const page = yield* fetchPage(path);

      if (page.status === 200) {
        violations.push(...pageViolations(path, page.body));
      } else {
        violations.push(`${path} answers ${page.status}, expected 200`);
      }
    }

    return violations;
  });

export const linkViolations = (
  fetchPage: SiteFetcher,
  startPaths: readonly string[]
) =>
  Effect.gen(function* crawlLinks() {
    const violations: string[] = [];
    const seen = new Set<string>();
    const queue = [...startPaths];

    while (queue.length > 0) {
      const path = queue.shift();

      if (path === undefined || seen.has(path)) {
        continue;
      }

      seen.add(path);

      const page = yield* follow(fetchPage, path);

      if (page.status !== 200) {
        violations.push(`${path} answers ${page.status}`);
      } else if (page.body.includes("<html")) {
        violations.push(...pageViolations(path, page.body));
        queue.push(...internalHrefs(page.body));
      }
    }

    return violations;
  });

export const siteViolations = (fetchPage: SiteFetcher) =>
  Effect.gen(function* checkSite() {
    const redirects = yield* redirectViolations(fetchPage);
    const blog = yield* blogViolations(fetchPage);
    const links = yield* linkViolations(fetchPage, ["/", "/blog/"]);

    return [...redirects, ...blog, ...links];
  });
