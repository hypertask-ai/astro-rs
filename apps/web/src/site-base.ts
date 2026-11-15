import type { HtmlBuilder } from "foldkit/html";

import { addSiteBasePath, normalizeSiteBasePath } from "./site-base-path.js";

export const siteBasePath = normalizeSiteBasePath(import.meta.env.BASE_URL);

const srcsetWithSiteBasePath = (basePath: string, value: string): string =>
  basePath === ""
    ? value
    : value
        .split(",")
        .map((candidate) => {
          const [url = "", ...descriptor] = candidate.trim().split(/\s+/u);

          return [addSiteBasePath(basePath, url), ...descriptor].join(" ");
        })
        .join(", ");

export const siteBuilder = <Message>(
  basePath: string,
  h: HtmlBuilder<Message>
): HtmlBuilder<Message> =>
  basePath === ""
    ? h
    : {
        ...h,
        Href: (value) => h.Href(addSiteBasePath(basePath, value)),
        Src: (value) => h.Src(addSiteBasePath(basePath, value)),
        Srcset: (value) => h.Srcset(srcsetWithSiteBasePath(basePath, value)),
      };
