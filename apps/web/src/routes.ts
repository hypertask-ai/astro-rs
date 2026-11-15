import { view as homeView } from "./features/home/index.js";
import type { PageView } from "./features/page/index.js";
import { view as privacyView } from "./features/privacy/index.js";
import { view as termsView } from "./features/terms/index.js";

export const pageViews: ReadonlyMap<string, PageView> = new Map([
  ["/", homeView],
  ["/privacy/", privacyView],
  ["/terms/", termsView],
]);

export const viewForPath = (pathname: string): PageView | undefined =>
  pageViews.get(pathname.endsWith("/") ? pathname : `${pathname}/`);
