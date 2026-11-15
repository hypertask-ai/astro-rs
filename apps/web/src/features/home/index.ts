import * as stylex from "@stylexjs/stylex";
import type { Document, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { siteBuilder } from "../../site-base.js";
import { consentBanner } from "../consent/index.js";
import { frame } from "../frame/index.js";
import { canonicalFor, pageHeads } from "../head/index.js";
import { pageTitle } from "./copy.js";
import { styles } from "./home.stylex.js";

const className = (style: stylex.StyleXStyles) =>
  stylex.props(style).className ?? "";

const homePath = "/";

export const view = (
  model: AppModel,
  builder: HtmlBuilder<AppMessage>
): Document => {
  const h = siteBuilder(builder);

  return {
    body: h.div(
      [],
      [
        frame(model, h, "home", [
          h.h1([h.Class(className(styles.heading))], [pageTitle]),
        ]),
        consentBanner(model, h),
      ]
    ),
    canonical: canonicalFor(homePath),
    ogUrl: canonicalFor(homePath),
    title: pageHeads.get(homePath)?.title ?? pageTitle,
  };
};
