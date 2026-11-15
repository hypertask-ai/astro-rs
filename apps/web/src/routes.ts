import { view as hallmarkView } from "./features/hallmark/index.js";
import { view as homeView } from "./features/home/index.js";
import type { PageView } from "./features/page/index.js";
import { view as testimonialIdaView } from "./features/testimonial-ida/index.js";
import { view as vsLinearView } from "./features/vs-linear/index.js";

export const pageViews: ReadonlyMap<string, PageView> = new Map([
  ["/", homeView],
  ["/hallmark/", hallmarkView],
  ["/testimonial-ida/", testimonialIdaView],
  ["/hypertask-vs-linear/", vsLinearView],
]);

export const viewForPath = (pathname: string): PageView | undefined =>
  pageViews.get(pathname.endsWith("/") ? pathname : `${pathname}/`);
