import * as stylex from "@stylexjs/stylex";
import type { Document, Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";
import type { AppModel } from "../../client/app/model.js";
import { siteBuilder } from "../../site-base.js";
import type { PageView } from "../page/index.js";
import { page } from "../page/index.js";
import { styles } from "./blog.stylex.js";
import type { BlogPostContent } from "./posts.js";
import {
  blogTags,
  formatDate,
  postsWithTag,
  tagHref,
  visiblePosts,
} from "./posts.js";

const blogHref = "/blog/";

const blogTitle = "The Hypertask Blog";

const blogLede =
  "Field notes on running humans and AI agents on one board — async work, agent orchestration, and getting out of project-management chaos.";

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

const card = (h: HtmlBuilder<AppMessage>, entry: BlogPostContent): Html => {
  const { post } = entry;

  return h.a(
    [h.Href(post.path), h.Class(classes(styles.cardWrap))],
    [
      ...(post.coverImage === ""
        ? [h.div([h.AriaHidden(true), h.Class(classes(styles.cardImageBlank))])]
        : [
            h.img([
              h.Src(post.coverImage),
              h.Alt(
                post.coverImageAlt === "" ? post.title : post.coverImageAlt
              ),
              h.Loading("lazy"),
              h.Decoding("async"),
              h.Class(classes(styles.cardImage)),
            ]),
          ]),
      h.div(
        [h.Class(classes(styles.cardBody))],
        [
          ...(post.cluster === ""
            ? []
            : [h.p([h.Class(classes(styles.cardCluster))], [post.cluster])]),
          h.h2([h.Class(classes(styles.cardTitle))], [post.title]),
          h.p([h.Class(classes(styles.cardDescription))], [post.description]),
          h.p([h.Class(classes(styles.cardDate))], [formatDate(post.date)]),
        ]
      ),
    ]
  );
};

const cardGrid = (
  h: HtmlBuilder<AppMessage>,
  entries: readonly BlogPostContent[]
): Html =>
  h.div(
    [h.Class(classes(styles.cardGrid))],
    entries.map((entry) => card(h, entry))
  );

const archiveHeader = (h: HtmlBuilder<AppMessage>): Html =>
  h.header(
    [h.Class(classes(styles.archiveHeader))],
    [
      h.h1([h.Class(classes(styles.archiveTitle))], [blogTitle]),
      h.p([h.Class(classes(styles.archiveLede))], [blogLede]),
    ]
  );

const tagChips = (h: HtmlBuilder<AppMessage>): Html =>
  h.div(
    [h.Class(classes(styles.tagList))],
    blogTags.map((tag) =>
      h.a([h.Href(tagHref(tag)), h.Class(classes(styles.tag))], [tag])
    )
  );

const renderIndex = (model: AppModel, h: HtmlBuilder<AppMessage>): Document =>
  page(
    model,
    h,
    blogHref,
    [
      h.div(
        [h.Class(classes(styles.archiveContainer))],
        [archiveHeader(h), tagChips(h), cardGrid(h, visiblePosts)]
      ),
    ],
    blogTitle
  );

const renderTag = (
  tag: string,
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Document => {
  const entries = postsWithTag(tag);
  const count = entries.length;

  return page(
    model,
    h,
    tagHref(tag),
    [
      h.div(
        [h.Class(classes(styles.archiveContainer))],
        [
          h.nav(
            [h.AriaLabel("Breadcrumb"), h.Class(classes(styles.breadcrumb))],
            [
              h.a(
                [h.Href("/"), h.Class(classes(styles.breadcrumbLink))],
                ["Home"]
              ),
              h.span([h.Class(classes(styles.breadcrumbSeparator))], ["/"]),
              h.a(
                [h.Href(blogHref), h.Class(classes(styles.breadcrumbLink))],
                ["Blog"]
              ),
            ]
          ),
          h.header(
            [h.Class(classes(styles.tagHeader))],
            [
              h.p([h.Class(classes(styles.tagLabel))], ["Tag"]),
              h.h1([h.Class(classes(styles.tagTitle))], [tag]),
              h.p(
                [h.Class(classes(styles.tagCount))],
                [`${count} ${count === 1 ? "post" : "posts"}`]
              ),
            ]
          ),
          cardGrid(h, entries),
        ]
      ),
    ],
    `${tag} — ${blogTitle}`
  );
};

export const blogIndexView: PageView = (model, builder) =>
  renderIndex(model, siteBuilder(builder));

export const tagView =
  (tag: string): PageView =>
  (model, builder) =>
    renderTag(tag, model, siteBuilder(builder));

export const archiveViews: ReadonlyMap<string, PageView> = new Map([
  [blogHref, blogIndexView],
  ...blogTags.map((tag) => [tagHref(tag), tagView(tag)] as const),
]);
