import * as stylex from "@stylexjs/stylex";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { siteBuilder } from "../../site-base.js";
import { ctaLink } from "../cta/index.js";
import { page } from "../page/index.js";
import * as copy from "./copy.js";
import type { ComparisonRow } from "./copy.js";
import { styles } from "./vs-linear.stylex.js";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const sectionHeading = (
  h: HtmlBuilder<AppMessage>,
  number: string,
  title: string
): Html =>
  h.div(
    [h.Class(classes(styles.sectionHeading))],
    [
      h.span(
        [h.AriaHidden(true), h.Class(classes(styles.sectionNumber))],
        [number]
      ),
      h.h2([h.Class(classes(styles.pageHeading))], [title]),
    ]
  );

const tableHeading = (
  h: HtmlBuilder<AppMessage>,
  number: string,
  title: string
): Html =>
  h.div(
    [h.Class(classes(styles.tableSectionHeading))],
    [
      h.span(
        [
          h.AriaHidden(true),
          h.Class(classes(styles.sectionNumber, styles.tableSectionNumber)),
        ],
        [number]
      ),
      h.h2(
        [h.Class(classes(styles.pageHeading, styles.tableSectionTitle))],
        [title]
      ),
    ]
  );

const paragraphs = (
  h: HtmlBuilder<AppMessage>,
  lines: readonly string[]
): readonly Html[] => [
  h.p([h.Class(classes(styles.proseFirst))], [lines[0] ?? ""]),
  ...lines
    .slice(1)
    .map((line) => h.p([h.Class(classes(styles.proseAfter))], [line])),
];

const row = (
  h: HtmlBuilder<AppMessage>,
  feature: ComparisonRow,
  index: number
): Html => {
  const lastRow = index === copy.comparisonRows.length - 1;

  const rowAttributes =
    index % 2 === 1 ? [h.Class(classes(styles.tableRow))] : [];

  return h.tr(rowAttributes, [
    h.th(
      [
        h.Scope("row"),
        h.Class(
          classes(
            styles.tableCell,
            styles.tableRowHeader,
            ...(lastRow ? [styles.tableCellLastRow] : [])
          )
        ),
      ],
      [feature.feature]
    ),
    h.td(
      [
        h.Class(
          classes(
            styles.tableCell,
            ...(feature.winner === "hypertask" ? [styles.winnerCell] : []),
            ...(lastRow ? [styles.tableCellLastRow] : [])
          )
        ),
      ],
      [feature.hypertask]
    ),
    h.td(
      [
        h.Class(
          classes(
            styles.tableCell,
            styles.tableCellLastColumn,
            ...(feature.winner === "linear" ? [styles.winnerCell] : []),
            ...(lastRow ? [styles.tableCellLastRow] : [])
          )
        ),
      ],
      [feature.linear]
    ),
  ]);
};

const comparisonTable = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.tableFrame))],
    [
      h.div(
        [h.Tabindex(0), h.Class(classes(styles.tableScroll))],
        [
          h.table(
            [h.Class(classes(styles.table))],
            [
              h.colgroup(
                [],
                [
                  h.col([h.Class(classes(styles.featureColumn))]),
                  h.col([h.Class(classes(styles.productColumn))]),
                  h.col([h.Class(classes(styles.productColumn))]),
                ]
              ),
              h.thead(
                [h.Class(classes(styles.tableHead))],
                [
                  h.tr(
                    [],
                    [
                      h.th(
                        [
                          h.Scope("col"),
                          h.Class(
                            classes(styles.tableCell, styles.tableHeadCell)
                          ),
                        ],
                        [h.span([h.Class(classes(styles.srOnly))], ["Feature"])]
                      ),
                      h.th(
                        [
                          h.Scope("col"),
                          h.Class(
                            classes(styles.tableCell, styles.tableHeadCell)
                          ),
                        ],
                        [
                          h.span([
                            h.AriaHidden(true),
                            h.Class(classes(styles.productMark)),
                          ]),
                          "Hypertask",
                        ]
                      ),
                      h.th(
                        [
                          h.Scope("col"),
                          h.Class(
                            classes(
                              styles.tableCell,
                              styles.tableHeadCell,
                              styles.tableCellLastColumn
                            )
                          ),
                        ],
                        ["Linear"]
                      ),
                    ]
                  ),
                ]
              ),
              h.tbody(
                [],
                copy.comparisonRows.map((feature, index) =>
                  row(h, feature, index)
                )
              ),
            ]
          ),
        ]
      ),
    ]
  );

const wins = (h: HtmlBuilder<AppMessage>): Html =>
  h.ul(
    [h.Class(classes(styles.winsList))],
    copy.linearWins.map((win) =>
      h.li([h.Class(classes(styles.winsItem))], [win])
    )
  );

const content = (h: HtmlBuilder<AppMessage>): readonly Html[] => [
  h.header(
    [h.Class(classes(styles.wrap, styles.hero))],
    [
      h.p(
        [h.Class(classes(styles.eyebrow, styles.heroChildren))],
        [copy.eyebrow]
      ),
      h.h1(
        [h.Class(classes(styles.heroTitle, styles.heroChildren))],
        [copy.heroTitle]
      ),
      h.p(
        [h.Class(classes(styles.heroSubtitle, styles.heroChildren))],
        [copy.heroSubtitle]
      ),
    ]
  ),
  h.div(
    [h.Class(classes(styles.wrap, styles.articleBody))],
    [
      h.section(
        [h.Class(classes(styles.copySection))],
        [
          sectionHeading(h, "01", "Start with the truth"),
          h.div(
            [h.Class(classes(styles.prose))],
            paragraphs(h, copy.introParagraphs)
          ),
        ]
      ),
      h.section(
        [h.Class(classes(styles.copySection))],
        [
          sectionHeading(h, "02", "Agents get a seat, not a side channel"),
          h.div(
            [h.Class(classes(styles.prose))],
            paragraphs(h, copy.agentsParagraphs)
          ),
          h.pre(
            [h.Class(classes(styles.publication))],
            [
              h.code(
                [h.Class(classes(styles.codeLine))],
                [
                  h.span(
                    [h.Class(classes(styles.codeComment))],
                    [copy.mcpCodeComment]
                  ),
                  "\n",
                  copy.mcpCodeEndpoint,
                  "\n",
                  h.span(
                    [h.Class(classes(styles.codeComment))],
                    [copy.mcpCodeDocsComment]
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
      h.section(
        [h.Class(classes(styles.copySection, styles.tableSection))],
        [tableHeading(h, "03", "Feature by feature"), comparisonTable(h)]
      ),
      h.section(
        [h.Class(classes(styles.copySection))],
        [
          sectionHeading(h, "04", "Where Linear genuinely wins"),
          h.div(
            [h.Class(classes(styles.prose))],
            [
              wins(h),
              h.p([h.Class(classes(styles.proseFirst))], [copy.winsClosing]),
            ]
          ),
        ]
      ),
    ]
  ),
  h.section(
    [h.Class(classes(styles.ctaSection))],
    [
      h.div(
        [h.Class(classes(styles.wrap, styles.ctaInner))],
        [
          h.div([h.AriaHidden(true), h.Class(classes(styles.ctaRule))]),
          h.div(
            [h.Class(classes(styles.ctaActions))],
            [
              ctaLink(h, copy.primaryCta, "primary", "large"),
              ctaLink(h, copy.secondaryCta, "secondary", "large"),
            ]
          ),
          h.div([h.AriaHidden(true), h.Class(classes(styles.ctaRule))]),
        ]
      ),
    ]
  ),
  h.footer(
    [h.Class(classes(styles.wrap, styles.comparisonNote))],
    [h.p([h.Class(classes(styles.comparisonNoteText))], [copy.comparisonNote])]
  ),
];

export const view = (
  model: AppModel,
  builder: HtmlBuilder<AppMessage>
): Document => {
  const h = siteBuilder(builder);

  return page(
    model,
    h,
    copy.comparisonPath,
    [h.article([h.Class(classes(styles.page))], content(h))],
    copy.pageTitle
  );
};
