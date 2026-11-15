import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import {
  blogViolations,
  fathomViolations,
  headViolations,
  linkViolations,
  redirectViolations,
  siteViolations,
} from "./checks.js";
import type { SiteFetcher, SitePage } from "./checks.js";
import {
  blogSlugs,
  fathomScriptSource,
  fathomSiteId,
  oldRedirects,
  sitemapExclusions,
} from "./manifest.js";

const goodHead = `<html lang="en"><head>
<title>Hypertask</title>
<meta name="description" content="Task management for humans and agents">
<link rel="canonical" href="https://hypertask.ai/">
<meta property="og:title" content="Hypertask">
<meta property="og:description" content="Task management">
<meta property="og:image" content="https://hypertask.ai/og.png">
<meta property="og:url" content="https://hypertask.ai/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Hypertask">
<meta name="twitter:description" content="Task management">
<meta name="twitter:image" content="https://hypertask.ai/og.png">
<script src="${fathomScriptSource}" data-site="${fathomSiteId}" defer></script>
</head><body>`;

const pageWith = (links: readonly string[]): string =>
  `${goodHead}${links.map((href) => `<a href="${href}">x</a>`).join("")}</body></html>`;

const goodSite = (): Map<string, SitePage> =>
  new Map<string, SitePage>([
    [
      "/",
      {
        body: pageWith([
          "/blog/",
          "/pricing/",
          "https://app.hypertask.ai/signup",
        ]),
        status: 200,
      },
    ],
    [
      "/blog/",
      {
        body: pageWith(blogSlugs.map((slug) => `/blog/${slug}/`)),
        status: 200,
      },
    ],
    ["/pricing/", { body: pageWith(["/"]), status: 200 }],
    ...blogSlugs.map((slug): [string, SitePage] => [
      `/blog/${slug}/`,
      { body: pageWith(["/blog/"]), status: 200 },
    ]),
    ...oldRedirects.map((redirect): [string, SitePage] => [
      redirect.from,
      redirect.status === 200
        ? { body: "#!/bin/sh", status: 200 }
        : { body: "", location: redirect.to, status: redirect.status },
    ]),
  ]);

const fetcherFor =
  (site: ReadonlyMap<string, SitePage>): SiteFetcher =>
  (path) =>
    Effect.succeed(site.get(path) ?? { body: "Not found", status: 404 });

const mutate = (
  change: (site: Map<string, SitePage>) => void
): ReadonlyMap<string, SitePage> => {
  const site = goodSite();

  change(site);

  return site;
};

describe("site contract manifest", () => {
  it("lists all 38 blog posts once", () => {
    expect(blogSlugs).toHaveLength(38);
    expect(new Set(blogSlugs).size).toBe(38);

    for (const slug of blogSlugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
    }
  });

  it("lists all 18 old redirects with a known status", () => {
    expect(oldRedirects).toHaveLength(18);
    expect(new Set(oldRedirects.map((redirect) => redirect.from)).size).toBe(
      18
    );

    for (const redirect of oldRedirects) {
      expect([200, 301]).toContain(redirect.status);
      expect(redirect.to.startsWith("/")).toBe(true);
    }
  });

  it("keeps the old sitemap exclusions", () => {
    expect(sitemapExclusions).toContain("/blog/tags/");
    expect(sitemapExclusions).toContain("/thank-you");
  });
});

describe("page head check", () => {
  it("accepts a page with every head field", () => {
    expect(headViolations(pageWith([]))).toStrictEqual([]);
  });

  it("names each missing head field", () => {
    const stripped = pageWith([])
      .replace(/<title>[^<]*<\/title>/u, "")
      .replace(/<meta property="og:image"[^>]*>/u, "")
      .replace(/<link rel="canonical"[^>]*>/u, "");

    expect(headViolations(stripped)).toStrictEqual([
      "missing title",
      "missing meta og:image",
      "missing canonical link on https://hypertask.ai/",
    ]);
  });

  it("rejects a page with an empty description", () => {
    const empty = pageWith([]).replace(
      "Task management for humans and agents",
      ""
    );

    expect(headViolations(empty)).toStrictEqual(["missing meta description"]);
  });
});

describe("fathom check", () => {
  it("accepts the Fathom tag for the site id", () => {
    expect(fathomViolations(pageWith([]))).toStrictEqual([]);
  });

  it("fails when the tag is missing", () => {
    const without = pageWith([]).replace(/<script[^>]*><\/script>/u, "");

    expect(fathomViolations(without)).toStrictEqual([
      `missing Fathom script ${fathomScriptSource}`,
    ]);
  });

  it("fails when the tag counts another site", () => {
    const other = pageWith([]).replace(fathomSiteId, "OTHERSITE");

    expect(fathomViolations(other)).toStrictEqual([
      `Fathom data-site is not ${fathomSiteId}`,
    ]);
  });
});

describe("whole site check", () => {
  it.effect("passes a site that has every address, head and tag", () =>
    Effect.gen(function* passes() {
      const violations = yield* siteViolations(fetcherFor(goodSite()));

      expect(violations).toStrictEqual([]);
    })
  );

  it.effect("fails when a blog address is gone", () =>
    Effect.gen(function* missingBlog() {
      const site = mutate((draft) => {
        draft.delete(`/blog/${blogSlugs[3]}/`);
      });

      const violations = yield* blogViolations(fetcherFor(site));

      expect(violations).toStrictEqual([
        `/blog/${blogSlugs[3]}/ answers 404, expected 200`,
      ]);
    })
  );

  it.effect("fails when a blog post lost its Fathom tag", () =>
    Effect.gen(function* blogWithoutFathom() {
      const site = mutate((draft) => {
        draft.set(`/blog/${blogSlugs[0]}/`, {
          body: pageWith([]).replace(/<script[^>]*><\/script>/u, ""),
          status: 200,
        });
      });

      const violations = yield* blogViolations(fetcherFor(site));

      expect(violations).toStrictEqual([
        `/blog/${blogSlugs[0]}/: missing Fathom script ${fathomScriptSource}`,
      ]);
    })
  );

  it.effect("fails when an old redirect is gone", () =>
    Effect.gen(function* missingRedirect() {
      const site = mutate((draft) => {
        draft.delete("/v2");
      });

      const violations = yield* redirectViolations(fetcherFor(site));

      expect(violations).toStrictEqual(["/v2 answers 404, expected 301"]);
    })
  );

  it.effect("fails when an old redirect goes to the wrong place", () =>
    Effect.gen(function* wrongRedirect() {
      const site = mutate((draft) => {
        draft.set("/v4", { body: "", location: "/pricing/", status: 301 });
      });

      const violations = yield* redirectViolations(fetcherFor(site));

      expect(violations).toStrictEqual(["/v4 goes to /pricing/, expected /"]);
    })
  );

  it.effect("fails when the install address stops serving the script", () =>
    Effect.gen(function* installGone() {
      const site = mutate((draft) => {
        draft.set("/install", { body: "", location: "/", status: 301 });
      });

      const violations = yield* redirectViolations(fetcherFor(site));

      expect(violations).toStrictEqual(["/install answers 301, expected 200"]);
    })
  );

  it.effect("fails on a dead internal link", () =>
    Effect.gen(function* deadLink() {
      const site = mutate((draft) => {
        draft.set("/pricing/", {
          body: pageWith(["/", "/does-not-exist/"]),
          status: 200,
        });
      });

      const violations = yield* linkViolations(fetcherFor(site), ["/"]);

      expect(violations).toStrictEqual(["/does-not-exist/ answers 404"]);
    })
  );

  it.effect("follows a redirect to a live page", () =>
    Effect.gen(function* liveRedirect() {
      const site = mutate((draft) => {
        draft.set("/pricing/", {
          body: pageWith(["/home2.html"]),
          status: 200,
        });
      });

      const violations = yield* linkViolations(fetcherFor(site), ["/"]);

      expect(violations).toStrictEqual([]);
    })
  );

  it.effect("ignores links that leave the site", () =>
    Effect.gen(function* externalLinks() {
      const violations = yield* linkViolations(fetcherFor(goodSite()), ["/"]);

      expect(violations).toStrictEqual([]);
    })
  );

  it.effect("stops a redirect loop", () =>
    Effect.gen(function* loop() {
      const site = mutate((draft) => {
        draft.set("/a", { body: "", location: "/b", status: 301 });
        draft.set("/b", { body: "", location: "/a", status: 301 });
      });

      const violations = yield* linkViolations(fetcherFor(site), ["/a"]);

      expect(violations).toStrictEqual(["/a answers 508"]);
    })
  );
});
