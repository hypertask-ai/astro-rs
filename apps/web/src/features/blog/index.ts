import type {
  Alignment,
  Block,
  HeadingLevel,
  Inline,
  List,
} from "@foldkit/markdown";
import * as stylex from "@stylexjs/stylex";
import { Match, Option, Predicate } from "effect";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import type { PageView } from "../page/index.js";
import { page } from "../page/index.js";
import { styles } from "./blog.stylex.js";
import { codeHighlights } from "./code-highlights.js";
import { headingTree } from "./headings.js";
import type { TocHeading } from "./headings.js";
import type { BlogPost, BlogPostContent } from "./posts.js";
import { publishedPosts, relatedFor } from "./posts.js";

const appLoginUrl = "https://app.hypertask.ai/login";

const aboutHref = "/about/";

const blogHref = "/blog/";

const homeHref = "/";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const imageSizes = new Map<string, readonly [string, string]>([
  ["/images/blog/attribution-timeline.webp", ["1376", "768"]],
  ["/images/blog/comparison-split.webp", ["1376", "768"]],
  ["/images/blog/demo-board.webp", ["1600", "950"]],
  ["/images/blog/demo-task-comments.webp", ["1340", "790"]],
  ["/images/blog/pillar-multi-agent.webp", ["1376", "768"]],
]);

const headingStyles: Readonly<Record<HeadingLevel, stylex.StyleXStyles>> = {
  1: styles.bodyHeading1,
  2: styles.bodyHeading2,
  3: styles.bodyHeading3,
  4: styles.bodyHeading4,
  5: styles.bodyHeading4,
  6: styles.bodyHeading4,
};

const alignmentStyles: Readonly<
  Record<Alignment, stylex.StyleXStyles | false>
> = {
  Center: styles.alignCenter,
  Left: styles.alignLeft,
  None: false,
  Right: styles.alignRight,
};

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const iso = (date: string): string => `${date}T00:00:00.000Z`;

const formatDate = (date: string): string => {
  const [year = "", month = "1", day = "1"] = date.split("-");

  return `${months[Number(month) - 1] ?? ""} ${Number(day)}, ${year}`;
};

const tagSlug = (tag: string): string =>
  tag
    .toLowerCase()
    .trim()
    .replaceAll(/[^\w\s-]/gu, "")
    .replaceAll(/\s+/gu, "-");

const tagHref = (tag: string): string => `/blog/tags/${tagSlug(tag)}/`;

const initials = (name: string): string =>
  name
    .split(" ")
    .map((word) => word.slice(0, 1))
    .join("")
    .slice(0, 2);

interface Spacing {
  afterHeading: boolean;
  first: boolean;
  last: boolean;
}

interface RenderState {
  codeCount: number;
  headingIndex: number;
  headings: readonly TocHeading[];
  slug: string;
}

const spacingClasses = (
  spacing: Spacing
): readonly (false | stylex.StyleXStyles)[] => [
  spacing.first ? styles.spacingResetTop : false,
  spacing.afterHeading ? styles.spacingResetTop : false,
  spacing.last ? styles.spacingResetBottom : false,
];

const headingSpacingClasses = (
  spacing: Spacing
): readonly (false | stylex.StyleXStyles)[] => [
  spacing.last ? styles.spacingResetBottom : false,
];

const renderInline = (
  h: HtmlBuilder<AppMessage>,
  node: Inline
): Html | string =>
  Match.value(node).pipe(
    Match.withReturnType<Html | string>(),
    Match.tagsExhaustive({
      Emphasis: (emphasis) =>
        h.em(
          [],
          emphasis.content.map((child) => renderInline(h, child))
        ),
      HardBreak: () => h.br([]),
      Image: (image) => {
        const size = imageSizes.get(image.url);

        return h.img([
          h.Src(image.url),
          h.Alt(image.alt),
          h.Class(classes(styles.image)),
          ...(size === undefined ? [] : [h.Width(size[0]), h.Height(size[1])]),
          ...Option.match(image.maybeTitle, {
            onNone: () => [],
            onSome: (title) => [h.Title(title)],
          }),
        ]);
      },
      InlineCode: (code) =>
        h.code([h.Class(classes(styles.code))], [code.value]),
      Link: (link) =>
        h.a(
          [
            h.Href(link.url),
            h.Class(classes(styles.articleLink)),
            ...Option.match(link.maybeTitle, {
              onNone: () => [],
              onSome: (title) => [h.Title(title)],
            }),
          ],
          link.content.map((child) => renderInline(h, child))
        ),
      Strikethrough: (strike) =>
        h.del(
          [],
          strike.content.map((child) => renderInline(h, child))
        ),
      Strong: (strong) =>
        h.strong(
          [h.Class(classes(styles.strong))],
          strong.content.map((child) => renderInline(h, child))
        ),
      Text: (text) => text.value,
    })
  );

const renderInlines = (
  h: HtmlBuilder<AppMessage>,
  content: readonly Inline[]
): readonly (Html | string)[] => content.map((node) => renderInline(h, node));

const renderHeading = (
  h: HtmlBuilder<AppMessage>,
  state: RenderState,
  block: Extract<Block, { readonly _tag: "Heading" }>,
  spacing: Spacing
): Html => {
  const heading = state.headings[state.headingIndex];
  state.headingIndex += 1;
  const content = renderInlines(h, block.content);

  const attributes = [
    h.Id(heading?.id ?? ""),
    h.Class(
      classes(headingStyles[block.level], ...headingSpacingClasses(spacing))
    ),
  ];

  return Match.value(block.level).pipe(
    Match.withReturnType<Html>(),
    Match.when(1, () => h.h1(attributes, content)),
    Match.when(2, () => h.h2(attributes, content)),
    Match.when(3, () => h.h3(attributes, content)),
    Match.when(4, () => h.h4(attributes, content)),
    Match.when(5, () => h.h5(attributes, content)),
    Match.when(6, () => h.h6(attributes, content)),
    Match.exhaustive
  );
};

const renderTableRow = (
  h: HtmlBuilder<AppMessage>,
  row: Extract<Block, { readonly _tag: "Table" }>["headerRow"],
  isHeader: boolean,
  isLast: boolean,
  alignments: readonly Alignment[]
): Html => {
  const cells = row.cells.map((cell, columnIndex) => {
    const alignment = alignments[columnIndex] ?? "None";

    const attributes = [
      h.Class(
        classes(
          isHeader ? styles.tableHeaderCell : styles.tableCell,
          columnIndex === 0 ? styles.tableCellFirst : false,
          columnIndex === row.cells.length - 1 ? styles.tableCellLast : false,
          alignmentStyles[alignment]
        )
      ),
    ];

    const content = renderInlines(h, cell.content);

    return isHeader ? h.th(attributes, content) : h.td(attributes, content);
  });

  if (isHeader) {
    return h.thead([h.Class(classes(styles.tableHead))], [h.tr([], cells)]);
  }

  return h.tr(
    [
      h.Class(
        classes(styles.tableBodyRow, isLast ? styles.tableBodyRowLast : false)
      ),
    ],
    cells
  );
};

const renderBlocks = (
  h: HtmlBuilder<AppMessage>,
  state: RenderState,
  blocks: readonly Block[],
  nested = false,
  quoted = false
): readonly Html[] => {
  const renderListItem = (
    item: Extract<Block, { readonly _tag: "List" }>["items"][number]
  ): Html => {
    const [only] = item.blocks;

    if (
      item.blocks.length === 1 &&
      only !== undefined &&
      Predicate.isTagged(only, "Paragraph")
    ) {
      return h.li(
        [h.Class(classes(styles.listItem))],
        renderInlines(h, only.content)
      );
    }

    return h.li(
      [h.Class(classes(styles.listItem))],
      renderBlocks(h, state, item.blocks)
    );
  };

  const renderList = (list: List, spacing: Spacing): Html => {
    const items = list.items.map((item) => renderListItem(item));

    const attributes = [
      h.Class(
        classes(
          styles.list,
          list.isOrdered ? styles.listOrdered : styles.listUnordered,
          ...spacingClasses(spacing)
        )
      ),
      ...Option.match(list.maybeStartNumber, {
        onNone: () => [],
        onSome: (start) => [h.Start(start)],
      }),
    ];

    return list.isOrdered ? h.ol(attributes, items) : h.ul(attributes, items);
  };

  const renderBlock = (block: Block, spacing: Spacing): Html =>
    Match.value(block).pipe(
      Match.withReturnType<Html>(),
      Match.tagsExhaustive({
        Blockquote: (blockquote) =>
          h.blockquote(
            [h.Class(classes(styles.blockquote, ...spacingClasses(spacing)))],
            renderBlocks(h, state, blockquote.blocks, true, true)
          ),
        CodeBlock: (codeBlock) => {
          const key = `${state.slug}/${state.codeCount}`;
          state.codeCount += 1;
          const highlighted = codeHighlights[key];

          const language = Option.getOrElse(
            codeBlock.maybeLanguage,
            () => "text"
          );

          return h.pre(
            [
              h.Class(classes(styles.codeBlock, ...spacingClasses(spacing))),
              h.Tabindex(0),
              h.Role("region"),
              h.AriaLabel(`${language} code example`),
              h.DataAttribute("language", language),
            ],
            [
              highlighted === undefined
                ? h.code(
                    [h.Class(classes(styles.codeBlockCode))],
                    [codeBlock.value]
                  )
                : h.code([
                    h.Class(classes(styles.codeBlockCode)),
                    h.InnerHTML(highlighted),
                  ]),
            ]
          );
        },
        Heading: (heading) => renderHeading(h, state, heading, spacing),
        Island: (island) =>
          h.div([], renderBlocks(h, state, island.blocks, true)),
        List: (list) => renderList(list, spacing),
        Paragraph: (paragraph) =>
          h.p(
            [
              h.Class(
                classes(
                  styles.paragraph,
                  ...spacingClasses(spacing),
                  quoted ? styles.blockquoteQuotes : false
                )
              ),
            ],
            renderInlines(h, paragraph.content)
          ),
        Table: (table) => {
          const bodyRows = table.bodyRows.map((row, index) =>
            renderTableRow(
              h,
              row,
              false,
              index === table.bodyRows.length - 1,
              table.alignments
            )
          );

          return h.table(
            [h.Class(classes(styles.table, ...spacingClasses(spacing)))],
            [
              renderTableRow(h, table.headerRow, true, false, table.alignments),
              h.tbody([], bodyRows),
            ]
          );
        },
        ThematicBreak: () =>
          h.hr([
            h.Class(classes(styles.thematicBreak, ...spacingClasses(spacing))),
          ]),
      })
    );

  const rendered: Html[] = [];
  let previous: Block | undefined;

  for (const [index, block] of blocks.entries()) {
    const spacing: Spacing = {
      afterHeading:
        previous !== undefined &&
        (Predicate.isTagged(previous, "ThematicBreak") ||
          (Predicate.isTagged(previous, "Heading") &&
            previous.level <= 4 &&
            previous.level >= 2)),
      first: !nested && index === 0,
      last: !nested && index === blocks.length - 1,
    };

    rendered.push(renderBlock(block, spacing));
    previous = block;
  }

  return rendered;
};

const breadcrumb = (h: HtmlBuilder<AppMessage>): Html =>
  h.nav(
    [h.AriaLabel("Breadcrumb"), h.Class(classes(styles.breadcrumb))],
    [
      h.a(
        [h.Href(homeHref), h.Class(classes(styles.breadcrumbLink))],
        ["Home"]
      ),
      h.span([h.Class(classes(styles.breadcrumbSeparator))], ["/"]),
      h.a(
        [h.Href(blogHref), h.Class(classes(styles.breadcrumbLink))],
        ["Blog"]
      ),
    ]
  );

const cover = (h: HtmlBuilder<AppMessage>, post: BlogPost): Html | null => {
  if (post.coverImage === "") {
    return null;
  }

  return h.div(
    [h.Class(classes(styles.coverWrap))],
    [
      h.img([
        h.Src(post.coverImage),
        h.Alt(post.coverImageAlt === "" ? post.title : post.coverImageAlt),
        h.Width("1376"),
        h.Height("768"),
        h.Loading("eager"),
        h.Fetchpriority("high"),
        h.Decoding("async"),
        h.Class(classes(styles.coverImage)),
      ]),
    ]
  );
};

const postHeader = (h: HtmlBuilder<AppMessage>, post: BlogPost): Html => {
  const dot = (): Html => h.span([h.Class(classes(styles.metaDot))]);

  return h.header(
    [h.Class(classes(styles.header))],
    [
      ...(post.cluster === ""
        ? []
        : [h.p([h.Class(classes(styles.cluster))], [post.cluster])]),
      h.h1([h.Class(classes(styles.title))], [post.title]),
      h.p([h.Class(classes(styles.lede))], [post.description]),
      h.div(
        [h.Class(classes(styles.meta))],
        [
          h.span([], [post.author]),
          dot(),
          h.time([h.Datetime(iso(post.date))], [formatDate(post.date)]),
          ...(post.lastUpdated === undefined
            ? []
            : [dot(), h.span([], [`Updated ${formatDate(post.lastUpdated)}`])]),
        ]
      ),
    ]
  );
};

const toc = (
  h: HtmlBuilder<AppMessage>,
  headings: readonly TocHeading[]
): Html => {
  const entries = headings.filter(
    (heading) => heading.level === 2 || heading.level === 3
  );

  return h.aside(
    [h.Class(classes(styles.aside))],
    entries.length === 0
      ? undefined
      : [
          h.div(
            [h.Class(classes(styles.tocSticky))],
            [
              h.p([h.Class(classes(styles.tocLabel))], ["On this page"]),
              h.ul(
                [h.Class(classes(styles.tocList))],
                entries.map((heading, index) =>
                  h.keyed("li")(
                    heading.id,
                    [
                      h.Class(
                        classes(
                          styles.tocItem,
                          index === 0 ? styles.tocItemFirst : false,
                          heading.level === 3 ? styles.tocItemNested : false
                        )
                      ),
                    ],
                    [
                      h.a(
                        [
                          h.Href(`#${heading.id}`),
                          h.Class(classes(styles.tocLink)),
                        ],
                        [heading.text]
                      ),
                    ]
                  )
                )
              ),
            ]
          ),
        ]
  );
};

const tags = (h: HtmlBuilder<AppMessage>, post: BlogPost): Html | null => {
  if (post.tags.length === 0) {
    return null;
  }

  return h.div(
    [h.Class(classes(styles.tags))],
    post.tags.map((tag) =>
      h.a([h.Href(tagHref(tag)), h.Class(classes(styles.tag))], [tag])
    )
  );
};

const authorBox = (h: HtmlBuilder<AppMessage>, post: BlogPost): Html =>
  h.div(
    [h.Class(classes(styles.authorWrap))],
    [
      h.div(
        [h.Class(classes(styles.authorBox))],
        [
          h.div(
            [h.Class(classes(styles.authorAvatar))],
            [initials(post.author)]
          ),
          h.div(
            [],
            [
              h.p(
                [h.Class(classes(styles.authorName))],
                [
                  h.a(
                    [
                      h.Href(aboutHref),
                      h.Class(classes(styles.authorNameLink)),
                    ],
                    [post.author]
                  ),
                ]
              ),
              h.p(
                [h.Class(classes(styles.authorRole))],
                ["Founder, Hypertask"]
              ),
              h.p(
                [h.Class(classes(styles.authorBio))],
                [
                  "Building Hypertask, the project board where humans and AI agents share one workspace. Writes about agent-driven, async project management from running it daily.",
                ]
              ),
            ]
          ),
        ]
      ),
    ]
  );

const callToAction = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.ctaWrap))],
    [
      h.div(
        [h.Class(classes(styles.ctaBox))],
        [
          h.p(
            [h.Class(classes(styles.ctaTitle))],
            ["Run humans and AI agents on one board"]
          ),
          h.p(
            [h.Class(classes(styles.ctaLede))],
            [
              "Hypertask is project management built for the way teams work now — keyboard-first, async, agent-ready.",
            ]
          ),
          h.a(
            [
              h.Href(appLoginUrl),
              h.Target("_blank"),
              h.Rel("noopener noreferrer"),
              h.Class(classes(styles.ctaButton)),
            ],
            ["Start free"]
          ),
        ]
      ),
    ]
  );

const relatedPosts = (
  h: HtmlBuilder<AppMessage>,
  entry: BlogPostContent
): Html | null => {
  const related = relatedFor(entry);

  if (related.length === 0) {
    return null;
  }

  return h.div(
    [h.Class(classes(styles.relatedWrap))],
    [
      h.h2([h.Class(classes(styles.relatedHeading))], ["Keep reading"]),
      h.div(
        [h.Class(classes(styles.relatedGrid))],
        related.map((candidate) =>
          h.a(
            [h.Href(candidate.post.path), h.Class(classes(styles.relatedCard))],
            [
              ...(candidate.post.cluster === ""
                ? []
                : [
                    h.p(
                      [h.Class(classes(styles.relatedCluster))],
                      [candidate.post.cluster]
                    ),
                  ]),
              h.p(
                [h.Class(classes(styles.relatedTitle))],
                [candidate.post.title]
              ),
              h.p(
                [h.Class(classes(styles.relatedDescription))],
                [candidate.post.description]
              ),
            ]
          )
        )
      ),
    ]
  );
};

const renderPost = (
  entry: BlogPostContent,
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Document => {
  const { post } = entry;

  const state: RenderState = {
    codeCount: 0,
    headingIndex: 0,
    headings: headingTree(entry.document.blocks),
    slug: post.slug,
  };

  const content = h.div(
    [h.Class(classes(styles.container))],
    [
      breadcrumb(h),
      postHeader(h, post),
      cover(h, post),
      h.div(
        [h.Class(classes(styles.grid))],
        [
          toc(h, state.headings),
          h.article(
            [h.Class(classes(styles.article))],
            renderBlocks(h, state, entry.document.blocks)
          ),
          h.div([h.Class(classes(styles.gridSpacer))]),
        ]
      ),
      tags(h, post),
      authorBox(h, post),
      callToAction(h),
      relatedPosts(h, entry),
    ]
  );

  return page(model, h, post.path, [content], post.title);
};

export const postView =
  (entry: BlogPostContent): PageView =>
  (model, h) =>
    renderPost(entry, model, h);

export const postViews: ReadonlyMap<string, PageView> = new Map(
  publishedPosts.map((entry) => [entry.post.path, postView(entry)] as const)
);
