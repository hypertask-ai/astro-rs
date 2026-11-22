import type { HtmlBuilder } from "foldkit/html";

import { siteOrigin } from "./features/head/build-head.js";
import { addSiteBasePath, normalizeSiteBasePath } from "./site-base-path.js";

export const siteBasePath = normalizeSiteBasePath(import.meta.env.BASE_URL);

export const isSitePreview = siteBasePath !== "";

export const sitePath = (path: string): string => {
  if (!isSitePreview) {
    return path;
  }

  const url = URL.parse(path, path.startsWith("//") ? siteOrigin : undefined);

  return addSiteBasePath(
    siteBasePath,
    url?.origin === siteOrigin
      ? `${url.pathname}${url.search}${url.hash}`
      : path
  );
};

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

export const sitePreviewResponse = (response: Response): Response => {
  const headers = sitePreviewHeaders();

  if (headers === undefined) {
    return response;
  }

  const merged = new Headers(response.headers);

  for (const [name, value] of Object.entries(headers)) {
    merged.set(name, value);
  }

  return new Response(response.body, {
    headers: merged,
    status: response.status,
    statusText: response.statusText,
  });
};
