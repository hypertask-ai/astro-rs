import { visibleText } from "./home-page.js";
import { tagsOf } from "./site-contract/html.js";

export interface BuiltPage {
  readonly html: string;
  readonly path: string;
}

export interface FathomSite {
  readonly headOwner: string;
  readonly siteId: string;
  readonly source: string;
}

const googleAnalytics = [
  { label: "Google Analytics", pattern: /google analytics/iu },
  { label: "GA4", pattern: /\bga4\b/iu },
  { label: "gtag(", pattern: /gtag\(/iu },
  { label: "googletagmanager", pattern: /googletagmanager/iu },
] as const;

const fathomTags = (html: string, site: FathomSite) =>
  tagsOf(html, "script").filter(
    (tag) => tag.attributes.get("src") === site.source
  );

export const headOwnsFathom = (headSource: string): boolean =>
  /fathom/iu.test(headSource);

const fathomOnPage = (page: BuiltPage, site: FathomSite): readonly string[] => {
  const tags = fathomTags(page.html, site);
  const fix = `Fix: keep one tag in ${site.headOwner}, the one place the head is built.`;

  if (tags.length === 0) {
    return [
      `${page.path}: no Fathom script for ${site.siteId}. Every customer facing page loads Fathom. ${fix}`,
    ];
  }

  if (tags.length > 1) {
    return [
      `${page.path}: found ${tags.length} Fathom scripts. Every customer facing page loads Fathom once. ${fix}`,
    ];
  }

  const siteId = tags[0]?.attributes.get("data-site") ?? "";

  return siteId === site.siteId
    ? []
    : [
        `${page.path}: Fathom data-site is "${siteId}" and must be ${site.siteId}. ${fix}`,
      ];
};

const fathomOutsideHead = (
  page: BuiltPage,
  site: FathomSite
): readonly string[] =>
  fathomTags(page.html, site).length === 0
    ? []
    : [
        `${page.path}: Fathom is on the page but ${site.headOwner} does not write it. Every page gets Fathom from the one place the head is built. Fix: move the tag into ${site.headOwner}.`,
      ];

const googleAnalyticsOnPage = (
  page: BuiltPage,
  site: FathomSite
): readonly string[] => {
  const text = visibleText(page.html).join("\n");

  return googleAnalytics.flatMap(({ label, pattern }) =>
    pattern.test(page.html) || pattern.test(text)
      ? [
          `${page.path}: the page names ${label}. This site counts with PostHog and Fathom and never with Google Analytics. Fix: remove it from the page and from ${site.headOwner}, the one place the head is built.`,
        ]
      : []
  );
};

export const analyticsViolations = (
  pages: readonly BuiltPage[],
  headSource: string,
  site: FathomSite
): readonly string[] => {
  const fathom = headOwnsFathom(headSource)
    ? pages.flatMap((page) => fathomOnPage(page, site))
    : pages.flatMap((page) => fathomOutsideHead(page, site));

  return [
    ...fathom,
    ...pages.flatMap((page) => googleAnalyticsOnPage(page, site)),
  ];
};
