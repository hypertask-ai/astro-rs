import { describe, expect, it } from "@effect/vitest";

import { buildHead } from "../src/features/head/build-head.js";
import { pageHeads } from "../src/features/head/pages.js";
import { headersFile, redirectsFile } from "../src/hypertask/site-rules.js";
import {
  addSiteBasePath,
  escapingUrls,
  escapesSiteBasePath,
  normalizeSiteBasePath,
  removeSiteBasePath,
} from "../src/site-base-path.js";

const basePath = "/ratstack";

const home = pageHeads.get("/");

if (home === undefined) {
  throw new Error(
    "The home page head is missing. The preview head checks read it from pageHeads. Fix: keep the / entry in `apps/web/src/features/head/pages.ts`."
  );
}

describe("site base path", () => {
  it("normalizes one root-relative path and leaves the root empty", () => {
    expect(normalizeSiteBasePath("/ratstack/")).toBe("/ratstack");
    expect(normalizeSiteBasePath(" /ratstack ")).toBe("/ratstack");
    expect(normalizeSiteBasePath("")).toBe("");
    expect(normalizeSiteBasePath("/")).toBe("");
    expect(() => normalizeSiteBasePath("ratstack")).toThrow();
    expect(() =>
      normalizeSiteBasePath("https://hypertask.ai/ratstack")
    ).toThrow();
    expect(() => normalizeSiteBasePath("//hypertask.ai/ratstack")).toThrow();
  });

  it("prefixes a same-site path once and leaves other addresses alone", () => {
    expect(addSiteBasePath(basePath, "/")).toBe("/ratstack/");
    expect(addSiteBasePath(basePath, "/blog/post/")).toBe(
      "/ratstack/blog/post/"
    );
    expect(addSiteBasePath(basePath, "/?stay=1")).toBe("/ratstack/?stay=1");
    expect(addSiteBasePath(basePath, "/ratstack/blog/post/")).toBe(
      "/ratstack/blog/post/"
    );
    expect(addSiteBasePath(basePath, "https://app.hypertask.ai/login")).toBe(
      "https://app.hypertask.ai/login"
    );
    expect(addSiteBasePath(basePath, "//cdn.example.com/a.png")).toBe(
      "//cdn.example.com/a.png"
    );
    expect(addSiteBasePath("", "/blog/post/")).toBe("/blog/post/");
  });

  it("strips the served prefix back to the route the site renders", () => {
    expect(removeSiteBasePath(basePath, "/ratstack/")).toBe("/");
    expect(removeSiteBasePath(basePath, "/ratstack")).toBe("/");
    expect(removeSiteBasePath(basePath, "/ratstack/blog/")).toBe("/blog/");
    expect(removeSiteBasePath(basePath, "/")).toBe("/");
    expect(removeSiteBasePath("", "/blog/")).toBe("/blog/");
  });

  it("names a same-site address as escaping only when it leaves the prefix", () => {
    expect(escapesSiteBasePath(basePath, "/images/hero.png")).toBe(true);
    expect(escapesSiteBasePath(basePath, "/ratstack/images/hero.png")).toBe(
      false
    );
    expect(escapesSiteBasePath(basePath, "/")).toBe(true);
    expect(
      escapesSiteBasePath(
        basePath,
        "https://duv2gcpdgd578.cloudfront.net/a.mp4"
      )
    ).toBe(false);
    expect(escapesSiteBasePath(basePath, "#main")).toBe(false);
    expect(escapesSiteBasePath("", "/images/hero.png")).toBe(false);
  });

  it("finds the escaping link in an emitted page", () => {
    const page = `<link rel="stylesheet" href="/ratstack/assets/site.css"><img src="/images/hero.png" srcset="/ratstack/images/a.avif 1x, /images/b.avif 2x">`;

    expect(escapingUrls(basePath, "index.html", page)).toEqual([
      "/images/hero.png",
      "/images/b.avif",
    ]);
  });

  it("finds the escaping font in an emitted stylesheet", () => {
    const sheet = `@font-face{src:url(/fonts/ibm-plex-sans-0564cf0e.woff2) format("woff2")}body{background:url('/ratstack/images/gradient.avif')}`;

    expect(escapingUrls(basePath, "assets/site.css", sheet)).toEqual([
      "/fonts/ibm-plex-sans-0564cf0e.woff2",
    ]);
  });

  it("finds the escaping redirect in the emitted redirect file", () => {
    const redirects = "# a comment\n/ratstack/v2 /ratstack/ 301\n/v2 / 301\n";

    expect(escapingUrls(basePath, "_redirects", redirects)).toEqual([
      "/v2",
      "/",
    ]);
  });

  it("marks a preview page noindex and keeps the live page indexable", () => {
    const preview = buildHead("/", home, basePath);
    const live = buildHead("/", home);

    expect(preview).toContain('<meta name="robots" content="noindex, follow">');
    expect(preview).toContain('href="/ratstack/rss.xml"');
    expect(live).toContain('<meta name="robots" content="index, follow">');
    expect(live).toContain('href="/rss.xml"');
  });

  it("adds the noindex response header once and only for the preview", () => {
    const preview = headersFile("", true);

    expect(preview).toContain("X-Robots-Tag: noindex");
    expect(headersFile(preview, true)).toBe(preview);
    expect(headersFile("", false)).not.toContain("X-Robots-Tag");
  });

  it("serves every redirect inside the prefix", () => {
    const preview = redirectsFile(["/"], basePath);

    expect(preview).toContain("/ratstack/home2.html /ratstack/ 301");
    expect(preview).not.toContain("\n/v2 ");
    expect(redirectsFile(["/"])).toContain("/home2.html / 301");
  });
});
