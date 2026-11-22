import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";
import { afterAll, beforeAll, vi } from "vitest";

import { initialModel } from "../src/client/app/model.js";
import { addSiteBasePath, escapingUrls } from "../src/site-base-path.js";
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
        const view = postViews.get(fixture.address);

        if (view === undefined) {
          return yield* Effect.die(
            new Error(`No blog view for ${fixture.address}`)
          );
        }

        const application = yield* renderToString(
          { init: () => ({ model: initialModel }), view },
          { isHydratable: false }
        );
        const html = renderDocument(application, assets);
        const facts = factsOf(html);

        expect(escapingUrls(basePath, "index.html", html)).toEqual([]);
        expect(facts.links).toEqual(
          fixture.links.map((link) => addSiteBasePath(basePath, link))
        );
        expect(facts.images).toEqual(
          fixture.images.map((image) => ({
            ...image,
            src: addSiteBasePath(basePath, image.src),
          }))
        );
        expect(facts.head.canonical).toBe(fixture.head.canonical);
        expect(facts.visibleText).toEqual(fixture.visibleText);
      })
    );
  });
}
