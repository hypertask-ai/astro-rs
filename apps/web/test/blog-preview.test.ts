import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";
import { afterAll, beforeAll, vi } from "vitest";

import { initialModel } from "../src/client/app/model.js";
import { escapingUrls } from "../src/site-base-path.js";
import type { BlogFacts } from "./blog-page.js";
import { factsOf } from "./blog-page.js";

const basePath = "/ratstack";

const assets = {
  entryScript: "/ratstack/assets/entry.js",
  modulePreloads: [],
  stylesheets: ["/ratstack/assets/entry.css"],
};

const fixtures = import.meta.glob<BlogFacts>("./fixtures/blog/*.json", {
  eager: true,
  import: "default",
});

beforeAll(() => {
  vi.stubEnv("BASE_URL", `${basePath}/`);
  vi.resetModules();
});

afterAll(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("preview URL ownership", () => {
  it.effect(
    "mounts this origin without capturing other origins or fragments",
    () =>
      Effect.gen(function* checkOrigins() {
        const { sitePath } = yield* Effect.promise(
          () => import("../src/site-base.js")
        );

        const targets = [
          ["https://hypertask.ai", "/ratstack/"],
          [
            "https://hypertask.ai/pricing/?plan=ai#seats",
            "/ratstack/pricing/?plan=ai#seats",
          ],
          ["https://hypertask.ai:443/about/", "/ratstack/about/"],
          ["https://hypertask.ai/ratstack/about/", "/ratstack/about/"],
          ["//hypertask.ai/about/", "/ratstack/about/"],
          ["https://app.hypertask.ai/login", "https://app.hypertask.ai/login"],
          ["https://docs.hypertask.ai/", "https://docs.hypertask.ai/"],
          [
            "https://hypertask.ai.example/about/",
            "https://hypertask.ai.example/about/",
          ],
          [
            "https://hypertask.ai@example.com/",
            "https://hypertask.ai@example.com/",
          ],
          [
            "https://hypertask.ai:8443/about/",
            "https://hypertask.ai:8443/about/",
          ],
          ["//cdn.example.com/image.png", "//cdn.example.com/image.png"],
          ["#heading", "#heading"],
          ["mailto:support@hypertask.ai", "mailto:support@hypertask.ai"],
          ["https://[", "https://["],
        ] as const;

        for (const [target, expected] of targets) {
          expect(sitePath(target)).toBe(expected);
        }
      })
  );
});

for (const fixture of Object.values(fixtures)) {
  describe(fixture.address, () => {
    it.effect("keeps its links and images inside the preview mount", () =>
      Effect.gen(function* checkPreview() {
        const { postViews } = yield* Effect.promise(
          () => import("../src/features/blog/index.js")
        );

        const { renderDocument } = yield* Effect.promise(
          () => import("../src/entry.server.js")
        );

        const view = yield* Effect.fromNullishOr(
          postViews.get(fixture.address)
        );

        const application = yield* renderToString(
          { init: () => ({ model: initialModel }), view },
          { isHydratable: false }
        );

        const html = renderDocument(application, assets);
        const facts = factsOf(html);

        expect(escapingUrls(basePath, "index.html", html)).toEqual([]);
        expect(facts.links).toEqual(
          fixture.links.map((link) => {
            const target = new URL(link, fixture.source.url);

            return link.startsWith("#") ||
              target.origin !== "https://hypertask.ai"
              ? link
              : `${basePath}${target.pathname}${target.search}${target.hash}`;
          })
        );
        expect(facts.images).toEqual(
          fixture.images.map((image) => ({
            ...image,
            src: `${basePath}${image.src}`,
          }))
        );
        expect(facts.head.canonical).toBe(fixture.head.canonical);
        expect(facts.visibleText).toEqual(fixture.visibleText);
      })
    );
  });
}
