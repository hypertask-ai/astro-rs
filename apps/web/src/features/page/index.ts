import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { consentBanner } from "../consent/index.js";
import { frame } from "../frame/index.js";
import { canonicalFor, pageHeads } from "../head/index.js";

export type PageView = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
) => Document;

export const page = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>,
  path: string,
  content: readonly Html[],
  fallbackTitle: string
): Document => ({
  body: h.div([], [frame(model, h, "page", content), consentBanner(model, h)]),
  canonical: canonicalFor(path),
  ogUrl: canonicalFor(path),
  title: pageHeads.get(path)?.title ?? fallbackTitle,
});
