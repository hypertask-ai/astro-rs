import * as stylex from "@stylexjs/stylex";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { siteBuilder } from "../../site-base.js";
import { ctaLink } from "../cta/index.js";
import type { CtaLink } from "../cta/index.js";
import { page } from "../page/index.js";
import * as copy from "./copy.js";
import type {
  ChallengeCard,
  ChallengeItem,
  FeatureRow,
  MetricRow,
  Reason,
  Result,
} from "./copy.js";
import { styles } from "./testimonial-ida.stylex.js";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const crossPath =
  "M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z";

const tickPath =
  "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.53a.75.75 0 00-1.06 1.061l2.03 2.03a.75.75 0 001.137-.089l3.857-5.401z";

const ctaGroup = (
  h: HtmlBuilder<AppMessage>,
  primary: CtaLink,
  secondary: CtaLink,
  size: "hero" | "large"
): Html =>
  h.div(
    [h.Class(classes(styles.ctaGroup))],
    [
      ctaLink(h, primary, "primary", size),
      ctaLink(h, secondary, "secondary", size),
    ]
  );

const hero = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.hero))],
    [
      h.div(
        [h.Class(classes(styles.heroGlowWrap))],
        [h.div([h.Class(classes(styles.heroGlow))])]
      ),
      h.div(
        [h.Class(classes(styles.heroInner))],
        [
          h.h1([h.Class(classes(styles.heroTitle))], [copy.heroTitle]),
          h.p([h.Class(classes(styles.heroSubtitle))], [copy.heroSubtitle]),
          ctaGroup(h, copy.primaryCta, copy.secondaryCta, "hero"),
        ]
      ),
    ]
  );

const sectionHeading = (h: HtmlBuilder<AppMessage>, title: string): Html =>
  h.h1([h.Class(classes(styles.headline))], [title]);

const metrics = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.section))],
    [
      h.div(
        [h.Class(classes(styles.content))],
        [
          h.div(
            [h.Class(classes(styles.metricsGrid))],
            copy.metrics.map((metric) =>
              h.div(
                [h.Class(classes(styles.metricStack))],
                [
                  h.div([h.Class(classes(styles.metricValue))], [metric.value]),
                  h.div([h.Class(classes(styles.metricLabel))], [metric.label]),
                ]
              )
            )
          ),
        ]
      ),
    ]
  );

const challengeItem = (
  h: HtmlBuilder<AppMessage>,
  item: ChallengeItem,
  after: boolean
): Html =>
  h.div(
    [h.Class(classes(styles.item))],
    [
      h.div(
        [
          h.Class(
            classes(
              styles.itemIcon,
              after ? styles.itemIconAfter : styles.itemIconBefore
            )
          ),
        ],
        [
          h.svg(
            [h.ViewBox("0 0 20 20"), h.Fill("currentColor")],
            [
              h.path([
                h.FillRule("evenodd"),
                h.D(after ? tickPath : crossPath),
                h.ClipRule("evenodd"),
              ]),
            ]
          ),
        ]
      ),
      h.div(
        [],
        [
          h.p([h.Class(classes(styles.itemTitle))], [item.title]),
          h.p([h.Class(classes(styles.itemDetail))], [item.detail]),
        ]
      ),
    ]
  );

const challengeCard = (
  h: HtmlBuilder<AppMessage>,
  card: ChallengeCard,
  after: boolean
): Html =>
  h.div(
    [
      h.Class(
        classes(
          styles.challengeCard,
          after ? styles.challengeCardAfter : styles.challengeCardBefore
        )
      ),
    ],
    [
      h.div(
        [h.Class(classes(styles.badgeWrap))],
        [
          h.div(
            [
              h.Class(
                classes(
                  styles.badge,
                  after ? styles.badgeAfter : styles.badgeBefore
                )
              ),
            ],
            [card.badge]
          ),
        ]
      ),
      h.div(
        [h.Class(classes(styles.challengeTitleWrap))],
        [
          h.h3([h.Class(classes(styles.challengeTitle))], [card.title]),
          h.div([
            h.Class(
              classes(styles.rule, after ? styles.ruleAfter : styles.ruleBefore)
            ),
          ]),
        ]
      ),
      h.div(
        [h.Class(classes(styles.items))],
        card.items.map((item) => challengeItem(h, item, after))
      ),
      h.div(
        [
          h.Class(
            classes(
              styles.visual,
              after ? styles.visualAfter : styles.visualBefore
            )
          ),
        ],
        after
          ? [
              h.div(
                [h.Class(classes(styles.visualBars))],
                [
                  h.div([h.Class(classes(styles.visualBar))]),
                  h.div([
                    h.Class(classes(styles.visualBar, styles.visualBarNarrow)),
                  ]),
                  h.div([
                    h.Class(
                      classes(styles.visualBar, styles.visualBarNarrowest)
                    ),
                  ]),
                ]
              ),
              h.p(
                [
                  h.Class(
                    classes(styles.visualCaption, styles.visualCaptionAfter)
                  ),
                ],
                [card.caption]
              ),
            ]
          : [
              h.div(
                [h.Class(classes(styles.visualBoxes))],
                [
                  h.div([h.Class(classes(styles.visualBox))]),
                  h.div([h.Class(classes(styles.visualBox))]),
                  h.div([h.Class(classes(styles.visualBox))]),
                ]
              ),
              h.p(
                [
                  h.Class(
                    classes(styles.visualCaption, styles.visualCaptionBefore)
                  ),
                ],
                [card.caption]
              ),
            ]
      ),
    ]
  );

const challenge = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.section))],
    [
      h.div(
        [h.Class(classes(styles.content))],
        [
          h.div(
            [h.Class(classes(styles.challengeHeader))],
            [
              sectionHeading(h, copy.challengeTitle),
              h.p(
                [h.Class(classes(styles.challengeLede))],
                [copy.challengeLede]
              ),
            ]
          ),
          h.div(
            [h.Class(classes(styles.challengeGrid))],
            [
              challengeCard(h, copy.challengeBefore, false),
              challengeCard(h, copy.challengeAfter, true),
            ]
          ),
        ]
      ),
    ]
  );

const featureRow = (h: HtmlBuilder<AppMessage>, row: FeatureRow): Html =>
  h.div(
    [h.Class(classes(styles.row))],
    [
      h.div(
        [
          h.Class(
            classes(
              styles.imageCell,
              !row.imageFirst && styles.imageCellReversed
            )
          ),
        ],
        [
          h.img([
            h.Src(row.image),
            h.Alt(`${row.title} - Feature Visual`),
            h.Width("1000"),
            h.Height("1000"),
            h.Loading("lazy"),
            h.Class(classes(styles.image)),
          ]),
          h.div([
            h.AriaHidden(true),
            h.Class(
              classes(styles.overlay, row.imageFirst && styles.overlayFirst)
            ),
          ]),
        ]
      ),
      h.div(
        [
          h.Class(
            classes(
              styles.rowTextCell,
              !row.imageFirst && styles.rowTextCellReversed
            )
          ),
        ],
        [
          h.div(
            [h.Class(classes(styles.rowText))],
            [
              h.h3([h.Class(classes(styles.rowTitle))], [row.title]),
              ...(row.quote === undefined
                ? []
                : [
                    h.blockquote(
                      [h.Class(classes(styles.quote))],
                      [`“${row.quote}”`]
                    ),
                  ]),
              ...(row.description === undefined
                ? []
                : [
                    h.div(
                      [h.Class(classes(styles.rowDescription))],
                      [row.description]
                    ),
                  ]),
              ...(row.bullets === undefined
                ? []
                : [
                    h.ul(
                      [h.Class(classes(styles.rowBullets))],
                      row.bullets.map((bullet) =>
                        h.li([h.Class(classes(styles.bullet))], [bullet])
                      )
                    ),
                  ]),
            ]
          ),
        ]
      ),
    ]
  );

const featureSection = (
  h: HtmlBuilder<AppMessage>,
  title: string,
  rows: readonly FeatureRow[]
): Html =>
  h.div(
    [h.Class(classes(styles.section))],
    [
      h.div(
        [h.Class(classes(styles.content))],
        [
          sectionHeading(h, title),
          h.div(
            [h.Class(classes(styles.rowList))],
            rows.map((row) => featureRow(h, row))
          ),
        ]
      ),
    ]
  );

const resultCard = (h: HtmlBuilder<AppMessage>, result: Result): Html =>
  h.div(
    [h.Class(classes(styles.resultCard))],
    [
      h.h3([h.Class(classes(styles.resultTitle))], [result.title]),
      h.div(
        [h.Class(classes(styles.resultBody))],
        [
          h.p(
            [h.Class(classes(styles.resultLine))],
            [
              h.span([h.Class(classes(styles.resultBeforeLabel))], ["Before:"]),
              " ",
              result.before,
            ]
          ),
          h.p(
            [h.Class(classes(styles.resultLine))],
            [
              h.span([h.Class(classes(styles.resultAfterLabel))], ["After:"]),
              " ",
              result.after,
            ]
          ),
          h.p([h.Class(classes(styles.resultNote))], [result.note]),
        ]
      ),
    ]
  );

const results = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.section))],
    [
      h.div(
        [h.Class(classes(styles.content))],
        [
          sectionHeading(h, copy.resultsTitle),
          h.div(
            [h.Class(classes(styles.resultsGrid))],
            copy.results.map((result) => resultCard(h, result))
          ),
        ]
      ),
    ]
  );

const metricsRow = (h: HtmlBuilder<AppMessage>, row: MetricRow): Html =>
  h.tr(
    [],
    [
      h.td(
        [h.Class(classes(styles.tableBodyCell, styles.tableBodyFirst))],
        [row.metric]
      ),
      h.td([h.Class(classes(styles.tableBodyCell))], [row.before]),
      h.td([h.Class(classes(styles.tableBodyCell))], [row.after]),
      h.td(
        [h.Class(classes(styles.tableBodyCell, styles.tableBodyLast))],
        [row.improvement]
      ),
    ]
  );

const metricsTable = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.section))],
    [
      h.div(
        [h.Class(classes(styles.content))],
        [
          sectionHeading(h, copy.metricsTableTitle),
          h.div(
            [
              h.Tabindex(0),
              h.Role("region"),
              h.AriaLabel(copy.metricsTableTitle),
              h.Class(classes(styles.tableWrap)),
            ],
            [
              h.table(
                [h.Class(classes(styles.table))],
                [
                  h.thead(
                    [h.Class(classes(styles.tableHead))],
                    [
                      h.tr(
                        [h.Class(classes(styles.tableRow))],
                        [
                          h.th(
                            [
                              h.Class(
                                classes(
                                  styles.tableHeadCell,
                                  styles.tableHeadFirst
                                )
                              ),
                            ],
                            [copy.metricsTableHead[0] ?? ""]
                          ),
                          h.th(
                            [
                              h.Scope("col"),
                              h.Class(
                                classes(
                                  styles.tableHeadCell,
                                  styles.tableHeadSecond
                                )
                              ),
                            ],
                            [copy.metricsTableHead[1] ?? ""]
                          ),
                          h.th(
                            [
                              h.Scope("col"),
                              h.Class(
                                classes(
                                  styles.tableHeadCell,
                                  styles.tableHeadThird
                                )
                              ),
                            ],
                            [copy.metricsTableHead[2] ?? ""]
                          ),
                          h.th(
                            [
                              h.Scope("col"),
                              h.Class(
                                classes(
                                  styles.tableHeadCell,
                                  styles.tableHeadFourth
                                )
                              ),
                            ],
                            [copy.metricsTableHead[3] ?? ""]
                          ),
                        ]
                      ),
                    ]
                  ),
                  h.tbody(
                    [],
                    copy.metricsTable.map((row) => metricsRow(h, row))
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
    ]
  );

const reasonCard = (h: HtmlBuilder<AppMessage>, reason: Reason): Html =>
  h.div(
    [h.Class(classes(styles.whyCard))],
    [
      h.h3([h.Class(classes(styles.whyTitle))], [reason.title]),
      h.p([h.Class(classes(styles.whyText))], [reason.description]),
    ]
  );

const whyItWorks = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.section))],
    [
      h.div(
        [h.Class(classes(styles.content))],
        [
          sectionHeading(h, copy.whyItWorksTitle),
          h.div(
            [h.Class(classes(styles.whyGrid))],
            copy.whyItWorks.map((reason) => reasonCard(h, reason))
          ),
        ]
      ),
    ]
  );

const bottomCta = (h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.Id("cta")],
    [
      h.div(
        [h.Class(classes(styles.section, styles.sectionRelative))],
        [
          h.div(
            [h.Class(classes(styles.bottomGlowWrap))],
            [h.div([h.Class(classes(styles.bottomGlow))])]
          ),
          h.div(
            [h.Class(classes(styles.bottomCard))],
            [
              h.div(
                [h.Class(classes(styles.content))],
                [
                  h.h3(
                    [h.Class(classes(styles.bottomTitle))],
                    [copy.bottomTitle]
                  ),
                  h.p([h.Class(classes(styles.bottomBody))], [copy.bottomBody]),
                  ctaGroup(h, copy.primaryCta, copy.secondaryCta, "large"),
                ]
              ),
            ]
          ),
        ]
      ),
    ]
  );

export const view = (
  model: AppModel,
  builder: HtmlBuilder<AppMessage>
): Document => {
  const h = siteBuilder(builder);

  return page(
    model,
    h,
    copy.testimonialIdaPath,
    [
      hero(h),
      metrics(h),
      challenge(h),
      featureSection(h, copy.solutionTitle, copy.solutions),
      results(h),
      metricsTable(h),
      featureSection(h, copy.keyFeaturesTitle, copy.keyFeatures),
      whyItWorks(h),
      bottomCta(h),
    ],
    copy.pageTitle
  );
};
