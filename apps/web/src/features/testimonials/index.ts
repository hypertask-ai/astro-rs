import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import { Message } from "../../client/app/message.js";
import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import * as copy from "./copy.js";
import type { Testimonial } from "./copy.js";
import { styles } from "./testimonials.stylex.js";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const starPath =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const stars = (h: HtmlBuilder<AppMessage>, rating: number): Html =>
  h.div(
    [h.Class(classes(styles.stars))],
    [1, 2, 3, 4, 5].map((position) =>
      h.svg(
        [h.Class(classes(styles.star)), h.ViewBox("0 0 24 24")],
        [
          h.path([
            h.D(starPath),
            h.Fill(position <= rating ? "currentColor" : "none"),
          ]),
        ]
      )
    )
  );

const card = (
  h: HtmlBuilder<AppMessage>,
  testimonial: Testimonial,
  hallmark: boolean
): Html =>
  h.div(
    [h.Class(classes(styles.card, stylex.defaultMarker()))],
    [
      h.div([h.AriaHidden(true), h.Class(classes(styles.cardGlow))]),
      h.div([h.AriaHidden(true), h.Class(classes(styles.cardOverlay))]),
      h.div(
        [h.Class(classes(styles.cardContent))],
        [
          h.div(
            [h.Class(classes(styles.cardQuoteWrap))],
            [
              h.h4(
                [
                  h.Class(
                    classes(
                      styles.cardQuote,
                      hallmark && styles.hallmarkCardQuote
                    )
                  ),
                ],
                [`“${copy.displayedQuote(testimonial)}”`]
              ),
            ]
          ),
          h.p(
            [
              h.Class(
                classes(styles.cardText, hallmark && styles.hallmarkCardText)
              ),
            ],
            [testimonial.text]
          ),
          h.div(
            [h.Class(classes(styles.cardFooter))],
            [
              h.img([
                h.Src(testimonial.image),
                h.Alt(testimonial.name),
                h.Width("50"),
                h.Height("50"),
                h.Loading("lazy"),
                h.Class(classes(styles.avatar)),
              ]),
              h.div(
                [h.Class(classes(styles.nameBlock))],
                [
                  h.div(
                    [h.Class(classes(styles.nameRow))],
                    [
                      h.p(
                        [h.Class(classes(styles.nameLine))],
                        [
                          h.span(
                            [
                              h.Class(
                                classes(
                                  styles.name,
                                  hallmark && styles.hallmarkName
                                )
                              ),
                            ],
                            [testimonial.name]
                          ),
                          h.span(
                            [
                              h.Class(
                                classes(
                                  styles.role,
                                  hallmark && styles.hallmarkRole
                                )
                              ),
                            ],
                            [testimonial.title]
                          ),
                        ]
                      ),
                      stars(h, testimonial.rating),
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

const staggered = (offset: number): readonly Testimonial[] => {
  const ordered = [
    ...copy.testimonials.slice(offset),
    ...copy.testimonials.slice(0, offset),
  ];

  return [...ordered, ...ordered, ...ordered];
};

const column = (
  h: HtmlBuilder<AppMessage>,
  offset: number,
  direction: "up" | "down",
  hallmark: boolean
): Html =>
  h.div(
    [h.Class(classes(styles.column, stylex.defaultMarker()))],
    [
      h.div(
        [
          h.Class(
            classes(
              styles.columnTrack,
              direction === "up" ? styles.columnTrackUp : styles.columnTrackDown
            )
          ),
        ],
        staggered(offset).map((testimonial) => card(h, testimonial, hallmark))
      ),
    ]
  );

const columns = (
  h: HtmlBuilder<AppMessage>,
  offsets: readonly number[],
  frame: "desktop" | "tablet",
  hallmark: boolean
): Html =>
  h.div(
    [
      h.Class(
        classes(
          frame === "desktop" ? styles.columnsDesktop : styles.columnsTablet
        )
      ),
    ],
    [
      h.div(
        [
          h.Class(
            classes(
              styles.grid,
              frame === "desktop" ? styles.gridDesktop : styles.gridTablet
            )
          ),
        ],
        offsets.map((offset, index) =>
          column(h, offset, index % 2 === 0 ? "up" : "down", hallmark)
        )
      ),
    ]
  );

const carousel = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [
      h.Class(classes(styles.carousel)),
      h.Role("region"),
      h.AriaRoleDescription("carousel"),
      h.AriaLabel(copy.sectionTitle),
    ],
    [
      h.div(
        [h.Class(classes(styles.carouselFrame))],
        [
          h.div(
            [
              h.Id(copy.testimonialsViewportId),
              h.Role("group"),
              h.AriaLabel("Slides"),
              h.Class(classes(styles.carouselViewport)),
            ],
            [
              h.div(
                [h.Class(classes(styles.carouselContainer))],
                copy.testimonials
                  .slice(0, copy.mobileTestimonialCount)
                  .map((testimonial, position) =>
                    h.div(
                      [
                        h.Role("group"),
                        h.AriaRoleDescription("slide"),
                        h.AriaLabel(
                          `${position + 1} of ${copy.mobileTestimonialCount}`
                        ),
                        h.Class(classes(styles.slide)),
                      ],
                      [
                        h.div(
                          [h.Class(classes(styles.slideContent))],
                          [card(h, testimonial, false)]
                        ),
                      ]
                    )
                  )
              ),
            ]
          ),
          h.div(
            [h.Class(classes(styles.dots))],
            [
              h.div(
                [h.Class(classes(styles.carouselDots))],
                Array.from(
                  { length: copy.mobileTestimonialCount },
                  (_unused, index) => index
                ).map((index) =>
                  h.button([
                    h.Type("button"),
                    h.AriaLabel(`Go to slide ${index + 1}`),
                    h.Class(
                      classes(
                        styles.dot,
                        model.testimonialSlide === index && styles.dotSelected
                      )
                    ),
                    h.OnClick(Message.PressedTestimonialDot({ index })),
                  ])
                )
              ),
            ]
          ),
        ]
      ),
    ]
  );

const stackedCards = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [
      h.Class(classes(styles.carousel)),
      h.Role("region"),
      h.AriaLabel(copy.sectionTitle),
    ],
    [
      h.div(
        [],
        copy.testimonials
          .slice(0, copy.mobileTestimonialCount)
          .map((testimonial) => card(h, testimonial, true))
      ),
      h.div([h.Class(classes(styles.dots))]),
    ]
  );

export const testimonialsSection = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>,
  presentation: "carousel" | "hallmark" = "carousel"
): Html =>
  h.div(
    [h.Class(classes(styles.section))],
    [
      h.h2(
        [
          h.Class(
            classes(
              styles.title,
              presentation === "hallmark" && styles.hallmarkTitle
            )
          ),
        ],
        [copy.sectionTitle]
      ),
      h.p(
        [
          h.Class(
            classes(
              styles.lede,
              presentation === "hallmark" && styles.hallmarkLede
            )
          ),
        ],
        [copy.sectionLede]
      ),
      columns(h, copy.columnOffsets, "desktop", presentation === "hallmark"),
      columns(
        h,
        copy.tabletColumnOffsets,
        "tablet",
        presentation === "hallmark"
      ),
      presentation === "hallmark" ? stackedCards(h) : carousel(model, h),
    ]
  );
