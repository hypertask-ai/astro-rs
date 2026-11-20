import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../../client/app/message.js";
import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { styles } from "./consent.stylex.js";
import {
  acceptButtonId,
  acceptLabel,
  bannerLabel,
  bannerMessage,
  privacyHref,
  privacyLabel,
  rejectButtonId,
  rejectLabel,
} from "./copy.js";

const className = (style: stylex.StyleXStyles) =>
  stylex.props(style).className ?? "";

export const consentBanner = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.section(
    [
      h.Id("cookie-consent"),
      h.Role("region"),
      h.Class(className(styles.banner)),
      h.AriaLabel(bannerLabel),
      h.Hidden(!model.bannerVisible),
    ],
    [
      h.div(
        [h.Class(className(styles.copy))],
        [
          h.strong([h.Class(className(styles.copyTitle))], [bannerLabel]),
          h.p(
            [h.Class(className(styles.copyText))],
            [
              `${bannerMessage} `,
              h.a(
                [h.Href(privacyHref), h.Class(className(styles.privacyLink))],
                [privacyLabel]
              ),
            ]
          ),
        ]
      ),
      h.div(
        [h.Class(className(styles.actions))],
        [
          h.button(
            [
              h.Id(acceptButtonId),
              h.Type("button"),
              h.Class(className(styles.action)),
              h.OnClick(Message.ChoseAll()),
            ],
            [acceptLabel]
          ),
          h.button(
            [
              h.Id(rejectButtonId),
              h.Type("button"),
              h.Class(className(styles.action)),
              h.OnClick(Message.ChoseEssential()),
            ],
            [rejectLabel]
          ),
        ]
      ),
    ]
  );
