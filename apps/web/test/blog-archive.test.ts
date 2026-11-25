import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";
import { afterAll, beforeAll, vi } from "vitest";

import { factsOf } from "./blog-page.js";

const basePath = "/ratstack";

const blogAddress = "/blog/";

const blogTitle =
  "The Hypertask Blog — AI Agents, Async Work & Project Management";

const homeTitle = "The fastest project board — Hypertask";

const tagAddress = "/blog/tags/ai-agents/";

const tagTitle = "ai-agents — The Hypertask Blog";

const assets = {
  entryScript: `${basePath}/assets/entry.js`,
  modulePreloads: [],
  stylesheets: [`${basePath}/assets/entry.css`],
};

beforeAll(() => {
  vi.stubEnv("BASE_URL", `${basePath}/`);
  vi.resetModules();
});

afterAll(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

const renderAddress = (address: string) =>
  Effect.gen(function* renderArchivePage() {
    const { initialModel } = yield* Effect.promise(
      () => import("../src/client/app/model.js")
    );
    const { renderDocument } = yield* Effect.promise(
      () => import("../src/entry.server.js")
    );
    const { viewForPath } = yield* Effect.promise(
      () => import("../src/routes.js")
    );
    const view = yield* Effect.fromNullishOr(viewForPath(address));
    const application = yield* renderToString(
      { init: () => ({ model: initialModel }), view },
      { isHydratable: false }
    );

    return factsOf(renderDocument(application, assets));
  });

describe("blog archive routes", () => {
  it.effect("builds the blog index under the preview mount", () =>
    Effect.gen(function* checkIndex() {
      const { prerenderPaths } = yield* Effect.promise(
        () => import("../src/entry.server.js")
      );

      expect(prerenderPaths).toContain(blogAddress);

      const facts = yield* renderAddress(blogAddress);

      expect(facts.head.title).toBe(blogTitle);
      expect(facts.head.title).not.toBe(homeTitle);
      expect(facts.head.canonical).toBe("https://hypertask.ai/blog/");
      expect(facts.headings[0]).toEqual({
        id: "",
        level: 1,
        text: "The Hypertask Blog",
      });
    })
  );

  it.effect("builds a tag page under the preview mount", () =>
    Effect.gen(function* checkTag() {
      const { prerenderPaths } = yield* Effect.promise(
        () => import("../src/entry.server.js")
      );

      expect(prerenderPaths).toContain(tagAddress);

      const facts = yield* renderAddress(tagAddress);

      expect(facts.head.title).toBe(tagTitle);
      expect(facts.head.title).not.toBe(homeTitle);
      expect(facts.head.canonical).toBe(
        "https://hypertask.ai/blog/tags/ai-agents/"
      );
      expect(facts.headings[0]).toEqual({
        id: "",
        level: 1,
        text: "ai-agents",
      });
    })
  );

  it.effect("links the blog index to every tag and post page", () =>
    Effect.gen(function* checkIndexLinks() {
      const { blogTags, tagSlug, visiblePosts } = yield* Effect.promise(
        () => import("../src/features/blog/posts.js")
      );
      const facts = yield* renderAddress(blogAddress);

      for (const tag of blogTags) {
        expect(facts.links).toContain(`${basePath}/blog/tags/${tagSlug(tag)}/`);
      }

      for (const entry of visiblePosts) {
        expect(facts.links).toContain(`${basePath}${entry.post.path}`);
      }
    })
  );

  it.effect("builds one page per published tag", () =>
    Effect.gen(function* checkTagPages() {
      const { blogTags, tagSlug } = yield* Effect.promise(
        () => import("../src/features/blog/posts.js")
      );
      const { viewForPath } = yield* Effect.promise(
        () => import("../src/routes.js")
      );

      for (const tag of blogTags) {
        expect(viewForPath(`/blog/tags/${tagSlug(tag)}/`)).toBeDefined();
      }

      expect(viewForPath("/blog/tags/not-a-tag/")).toBeUndefined();
    })
  );
});
