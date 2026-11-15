import * as stylex from "@stylexjs/stylex";
import type { Document, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { loginUrl } from "../frame/copy.js";
import { page } from "../page/index.js";
import { styles } from "./about.stylex.js";
import * as copy from "./copy.js";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const aboutPath = "/about/";

export const view = (model: AppModel, h: HtmlBuilder<AppMessage>): Document =>
  page(
    model,
    h,
    aboutPath,
    [
      h.div(
        [h.Class(classes(styles.container))],
        [
          h.div(
            [h.Class(classes(styles.stack))],
            [
              h.h1([h.Class(classes(styles.heading))], [copy.heading]),
              h.p([h.Class(classes(styles.subheadline))], [copy.subheadline]),
              h.div(
                [h.Class(classes(styles.prose))],
                copy.paragraphs.map((parts) =>
                  h.p(
                    [h.Class(classes(styles.paragraph))],
                    parts.map((part) =>
                      part.em === true ? h.em([], [part.text]) : part.text
                    )
                  )
                )
              ),
              h.a(
                [
                  h.Href(loginUrl),
                  h.Target("_blank"),
                  h.Rel("noopener noreferrer"),
                  h.Class(classes(styles.cta)),
                ],
                [copy.ctaLabel]
              ),
            ]
          ),
        ]
      ),
    ],
    copy.pageTitle
  );
