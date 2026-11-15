import * as stylex from "@stylexjs/stylex";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../../client/app/message.js";
import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { copiedLabel } from "../home/copy.js";
import { pricingModule } from "../home/index.js";
import { page } from "../page/index.js";
import { testimonialsSection } from "../testimonials/index.js";
import * as copy from "./copy.js";
import type { DiptychFeature } from "./copy.js";
import { styles } from "./hallmark.stylex.js";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const copyIconPath = "M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1";

const checkIconPath = "M5 13l4 4L19 7";

const button = (
  h: HtmlBuilder<AppMessage>,
  href: string,
  label: string,
  variant: "primary" | "ghost"
): Html =>
  h.a(
    [
      h.Href(href),
      h.Class(
        classes(styles.primaryButton, variant === "ghost" && styles.ghostButton)
      ),
    ],
    [label]
  );

const cliButton = (model: AppModel, h: HtmlBuilder<AppMessage>): Html => {
  const copied = model.copyLabel === copiedLabel;

  return h.button(
    [
      h.Type("button"),
      h.AriaLabel("Copy CLI install command"),
      h.Class(classes(styles.cli)),
      h.OnClick(Message.PressedCopyInstallCommand()),
    ],
    [
      h.span([h.Class(classes(styles.cliPrompt))], [copy.cliPrompt]),
      h.span([h.Class(classes(styles.cliCommand))], [copy.cliCommand]),
      h.span(
        [h.AriaHidden(true), h.Class(classes(styles.cliState))],
        [
          h.svg(
            [
              h.Width("16"),
              h.Height("16"),
              h.ViewBox("0 0 24 24"),
              h.Fill("none"),
              h.Stroke("currentColor"),
              h.StrokeWidth("2"),
              h.Class(
                classes(
                  copied ? styles.cliStateIconHidden : styles.cliStateIconShown
                )
              ),
            ],
            [
              h.rect([
                h.X("9"),
                h.Y("9"),
                h.Width("13"),
                h.Height("13"),
                h.Rx("2"),
              ]),
              h.path([h.D(copyIconPath)]),
            ]
          ),
          h.svg(
            [
              h.Width("16"),
              h.Height("16"),
              h.ViewBox("0 0 24 24"),
              h.Fill("none"),
              h.Stroke("currentColor"),
              h.StrokeWidth("2"),
              h.Class(
                classes(
                  copied ? styles.cliStateIconShown : styles.cliStateIconHidden
                )
              ),
            ],
            [
              h.path([
                h.StrokeLinecap("round"),
                h.StrokeLinejoin("round"),
                h.D(checkIconPath),
              ]),
            ]
          ),
        ]
      ),
    ]
  );
};

const note = (h: HtmlBuilder<AppMessage>): Html =>
  h.p(
    [h.Class(classes(styles.note))],
    [
      `${copy.noteLead} `,
      h.a(
        [h.Href(copy.docsUrl), h.Class(classes(styles.noteLink))],
        [copy.noteLinkLabel]
      ),
      ` ${copy.noteTail}`,
    ]
  );

const ctaRow = (h: HtmlBuilder<AppMessage>, centered: boolean): Html =>
  h.div(
    [h.Class(classes(styles.ctaRow, centered && styles.ctaCenter))],
    [
      button(h, copy.loginUrl, copy.startLabel, "primary"),
      button(h, copy.demoUrl, copy.demoLabel, "ghost"),
    ]
  );

const featureList = (
  h: HtmlBuilder<AppMessage>,
  features: readonly DiptychFeature[]
): Html =>
  h.ul(
    [h.Class(classes(styles.list))],
    features.map((feature) =>
      h.li(
        [h.Class(classes(styles.listItem))],
        [
          h.span([h.AriaHidden(true), h.Class(classes(styles.tick))]),
          h.div(
            [],
            [
              h.strong([h.Class(classes(styles.listTitle))], [feature.title]),
              h.span([h.Class(classes(styles.listDetail))], [feature.detail]),
            ]
          ),
        ]
      )
    )
  );

const hero = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.Class(classes(styles.wrap, styles.hero))],
    [
      h.div(
        [h.Class(classes(styles.heroGrid))],
        [
          h.div(
            [h.Class(classes(styles.heroCopy))],
            [
              h.h1(
                [h.Class(classes(styles.heroTitle))],
                [copy.heroTitleLead, h.br([]), copy.heroTitleTail]
              ),
              h.p([h.Class(classes(styles.lede))], [copy.heroLede]),
              cliButton(model, h),
              ctaRow(h, false),
              note(h),
            ]
          ),
        ]
      ),
      h.div(
        [h.Class(classes(styles.logos))],
        [
          h.span([h.Class(classes(styles.logosLabel))], [copy.logosLabel]),
          h.div(
            [h.Class(classes(styles.logosRow))],
            copy.logos.map((logo) =>
              h.img([
                h.Src(logo.src),
                h.Alt(`${logo.alt} logo`),
                h.Width("80"),
                h.Height("32"),
                h.Loading("lazy"),
                h.Class(classes(styles.logo)),
              ])
            )
          ),
        ]
      ),
    ]
  );

const humans = (h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.Class(classes(styles.wrap, styles.split))],
    [
      h.div(
        [],
        [
          h.h2([h.Class(classes(styles.title))], [copy.humansTitle]),
          h.p([h.Class(classes(styles.bodyLine))], [copy.humansBody]),
          featureList(h, copy.humanFeatures),
        ]
      ),
      h.figure(
        [h.Class(classes(styles.figure))],
        [
          h.video([
            h.Src(copy.humanVideo),
            h.Autoplay(true),
            h.Muted(true),
            h.Loop(true),
            h.Playsinline(true),
            h.Preload("metadata"),
            h.Class(classes(styles.proofMedia)),
          ]),
          h.figcaption(
            [h.Class(classes(styles.proofCaption))],
            [copy.humansCaption]
          ),
        ]
      ),
    ]
  );

const terminal = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.code))],
    copy.terminalLines.flatMap((line) => [
      h.div(
        [h.Class(classes(styles.codeLine))],
        [
          h.span([h.Class(classes(styles.codePrompt))], [copy.cliPrompt]),
          line.command,
        ]
      ),
      h.div([h.Class(classes(styles.codeLine, styles.codeOut))], [line.output]),
    ])
  );

const agents = (h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.Class(classes(styles.wrap, styles.split))],
    [
      h.figure(
        [h.Class(classes(styles.figure))],
        [
          terminal(h),
          h.figcaption(
            [h.Class(classes(styles.proofCaption))],
            [copy.agentsCaption]
          ),
        ]
      ),
      h.div(
        [h.Class(classes(styles.splitCopyReversed))],
        [
          h.h2([h.Class(classes(styles.title))], [copy.agentsTitle]),
          h.p([h.Class(classes(styles.bodyLine))], [copy.agentsBody]),
          featureList(h, copy.agentFeatures),
        ]
      ),
    ]
  );

const agentColumn = (
  h: HtmlBuilder<AppMessage>,
  label: string,
  chips: readonly string[]
): Html =>
  h.div(
    [],
    [
      h.span([h.Class(classes(styles.agentsLabel))], [label]),
      h.div(
        [h.Class(classes(styles.chips))],
        chips.map((chip) => h.span([h.Class(classes(styles.chip))], [chip]))
      ),
    ]
  );

const band = (h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.Class(classes(styles.band))],
    [
      h.div(
        [h.Class(classes(styles.bandInner))],
        [
          h.h2([h.Class(classes(styles.bandTitle))], [copy.bandTitle]),
          h.div(
            [h.Class(classes(styles.agents))],
            [
              agentColumn(h, copy.codingLabel, copy.codingAgents),
              agentColumn(h, copy.chatLabel, copy.chatAgents),
            ]
          ),
          h.p(
            [h.Class(classes(styles.bandFoot))],
            [
              `${copy.bandFootLead} `,
              h.a(
                [h.Href(copy.docsUrl), h.Class(classes(styles.bandFootLink))],
                [copy.bandFootLinkLabel]
              ),
              ` ${copy.bandFootTail}`,
            ]
          ),
        ]
      ),
    ]
  );

const stepExtra = (
  h: HtmlBuilder<AppMessage>,
  number: string
): readonly Html[] => {
  if (number === "1") {
    return [
      h.div(
        [h.Class(classes(styles.code, styles.codeInline))],
        [
          h.div(
            [h.Class(classes(styles.codeLine))],
            [
              h.span([h.Class(classes(styles.codePrompt))], [copy.cliPrompt]),
              copy.stepCommands[0] ?? "",
            ]
          ),
          h.div(
            [h.Class(classes(styles.codeLine))],
            [
              h.span([h.Class(classes(styles.codePrompt))], [copy.cliPrompt]),
              copy.stepCommands[1] ?? "",
            ]
          ),
        ]
      ),
    ];
  }

  if (number !== "3") {
    return [];
  }

  const markers = [styles.statusDone, styles.statusWait, styles.statusShip];

  return [
    h.ul(
      [h.Class(classes(styles.status))],
      copy.stepStatuses.map((status, index) =>
        h.li(
          [h.Class(classes(styles.statusItem))],
          [
            h.span([
              h.AriaHidden(true),
              h.Class(classes(markers[index] ?? styles.statusDone)),
            ]),
            status,
          ]
        )
      )
    ),
  ];
};

const stepBodyWidth = (number: string): stylex.StyleXStyles => {
  if (number === "2" || number === "3") {
    return styles.stepBodyNarrow;
  }

  return styles.stepBodyWide;
};

const stepIndent = (number: string): stylex.StyleXStyles | false => {
  if (number === "2") {
    return styles.stepIndent;
  }

  if (number === "3") {
    return styles.stepIndentSmall;
  }

  return false;
};

const steps = (h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.Class(classes(styles.wrap, styles.how))],
    [
      h.div(
        [h.Class(classes(styles.howHead))],
        [h.h2([h.Class(classes(styles.stepsTitle))], [copy.stepsTitle])]
      ),
      h.ol(
        [h.Class(classes(styles.steps))],
        copy.steps.map((step) =>
          h.li(
            [h.Class(classes(styles.step, stepIndent(step.number)))],
            [
              h.div([h.Class(classes(styles.stepNumber))], [step.number]),
              h.div(
                [h.Class(classes(stepBodyWidth(step.number)))],
                [
                  h.h3([h.Class(classes(styles.stepTitle))], [step.title]),
                  h.p([h.Class(classes(styles.stepBody))], [step.body]),
                  ...stepExtra(h, step.number),
                ]
              ),
            ]
          )
        )
      ),
    ]
  );

const final = (h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.Class(classes(styles.wrap, styles.final))],
    [
      h.h2([h.Class(classes(styles.finalTitle))], [copy.finalTitle]),
      ctaRow(h, true),
    ]
  );

export const view = (model: AppModel, h: HtmlBuilder<AppMessage>): Document =>
  page(
    model,
    h,
    copy.hallmarkPath,
    [
      h.div(
        [h.Class(classes(styles.page))],
        [
          hero(model, h),
          humans(h),
          agents(h),
          band(h),
          steps(h),
          h.div(
            [h.Class(classes(styles.sectionRule))],
            [testimonialsSection(model, h)]
          ),
          h.div(
            [h.Class(classes(styles.sectionRule))],
            [pricingModule(model, h)]
          ),
          final(h),
        ]
      ),
    ],
    copy.pageTitle
  );
