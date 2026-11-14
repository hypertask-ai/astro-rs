import * as stylex from "@stylexjs/stylex";
import type { Document, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { consentBanner, cookieSettings } from "../consent/index.js";
import { pageTitle } from "./copy.js";
import { styles } from "./home.stylex.js";

const className = (style: stylex.StyleXStyles) =>
  stylex.props(style).className ?? "";

export const view = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Document => ({
  body: h.div(
    [],
    [
      h.main(
        [h.Class(className(styles.page))],
        [h.h1([h.Class(className(styles.heading))], [pageTitle])]
      ),
      cookieSettings(h),
      consentBanner(model, h),
    ]
  ),
  title: pageTitle,
});
