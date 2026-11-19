import * as stylex from "@stylexjs/stylex";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../../client/app/message.js";
import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { consentBanner } from "../consent/index.js";
import { loginUrl } from "../frame/copy.js";
import { frame } from "../frame/index.js";
import { canonicalFor, pageHeads } from "../head/index.js";
import * as copy from "./copy.js";
import type { PricingPlan } from "./copy.js";
import { styles } from "./home.stylex.js";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const homePath = "/";

const hero = (h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.Class(classes(styles.wrap, styles.hero))],
    [
      h.img([
        h.Src(copy.heroMark.src),
        h.Alt(""),
        h.Width(copy.heroMark.width),
        h.Height(copy.heroMark.height),
        h.Class(classes(styles.heroMark)),
      ]),
      h.h1(
        [h.Class(classes(styles.display, styles.heroTitle))],
        [copy.heroTitle]
      ),
      h.p([h.Class(classes(styles.lede))], [copy.heroLede]),
      h.div(
        [h.Class(classes(styles.ctaRow))],
        [
          h.a(
            [h.Href(loginUrl), h.Class(classes(styles.cta, styles.ctaPrimary))],
            [copy.heroCtaLabel]
          ),
          h.a(
            [
              h.Href(copy.demoUrl),
              h.Class(classes(styles.cta, styles.ctaGhost)),
            ],
            [copy.demoLabel]
          ),
        ]
      ),
      h.figure(
        [h.Class(classes(styles.shot))],
        [
          h.img([
            h.Src(copy.heroImage.src),
            h.Alt(copy.heroImage.alt),
            h.Width(copy.heroImage.width),
            h.Height(copy.heroImage.height),
            h.Fetchpriority("high"),
            h.Class(classes(styles.shotImage)),
          ]),
        ]
      ),
    ]
  );

const agentLogo = (
  h: HtmlBuilder<AppMessage>,
  agent: Readonly<{ id: string; label: string }>
): Html =>
  h.div(
    [h.Class(classes(styles.logo))],
    [
      h.img([
        h.Src(`/images/agents/${agent.id}.svg`),
        h.Alt(""),
        h.Width(copy.agentLogoSize),
        h.Height(copy.agentLogoSize),
        h.Loading("lazy"),
        h.Class(classes(styles.logoImage)),
      ]),
      h.span([], [agent.label]),
    ]
  );

const installTab = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>,
  tab: copy.InstallTabContents
): Html => {
  const selected = tab.id === model.installTab;

  return h.button(
    [
      h.Type("button"),
      h.Role("tab"),
      h.AriaSelected(selected),
      h.Class(classes(styles.tab, selected && styles.tabSelected)),
      h.OnClick(Message.SelectedInstallTab({ tab: tab.id })),
    ],
    [
      ...(tab.prefix === ""
        ? []
        : [h.span([h.Class(classes(styles.tabPrefix))], [tab.prefix])]),
      tab.label,
    ]
  );
};

const install = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [],
    [
      h.div(
        [h.Role("tablist"), h.Class(classes(styles.tabs))],
        copy.installTabs.map((tab) => installTab(model, h, tab))
      ),
      h.div(
        [h.Class(classes(styles.field))],
        [
          h.code(
            [h.Class(classes(styles.command))],
            [copy.installCommandFor(model.installTab)]
          ),
          h.button(
            [
              h.Type("button"),
              h.Class(classes(styles.copyButton)),
              h.OnClick(Message.PressedCopyInstallCommand()),
            ],
            [model.copyLabel]
          ),
        ]
      ),
      h.p([h.Class(classes(styles.installNote))], [copy.installNote]),
    ]
  );

const byoa = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.section(
    [h.Class(classes(styles.wrap, styles.byoa))],
    [
      h.div(
        [],
        [
          h.h2(
            [h.Class(classes(styles.display, styles.byoaTitle))],
            [copy.byoaTitle]
          ),
          h.p([h.Class(classes(styles.byoaLede))], [copy.byoaLede]),
          h.div(
            [h.Class(classes(styles.logos))],
            copy.agents.map((agent) => agentLogo(h, agent))
          ),
        ]
      ),
      h.div(
        [h.Class(classes(styles.panel))],
        [
          h.p([h.Class(classes(styles.panelTitle))], [copy.panelTitle]),
          install(model, h),
        ]
      ),
    ]
  );

const billingPeriod = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): readonly Html[] => [
  ...copy.billingPeriods.map((period) => {
    const selected = model.billingPeriod === period;

    return h.button(
      [
        h.Type("button"),
        h.AriaPressed(selected ? "true" : "false"),
        h.Class(
          classes(styles.toggleButton, selected && styles.toggleButtonSelected)
        ),
        h.OnClick(Message.SelectedBillingPeriod({ period })),
      ],
      [copy.billingLabels[period]]
    );
  }),
  h.span([h.Class(classes(styles.discount))], [copy.discountLabel]),
];

const plan = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>,
  contents: PricingPlan
): Html =>
  h.div(
    [h.Class(classes(styles.plan, contents.featured && styles.planFeatured))],
    [
      ...(contents.tag === undefined
        ? []
        : [h.span([h.Class(classes(styles.planTag))], [contents.tag])]),
      h.p([h.Class(classes(styles.planName))], [contents.name]),
      h.div(
        [h.Class(classes(styles.planPrice))],
        [contents.price[model.billingPeriod]]
      ),
      h.p([h.Class(classes(styles.planUnit))], [contents.unit]),
      h.p(
        [h.Class(classes(styles.planNote))],
        [contents.note[model.billingPeriod]]
      ),
      h.ul(
        [h.Class(classes(styles.planFeatures))],
        contents.features.map((feature) =>
          h.li([h.Class(classes(styles.planFeature))], [feature])
        )
      ),
      h.a(
        [
          ...(contents.ctaId === undefined ? [] : [h.Id(contents.ctaId)]),
          h.Href(loginUrl),
          h.Class(
            classes(
              styles.planCta,
              contents.featured
                ? styles.planCtaPrimary
                : styles.planCtaSecondary
            )
          ),
        ],
        [contents.cta]
      ),
    ]
  );

const pricing = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.pricing))],
    [
      h.section(
        [h.Class(classes(styles.pricingModule))],
        [
          h.div(
            [h.Class(classes(styles.pricingWrap, styles.pricingHero))],
            [
              h.h1(
                [h.Class(classes(styles.pricingTitle))],
                [copy.pricingTitle]
              ),
              h.div(
                [
                  h.Role("group"),
                  h.AriaLabel(copy.billingGroupLabel),
                  h.Class(classes(styles.toggle)),
                ],
                billingPeriod(model, h)
              ),
            ]
          ),
          h.div(
            [h.Class(classes(styles.pricingWrap, styles.plansWrap))],
            [
              h.div(
                [h.Class(classes(styles.plans))],
                copy.pricingPlans.map((contents) => plan(model, h, contents))
              ),
            ]
          ),
        ]
      ),
    ]
  );

export const view = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Document => ({
  body: h.div(
    [],
    [
      frame(model, h, "home", [
        h.div(
          [h.Class(classes(styles.page))],
          [hero(h), byoa(model, h), pricing(model, h)]
        ),
      ]),
      consentBanner(model, h),
    ]
  ),
  canonical: canonicalFor(homePath),
  ogUrl: canonicalFor(homePath),
  title: pageHeads.get(homePath)?.title ?? copy.pageTitle,
});
