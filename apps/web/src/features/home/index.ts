import * as stylex from "@stylexjs/stylex";
import type { Document, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/home/message.js";
import type { AppModel } from "../../client/home/model.js";
import { pageTitle } from "./copy.js";
import { styles } from "./home.stylex.js";

const className = (style: stylex.StyleXStyles) =>
  stylex.props(style).className ?? "";

export const view = (
  _model: AppModel,
  h: HtmlBuilder<AppMessage>
): Document => ({
  body: h.main(
    [h.Class(className(styles.page))],
    [h.h1([h.Class(className(styles.heading))], [pageTitle])]
  ),
  title: pageTitle,
});
