import { describe, expect, it } from "@effect/vitest";
import { Effect, Predicate } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import {
  prerenderPaths,
  renderDocument,
  renderPage,
} from "../src/entry.server.js";
import { view as hallmarkView } from "../src/features/hallmark/index.js";
import type { PageView } from "../src/features/page/index.js";
import { view as testimonialIdaView } from "../src/features/testimonial-ida/index.js";
import { view as vsLinearView } from "../src/features/vs-linear/index.js";
import { viewForPath } from "../src/routes.js";
import hallmarkLive from "./fixtures/hallmark-live.json" with { type: "json" };
import testimonialIdaLive from "./fixtures/testimonial-ida-live.json" with { type: "json" };
import vsLinearLive from "./fixtures/vs-linear-live.json" with { type: "json" };
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

describe("comparison, hallmark and testimonial routes", () => {
  const addresses = [
    "/",
    "/hallmark/",
    "/testimonial-ida/",
    "/hypertask-vs-linear/",
  ];

  it("prerenders every page this step adds", () => {
    expect(prerenderPaths).toEqual(expect.arrayContaining(addresses));
  });

  it("answers each page address with a view and nothing else", () => {
    for (const address of addresses) {
      expect(viewForPath(address)).toBeDefined();
    }

    expect(viewForPath("/nope/")).toBeUndefined();
  });

  it("finds a page whether or not the address carries its trailing slash", () => {
    expect(viewForPath("/hallmark")).toBe(viewForPath("/hallmark/"));
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

comparesLivePage("linear comparison page", vsLinearView, vsLinearLive);

comparesLivePage("hallmark page", hallmarkView, hallmarkLive);

comparesLivePage(
  "Ida testimonial page",
  testimonialIdaView,
  testimonialIdaLive
);

describe("linear comparison table", () => {
  it.effect("keeps the eight feature rows of the old table", () =>
    Effect.gen(function* checkRows() {
      const html = yield* renderView(vsLinearView);

      expect([...html.matchAll(/<th\b[^>]*scope="row"/gu)]).toHaveLength(8);
    })
  );

  it.effect("keeps three column headers and one scroll frame", () =>
    Effect.gen(function* checkColumns() {
      const html = yield* renderView(vsLinearView);

      expect([...html.matchAll(/<th\b[^>]*scope="col"/gu)]).toHaveLength(3);
      expect([...html.matchAll(/tabindex="0"/gu)]).toHaveLength(1);
    })
  );
});

describe("hallmark testimonial marquee", () => {
  it.effect(
    "renders four desktop columns, three tablet columns and one phone strip",
    () =>
      Effect.gen(function* checkCards() {
        const html = yield* renderView(hallmarkView);

        const marqueeCards = images(html).filter(
          (image) => image.width === "50" && image.height === "50"
        );

        expect(marqueeCards).toHaveLength(215);
        expect(
          marqueeCards.filter((image) => image.alt === "Marco Schache")
        ).toHaveLength(22);
      })
  );

  it.effect("labels every phone dot with its slide", () =>
    Effect.gen(function* checkDots() {
      const html = yield* renderView(hallmarkView);

      expect(html).toContain('aria-label="Go to slide 1"');
      expect(html).toContain('aria-label="Go to slide 5"');
      expect(html).not.toContain('aria-label="Go to slide 6"');
    })
  );
});

describe("Ida testimonial metrics", () => {
  it.effect("keeps the five metric rows of the old table", () =>
    Effect.gen(function* checkRows() {
      const html = yield* renderView(testimonialIdaView);
      const rows = [...html.matchAll(/<tr\b/gu)];

      expect(rows).toHaveLength(6);
    })
  );
});
