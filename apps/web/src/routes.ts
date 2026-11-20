import { view as aboutView } from "./features/about/index.js";
import { postViews } from "./features/blog/index.js";
import { view as contactView } from "./features/contact/index.js";
import { view as homeView } from "./features/home/index.js";
import type { PageView } from "./features/page/index.js";
import { view as pricingView } from "./features/pricing/index.js";
import { view as privacyView } from "./features/privacy/index.js";
import { view as termsView } from "./features/terms/index.js";
import { view as thankYouView } from "./features/thank-you/index.js";

export const pageViews: ReadonlyMap<string, PageView> = new Map([
  ["/", homeView],
  ["/about/", aboutView],
  ["/contact/", contactView],
  ["/pricing/", pricingView],
  ["/privacy/", privacyView],
  ["/terms/", termsView],
  ["/thank-you/", thankYouView],
  ...postViews,
]);

export const viewForPath = (pathname: string): PageView | undefined =>
  pageViews.get(pathname.endsWith("/") ? pathname : `${pathname}/`);
