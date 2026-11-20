import { view as aboutView } from "./features/about/index.js";
import { view as contactView } from "./features/contact/index.js";
import { view as hallmarkView } from "./features/hallmark/index.js";
import { view as homeView } from "./features/home/index.js";
import type { PageView } from "./features/page/index.js";
import { view as pricingView } from "./features/pricing/index.js";
import { view as privacyView } from "./features/privacy/index.js";
import { view as termsView } from "./features/terms/index.js";
import { view as testimonialIdaView } from "./features/testimonial-ida/index.js";
import { view as thankYouView } from "./features/thank-you/index.js";
import { view as vsLinearView } from "./features/vs-linear/index.js";

export const pageViews: ReadonlyMap<string, PageView> = new Map([
  ["/", homeView],
  ["/about/", aboutView],
  ["/contact/", contactView],
  ["/pricing/", pricingView],
  ["/privacy/", privacyView],
  ["/terms/", termsView],
  ["/thank-you/", thankYouView],
  ["/hallmark/", hallmarkView],
  ["/testimonial-ida/", testimonialIdaView],
  ["/hypertask-vs-linear/", vsLinearView],
]);

export const viewForPath = (pathname: string): PageView | undefined =>
  pageViews.get(pathname.endsWith("/") ? pathname : `${pathname}/`);
