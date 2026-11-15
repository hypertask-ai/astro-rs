import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../../client/app/message.js";
import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import {
  cookieSettingsLabel,
  copyrightLine,
  footerLabel,
  homeHref,
  homeFooterLinks,
  loginHintAfter,
  loginHintBefore,
  loginKey,
  loginLabel,
  loginUrl,
  mainId,
  menuClosedGlyph,
  menuLabel,
  menuOpenGlyph,
  mobileStartLabel,
  pageFooterLinks,
  primaryLinks,
  resourceLinks,
  skipLabel,
  startLabel,
  wordmark,
} from "./copy.js";
import type { FrameLink } from "./copy.js";
import {
  footerStyles,
  frameStyles,
  headerStyles,
  menuStyles,
} from "./frame.stylex.js";

export type FrameVariant = "home" | "page";

const classes = (...styles: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...styles).className ?? "";

const linkAttributes = (h: HtmlBuilder<AppMessage>, link: FrameLink) => [
  h.Href(link.href),
  ...(link.external ? [h.Target("_blank"), h.Rel("noopener noreferrer")] : []),
];

const loginAttributes = (h: HtmlBuilder<AppMessage>) => [
  h.Href(loginUrl),
  h.Target("_blank"),
  h.Rel("noopener noreferrer"),
];

const navLink = (
  h: HtmlBuilder<AppMessage>,
  link: FrameLink,
  variant: FrameVariant
): Html =>
  h.a(
    [
      ...linkAttributes(h, link),
      h.Class(
        classes(headerStyles.link, variant === "home" && headerStyles.linkHome)
      ),
    ],
    [link.label]
  );

const navGroup = (
  h: HtmlBuilder<AppMessage>,
  links: readonly FrameLink[],
  variant: FrameVariant
): Html =>
  h.nav(
    [
      h.Class(
        classes(headerStyles.nav, variant === "home" && headerStyles.navHome)
      ),
    ],
    links.map((link) => navLink(h, link, variant))
  );

const logo = (h: HtmlBuilder<AppMessage>, variant: FrameVariant): Html =>
  h.div(
    [h.Class(classes(headerStyles.logoWrap))],
    [
      h.a(
        [h.Href(homeHref), h.Class(classes(headerStyles.logo))],
        [
          h.img([
            h.Src("/Favicon%20-%20Light.png"),
            h.Alt(""),
            h.Width("360"),
            h.Height("424"),
            h.Loading("eager"),
            h.Class(classes(headerStyles.glyph)),
          ]),
          h.span(
            [
              h.Class(
                classes(
                  headerStyles.wordmark,
                  variant === "home" && headerStyles.wordmarkHome
                )
              ),
            ],
            [wordmark]
          ),
        ]
      ),
    ]
  );

const loginButton = (h: HtmlBuilder<AppMessage>, variant: FrameVariant): Html =>
  h.a(
    [
      h.Id("login-button"),
      ...loginAttributes(h),
      h.AriaDescribedBy("login-shortcut-hint"),
      h.Class(
        classes(
          headerStyles.button,
          headerStyles.buttonGhost,
          variant === "home" && headerStyles.buttonGhostHome,
          stylex.defaultMarker()
        )
      ),
    ],
    [
      loginLabel,
      h.span(
        [
          h.Id("login-shortcut-hint"),
          h.Role("tooltip"),
          h.Class(classes(headerStyles.hint)),
        ],
        [
          loginHintBefore,
          h.kbd([h.Class(classes(headerStyles.key))], [loginKey]),
          loginHintAfter,
        ]
      ),
    ]
  );

const startButton = (
  h: HtmlBuilder<AppMessage>,
  id: string,
  label: string,
  extra: readonly stylex.StyleXStyles[] = []
): Html =>
  h.a(
    [
      h.Id(id),
      ...loginAttributes(h),
      h.Class(classes(headerStyles.button, headerStyles.buttonSolid, ...extra)),
    ],
    [label]
  );

const mobileMenu = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Id("mobile-menu"), h.Class(classes(menuStyles.panel))],
    [
      ...[primaryLinks, resourceLinks].map((links) =>
        h.nav(
          [h.Class(classes(menuStyles.group))],
          links.map((link) =>
            h.a(
              [
                ...linkAttributes(h, link),
                h.Class(classes(menuStyles.item)),
                h.OnClick(Message.ClosedMenu()),
              ],
              [link.label]
            )
          )
        )
      ),
      h.div(
        [h.Class(classes(menuStyles.actions))],
        [
          h.a(
            [
              ...loginAttributes(h),
              h.Class(
                classes(
                  headerStyles.button,
                  headerStyles.buttonGhost,
                  menuStyles.actionGhost
                )
              ),
              h.OnClick(Message.ClosedMenu()),
            ],
            [loginLabel]
          ),
          h.a(
            [
              ...loginAttributes(h),
              h.Class(
                classes(
                  headerStyles.button,
                  headerStyles.buttonSolid,
                  menuStyles.actionSolid
                )
              ),
              h.OnClick(Message.ClosedMenu()),
            ],
            [mobileStartLabel]
          ),
        ]
      ),
    ]
  );

const header = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>,
  variant: FrameVariant
): Html =>
  h.header(
    [
      h.Id("main-header"),
      h.Class(
        classes(
          variant === "home" ? headerStyles.flat : headerStyles.floating,
          variant === "page" && model.scrolled && headerStyles.floatingScrolled
        )
      ),
    ],
    [
      h.div(
        [
          h.Class(
            classes(
              headerStyles.bar,
              variant === "home" && headerStyles.barHome
            )
          ),
        ],
        [
          logo(h, variant),
          h.div(
            [
              h.Class(
                classes(
                  headerStyles.navGroup,
                  variant === "home" && headerStyles.navGroupHome
                )
              ),
            ],
            [
              navGroup(h, primaryLinks, variant),
              navGroup(h, resourceLinks, variant),
            ]
          ),
          h.div(
            [h.Class(classes(headerStyles.authDesktop))],
            [
              loginButton(h, variant),
              startButton(h, "get-started-button", startLabel),
            ]
          ),
          h.div(
            [h.Class(classes(headerStyles.authMobile))],
            [
              startButton(h, "mobile-get-started-button", startLabel),
              h.button(
                [
                  h.Type("button"),
                  h.AriaLabel(menuLabel),
                  h.AriaExpanded(model.menuOpen),
                  h.AriaControls("mobile-menu"),
                  h.Class(classes(headerStyles.hamburger)),
                  h.OnClick(Message.ToggledMenu()),
                ],
                [model.menuOpen ? menuOpenGlyph : menuClosedGlyph]
              ),
            ]
          ),
        ]
      ),
      ...(model.menuOpen ? [mobileMenu(h)] : []),
    ]
  );

const footerLink = (
  h: HtmlBuilder<AppMessage>,
  link: FrameLink,
  variant: FrameVariant
): Html =>
  h.a(
    [
      ...linkAttributes(h, link),
      h.Class(
        classes(variant === "home" ? footerStyles.linkHome : footerStyles.link)
      ),
    ],
    [link.label]
  );

const cookieButton = (
  h: HtmlBuilder<AppMessage>,
  variant: FrameVariant
): Html =>
  h.button(
    [
      h.Type("button"),
      h.Class(
        classes(variant === "home" ? footerStyles.linkHome : footerStyles.link)
      ),
      h.OnClick(Message.OpenedCookieSettings()),
    ],
    [cookieSettingsLabel]
  );

const footer = (
  h: HtmlBuilder<AppMessage>,
  variant: FrameVariant,
  year: number
): Html => {
  const links = variant === "home" ? homeFooterLinks : pageFooterLinks;
  const items = links.map((link) => footerLink(h, link, variant));

  const withCookies =
    variant === "home"
      ? [...items, cookieButton(h, variant)]
      : [...items.slice(0, 4), cookieButton(h, variant), ...items.slice(4)];

  return h.footer(
    [
      h.Class(
        classes(
          variant === "home" ? footerStyles.footerHome : footerStyles.footer
        )
      ),
    ],
    [
      h.div(
        [h.Class(classes(variant === "page" && footerStyles.inner))],
        [
          h.nav(
            [
              h.AriaLabel(footerLabel),
              h.Class(
                classes(
                  footerStyles.nav,
                  variant === "home" && footerStyles.navHome
                )
              ),
            ],
            withCookies
          ),
          h.div(
            [
              h.Class(
                classes(
                  variant === "home"
                    ? footerStyles.copyrightHome
                    : footerStyles.copyright
                )
              ),
            ],
            [copyrightLine(year)]
          ),
        ]
      ),
    ]
  );
};

export const frame = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>,
  variant: FrameVariant,
  content: readonly Html[]
): Html =>
  h.div(
    [h.Class(classes(frameStyles.shell))],
    [
      h.a(
        [h.Href(`#${mainId}`), h.Class(classes(frameStyles.skipLink))],
        [skipLabel]
      ),
      header(model, h, variant),
      h.main([h.Id(mainId), h.Class(classes(frameStyles.main))], content),
      footer(h, variant, model.year),
    ]
  );
