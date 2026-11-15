import * as stylex from "@stylexjs/stylex";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../../client/app/message.js";
import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { loginUrl } from "../frame/copy.js";
import { page } from "../page/index.js";
import * as copy from "./copy.js";
import type { PricingPlan } from "./copy.js";
import { styles } from "./pricing.stylex.js";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const pricingPath = "/pricing/";

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

export const pricingModule = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Html =>
  h.section(
    [h.Class(classes(styles.pricingModule))],
    [
      h.div(
        [h.Class(classes(styles.pricingWrap, styles.pricingHero))],
        [
          h.h1([h.Class(classes(styles.pricingTitle))], [copy.pricingTitle]),
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
  );

export const view = (model: AppModel, h: HtmlBuilder<AppMessage>): Document =>
  page(
    model,
    h,
    pricingPath,
    [h.div([h.Class(classes(styles.page))], [pricingModule(model, h)])],
    copy.pageTitle
  );
