import * as stylex from "@stylexjs/stylex";
import type { Document, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { loginUrl } from "../frame/copy.js";
import { page } from "../page/index.js";
import * as copy from "./copy.js";
import { styles } from "./thank-you.stylex.js";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const thankYouPath = "/thank-you/";

export const view = (model: AppModel, h: HtmlBuilder<AppMessage>): Document =>
  page(
    model,
    h,
    thankYouPath,
    [
      h.section(
        [h.Class(classes(styles.section))],
        [
          h.div(
            [h.Class(classes(styles.card))],
            [
              h.div([h.AriaHidden(true), h.Class(classes(styles.fade))], []),
              h.div([h.Class(classes(styles.icon))], [copy.icon]),
              h.h1([h.Class(classes(styles.heading))], [copy.heading]),
              h.p([h.Class(classes(styles.subtitle))], [copy.subtitle]),
              h.p(
                [h.Class(classes(styles.message))],
                [copy.messageBefore, h.br([]), copy.messageAfter]
              ),
              h.div(
                [h.Class(classes(styles.ctaContainer))],
                [
                  h.a(
                    [
                      h.Href(loginUrl),
                      h.Target("_blank"),
                      h.Rel("noopener noreferrer"),
                      h.Id("get-started-button"),
                      h.Class(classes(styles.cta, styles.ctaPrimary)),
                    ],
                    [copy.primaryLabel]
                  ),
                  h.a(
                    [
                      h.Href(copy.backHref),
                      h.Class(classes(styles.cta, styles.ctaOutline)),
                    ],
                    [copy.backLabel]
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
    ],
    copy.pageTitle
  );
