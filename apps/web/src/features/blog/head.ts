import type { JsonLd, JsonValue, PageHead } from "../head/build-head.js";
import { siteOrigin } from "../head/build-head.js";
import { faqsFrom } from "./faqs.js";
import type { BlogPost, BlogPostContent } from "./posts.js";
import { publishedPosts } from "./posts.js";

const authorUrl = "https://hypertask.ai/about/";

const iso = (date: string): string => `${date}T00:00:00.000Z`;

const absolute = (url: string): string => new URL(url, siteOrigin).href;

const sourceQuotes = (value: string): string =>
  value.replaceAll(/[\u2018\u2019]/gu, "'").replaceAll(/[\u201C\u201D]/gu, '"');

const articleSchema = (post: BlogPost): JsonLd => ({
  "@type": "BlogPosting",
  author: { "@type": "Person", name: post.author, url: authorUrl },
  dateModified: iso(post.lastUpdated ?? post.date),
  datePublished: iso(post.date),
  description: post.description,
  headline: post.title,
  image: absolute(post.coverImage),
  keywords: post.tags.join(", "),
  mainEntityOfPage: { "@id": absolute(post.path), "@type": "WebPage" },
  publisher: { "@id": `${siteOrigin}/#organization` },
});

const breadcrumbSchema = (post: BlogPost): JsonLd => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", item: `${siteOrigin}/`, name: "Home", position: 1 },
    {
      "@type": "ListItem",
      item: `${siteOrigin}/blog/`,
      name: "Blog",
      position: 2,
    },
    {
      "@type": "ListItem",
      item: absolute(post.path),
      name: post.title,
      position: 3,
    },
  ],
});

export const postHead = (entry: BlogPostContent): PageHead => {
  const { post } = entry;
  const graph: JsonValue[] = [articleSchema(post), breadcrumbSchema(post)];
  const faqs = faqsFrom(entry.document);

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        acceptedAnswer: {
          "@type": "Answer",
          text: sourceQuotes(faq.answer),
        },
        name: sourceQuotes(faq.question),
      })),
    });
  }

  return {
    article: {
      author: authorUrl,
      modified: iso(post.lastUpdated ?? post.date),
      published: iso(post.date),
      section: post.cluster,
    },
    description: post.description,
    extraStructuredData: [
      { "@context": "https://schema.org", "@graph": graph },
    ],
    image: {
      alt: post.coverImageAlt === "" ? post.title : post.coverImageAlt,
      url: absolute(post.ogImage ?? post.coverImage),
    },
    ogType: "article",
    title: `${post.title} — Hypertask Blog`,
  };
};

export const postHeads: ReadonlyMap<string, PageHead> = new Map(
  publishedPosts.map((entry) => [entry.post.path, postHead(entry)] as const)
);
