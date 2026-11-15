import type { HtmlBuilder } from "foldkit/html";

import { addSiteBasePath, normalizeSiteBasePath } from "./site-base-path.js";

export const siteBasePath = normalizeSiteBasePath(import.meta.env.BASE_URL);

export const isSitePreview = siteBasePath !== "";

export const sitePath = (path: string): string =>
  addSiteBasePath(siteBasePath, path);

const srcsetAtSiteBasePath = (value: string): string =>
  value
    .split(",")
    .map((candidate) => {
      const [url = "", ...descriptor] = candidate.trim().split(/\s+/u);

      return [sitePath(url), ...descriptor].join(" ");
    })
    .join(", ");

export const siteBuilder = <Message>(
  h: HtmlBuilder<Message>
): HtmlBuilder<Message> =>
  isSitePreview
    ? {
        ...h,
        Href: (value) => h.Href(sitePath(value)),
        Src: (value) => h.Src(sitePath(value)),
        Srcset: (value) => h.Srcset(srcsetAtSiteBasePath(value)),
      }
    : h;

export const sitePreviewHeaders = ():
  | Readonly<Record<string, string>>
  | undefined => (isSitePreview ? { "x-robots-tag": "noindex" } : undefined);
