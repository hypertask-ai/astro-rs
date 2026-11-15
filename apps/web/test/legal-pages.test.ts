import { describe, expect, it } from "@effect/vitest";
import { Effect, Predicate } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import { renderDocument, renderPage } from "../src/entry.server.js";
import type { PageView } from "../src/features/page/index.js";
import { view as privacyView } from "../src/features/privacy/index.js";
import { view as termsView } from "../src/features/terms/index.js";
import privacyLive from "./fixtures/privacy-live.json" with { type: "json" };
import termsLive from "./fixtures/terms-live.json" with { type: "json" };
import {
  headTags,
  headings,
  images,
  linkTargets,
  visibleText,
} from "./home-page.js";

const assets = {
  entryScript: "/assets/entry.js",
  modulePreloads: [],
  stylesheets: ["/assets/entry.css"],
};

interface PageFacts {
  readonly headTags: ReturnType<typeof headTags>;
  readonly headings: readonly string[];
  readonly images: ReturnType<typeof images>;
  readonly linkTargets: readonly string[];
  readonly visibleText: readonly string[];
}

const renderView = (view: PageView) =>
  Effect.gen(function* render() {
    const application = yield* renderToString(
      {
        init: () => ({ model: initialModel }),
        view,
      },
      { isHydratable: false }
    );

    return renderDocument(application, assets);
  });

const comparesLivePage = (
  label: string,
  view: PageView,
  live: PageFacts
): void => {
  describe(`${label} against the live page`, () => {
    it.effect("keeps every heading in the old order", () =>
      Effect.gen(function* checkHeadings() {
        const html = yield* renderView(view);

        expect(headings(html)).toEqual(live.headings);
      })
    );

    it.effect("keeps the old words", () =>
      Effect.gen(function* checkText() {
        const html = yield* renderView(view);

        expect(visibleText(html)).toEqual(live.visibleText);
      })
    );

    it.effect("keeps every link target in the old order", () =>
      Effect.gen(function* checkLinks() {
        const html = yield* renderView(view);

        expect(linkTargets(html)).toEqual(live.linkTargets);
      })
    );

    it.effect("keeps every image with its alt text and loading hints", () =>
      Effect.gen(function* checkImages() {
        const html = yield* renderView(view);

        expect(images(html)).toEqual(live.images);
      })
    );

    it.effect("keeps the old head tags", () =>
      Effect.gen(function* checkHead() {
        const html = yield* renderView(view);

        expect(headTags(html)).toEqual(live.headTags);
      })
    );
  });
};

describe("legal page routes", () => {
  it.effect("answers both pages this step owns", () =>
    Effect.gen(function* checkPages() {
      for (const path of ["/privacy/", "/terms/"]) {
        const result = yield* Effect.promise(() =>
          renderPage(new Request(`https://hypertask.ai${path}`))
        );

        expect(Predicate.isTagged(result, "Rendered")).toBe(true);
      }
    })
  );
});

comparesLivePage("privacy page", privacyView, privacyLive);

comparesLivePage("terms page", termsView, termsLive);
