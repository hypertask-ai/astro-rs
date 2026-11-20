import type { Document, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { siteBuilder } from "../../site-base.js";
import { legalPage } from "../legal/index.js";
import * as copy from "./copy.js";

const privacyPath = "/privacy/";

export const view = (
  model: AppModel,
  builder: HtmlBuilder<AppMessage>
): Document => {
  const h = siteBuilder(builder);

  return legalPage(model, h, {
    blocks: copy.blocks,
    fallbackTitle: copy.pageTitle,
    heading: copy.heading,
    path: privacyPath,
  });
};
