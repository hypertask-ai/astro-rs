import * as stylex from "@stylexjs/stylex";
import type { Document, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { siteBuilder } from "../../site-base.js";
import { page } from "../page/index.js";
import { styles } from "./contact.stylex.js";
import * as copy from "./copy.js";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const contactPath = "/contact/";

export const view = (
  model: AppModel,
  builder: HtmlBuilder<AppMessage>
): Document => {
  const h = siteBuilder(builder);

  return page(
    model,
    h,
    contactPath,
    [
      h.section(
        [h.Class(classes(styles.section))],
        [
          h.div(
            [h.Class(classes(styles.container))],
            [
              h.div(
                [h.Class(classes(styles.header))],
                [h.h1([h.Class(classes(styles.heading))], [copy.heading])]
              ),
              h.div(
                [h.Class(classes(styles.card))],
                [
                  h.div(
                    [h.Class(classes(styles.email))],
                    [
                      h.a(
                        [
                          h.Href(`mailto:${copy.email}`),
                          h.Class(classes(styles.emailLink)),
                        ],
                        [copy.email]
                      ),
                    ]
                  ),
                  h.p(
                    [h.Class(classes(styles.paragraph))],
                    [
                      copy.paragraphBefore,
                      h.a(
                        [
                          h.Href(copy.homeHref),
                          h.Class(classes(styles.homeLink)),
                        ],
                        [copy.homeLabel]
                      ),
                      copy.paragraphAfter,
                    ]
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
};
