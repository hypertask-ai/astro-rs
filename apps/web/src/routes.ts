import { postViews } from "./features/blog/index.js";
import { view as homeView } from "./features/home/index.js";
import type { PageView } from "./features/page/index.js";

export const pageViews: ReadonlyMap<string, PageView> = new Map<
  string,
  PageView
>([["/", homeView], ...postViews]);

export const viewForPath = (pathname: string): PageView | undefined =>
  pageViews.get(pathname.endsWith("/") ? pathname : `${pathname}/`);
