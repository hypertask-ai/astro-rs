import { describe, expect, it } from "@effect/vitest";
import { Effect, Predicate } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import {
  prerenderPaths,
  renderDocument,
  renderPage,
} from "../src/entry.server.js";
import { pageHeads } from "../src/features/head/index.js";
import { useCasePages } from "../src/features/use-cases/copy.js";
import {
  useCaseViewFor,
  useCaseViews,
} from "../src/features/use-cases/index.js";
import type { UseCaseView } from "../src/features/use-cases/index.js";
import agencyLive from "./fixtures/use-cases-agency-live.json" with { type: "json" };
import croLive from "./fixtures/use-cases-cro-live.json" with { type: "json" };
import marketingLive from "./fixtures/use-cases-marketing-live.json" with { type: "json" };
import productLive from "./fixtures/use-cases-product-live.json" with { type: "json" };
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

const viewAt = (path: string): UseCaseView => {
  const view = useCaseViewFor(path);

  if (view === undefined) {
    throw new Error(`No use case view for ${path}`);
  }

  return view;
};

const renderView = (view: UseCaseView) =>
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
  path: string,
  live: PageFacts
): void => {
  describe(`${label} against the live page`, () => {
    it.effect("keeps every heading in the old order", () =>
      Effect.gen(function* checkHeadings() {
        const html = yield* renderView(viewAt(path));

        expect(headings(html)).toEqual(live.headings);
      })
    );

    it.effect("keeps the old words", () =>
      Effect.gen(function* checkText() {
        const html = yield* renderView(viewAt(path));

        expect(visibleText(html)).toEqual(live.visibleText);
      })
    );

    it.effect("keeps every link target in the old order", () =>
      Effect.gen(function* checkLinks() {
        const html = yield* renderView(viewAt(path));

        expect(linkTargets(html)).toEqual(live.linkTargets);
      })
    );

    it.effect("keeps every image with its alt text and loading hints", () =>
      Effect.gen(function* checkImages() {
        const html = yield* renderView(viewAt(path));

        expect(images(html)).toEqual(live.images);
      })
    );

    it.effect("keeps the old head tags", () =>
      Effect.gen(function* checkHead() {
        const html = yield* renderView(viewAt(path));

        expect(headTags(html)).toEqual(live.headTags);
      })
    );
  });
};

describe("use case routes", () => {
  const addresses = useCasePages.map((page) => page.path);

  it("prerenders the home page and every use case page", () => {
    expect(prerenderPaths.toSorted()).toEqual(["/", ...addresses].toSorted());
  });

  it("answers each page address with its own view", () => {
    expect(useCaseViews.size).toBe(addresses.length);

    for (const address of addresses) {
      expect(viewAt(address)).toBeTypeOf("function");
      expect(viewAt(address.slice(0, -1))).toBe(viewAt(address));
    }

    expect(useCaseViewFor("/nope/")).toBeUndefined();
  });

  it("keeps four different titles that are not the home title", () => {
    const titles = addresses.map((address) => pageHeads.get(address)?.title);

    expect(new Set(titles).size).toBe(addresses.length);
    expect(titles).not.toContain(pageHeads.get("/")?.title);
  });

  it.effect("sends an unknown address to the not found answer", () =>
    Effect.gen(function* checkMissing() {
      const result = yield* Effect.promise(() =>
        renderPage(new Request("https://hypertask.ai/nope/"))
      );

      expect(Predicate.isTagged(result, "Responded")).toBe(true);

      if (Predicate.isTagged(result, "Responded")) {
        expect(result.response.status).toBe(404);
      }
    })
  );
});

comparesLivePage("agency page", "/use-cases/agency/", agencyLive);

comparesLivePage("cro page", "/use-cases/cro/", croLive);

comparesLivePage("marketing page", "/use-cases/marketing/", marketingLive);

comparesLivePage("product page", "/use-cases/product/", productLive);
