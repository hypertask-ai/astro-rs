import * as stylex from "@stylexjs/stylex";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { consentBanner } from "../consent/index.js";
import { frame } from "../frame/index.js";
import { canonicalFor, pageHeads } from "../head/index.js";
import { loginCta, useCasePages } from "./copy.js";
import type { UseCaseLink, UseCaseModule, UseCasePage } from "./copy.js";
import { styles } from "./use-cases.stylex.js";

export type UseCaseView = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
) => Document;

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const ctaLink = (
  h: HtmlBuilder<AppMessage>,
  link: UseCaseLink,
  variant: "primary" | "secondary",
  size: "hero" | "large"
): Html =>
  h.a(
    [
      ...(variant === "primary" ? [h.Id("get-started-button")] : []),
      h.Href(link.href),
      h.Target("_blank"),
      h.Rel("noopener noreferrer"),
      h.Class(
        classes(
          styles.cta,
          variant === "primary" ? styles.ctaPrimary : styles.ctaSecondary,
          size === "hero" ? styles.ctaHero : styles.ctaLarge
        )
      ),
    ],
    [link.label]
  );

const hero = (page: UseCasePage, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.hero))],
    [
      h.div(
        [h.Class(classes(styles.heroGlowWrap))],
        [h.div([h.Class(classes(styles.heroGlow))], [])]
      ),
      h.div(
        [h.Class(classes(styles.heroInner))],
        [
          h.h1([h.Class(classes(styles.heroTitle))], [page.heroTitle]),
          h.p([h.Class(classes(styles.heroLede))], [page.heroSubtitle]),
          h.div(
            [h.Class(classes(styles.ctaRow))],
            [
              ctaLink(h, loginCta, "primary", "hero"),
              ctaLink(h, page.secondaryCta, "secondary", "hero"),
            ]
          ),
        ]
      ),
    ]
  );

const overlays = (
  h: HtmlBuilder<AppMessage>,
  imageFirst: boolean
): readonly Html[] => [
  h.div(
    [
      h.AriaHidden(true),
      h.Class(
        classes(
          styles.overlayTablet,
          imageFirst
            ? styles.overlayImageFirstDesktop
            : styles.overlayTextFirstDesktop
        )
      ),
    ],
    []
  ),
  h.div(
    [
      h.AriaHidden(true),
      h.Class(
        classes(
          styles.overlayPhone,
          imageFirst
            ? styles.overlayImageFirstPhone
            : styles.overlayTextFirstPhone
        )
      ),
    ],
    []
  ),
];

const featureModule = (
  index: number,
  contents: UseCaseModule,
  h: HtmlBuilder<AppMessage>
): Html => {
  const imageFirst = index % 2 === 0;

  return h.div(
    [h.Id(contents.id), h.Class(classes(styles.module))],
    [
      h.div(
        [h.Class(classes(styles.grid))],
        [
          h.div(
            [
              h.Class(
                classes(
                  styles.visual,
                  imageFirst ? styles.visualFirst : styles.visualSecond
                )
              ),
            ],
            [
              h.img([
                h.Src(contents.imageUrl),
                h.Alt(`${contents.headline} - Feature Visual`),
                h.Width("1000"),
                h.Height("1000"),
                h.Loading("lazy"),
                h.Class(classes(styles.moduleImage)),
              ]),
              ...overlays(h, imageFirst),
            ]
          ),
          h.div(
            [h.Class(classes(imageFirst ? styles.copy : styles.copyFirst))],
            [
              h.div(
                [h.Class(classes(styles.moduleText))],
                [
                  h.p([h.Class(classes(styles.eyebrow))], [contents.eyebrow]),
                  h.h2(
                    [h.Class(classes(styles.moduleTitle))],
                    [contents.headline]
                  ),
                  h.div(
                    [h.Class(classes(styles.moduleBody))],
                    [contents.body.join("\n\n")]
                  ),
                  h.div(
                    [h.Class(classes(styles.bullets))],
                    [
                      h.p(
                        [h.Class(classes(styles.bulletsTitle))],
                        [contents.bulletsTitle]
                      ),
                      h.ul(
                        [h.Class(classes(styles.bulletList))],
                        contents.bullets.map((bullet, bulletIndex) =>
                          h.li(
                            [
                              h.Class(
                                classes(
                                  styles.bullet,
                                  bulletIndex > 0 && styles.bulletSpaced
                                )
                              ),
                            ],
                            [bullet]
                          )
                        )
                      ),
                    ]
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
    ]
  );
};

const bottomCta = (page: UseCasePage, h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.Id("cta"), h.Class(classes(styles.ctaShell))],
    [
      h.div(
        [h.Class(classes(styles.ctaSection))],
        [
          h.div(
            [h.Class(classes(styles.ctaGlowWrap))],
            [h.div([h.Class(classes(styles.ctaGlow))], [])]
          ),
          h.div(
            [h.Class(classes(styles.ctaCard))],
            [
              h.div(
                [h.Class(classes(styles.ctaInner))],
                [
                  h.h3([h.Class(classes(styles.ctaTitle))], [page.bottomTitle]),
                  h.p([h.Class(classes(styles.ctaBody))], [page.bottomBody]),
                  h.div(
                    [h.Class(classes(styles.ctaRow))],
                    [
                      ctaLink(h, loginCta, "primary", "large"),
                      ctaLink(h, page.secondaryCta, "secondary", "large"),
                    ]
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
    ]
  );

const viewFor =
  (page: UseCasePage): UseCaseView =>
  (model, h) => ({
    body: h.div(
      [],
      [
        frame(model, h, "page", [
          hero(page, h),
          ...page.modules.map((contents, index) =>
            featureModule(index, contents, h)
          ),
          bottomCta(page, h),
        ]),
        consentBanner(model, h),
      ]
    ),
    canonical: canonicalFor(page.path),
    ogUrl: canonicalFor(page.path),
    title: pageHeads.get(page.path)?.title ?? page.heroTitle,
  });

export const useCaseViews: ReadonlyMap<string, UseCaseView> = new Map(
  useCasePages.map((page) => [page.path, viewFor(page)] as const)
);

export const useCaseViewFor = (pathname: string): UseCaseView | undefined =>
  useCaseViews.get(pathname.endsWith("/") ? pathname : `${pathname}/`);
