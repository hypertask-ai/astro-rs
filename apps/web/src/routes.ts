import { view as aboutView } from "./features/about/index.js";
import { view as contactView } from "./features/contact/index.js";
import { view as homeView } from "./features/home/index.js";
import type { PageView } from "./features/page/index.js";
import { view as pricingView } from "./features/pricing/index.js";
import { view as thankYouView } from "./features/thank-you/index.js";

export { homeView };

export const pageViews: ReadonlyMap<string, PageView> = new Map([
  ["/", homeView],
  ["/about/", aboutView],
  ["/contact/", contactView],
  ["/pricing/", pricingView],
  ["/thank-you/", thankYouView],
]);

export const viewForPath = (pathname: string): PageView | undefined =>
  pageViews.get(pathname.endsWith("/") ? pathname : `${pathname}/`);
