import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel, Message, update } from "../src/client/app/index.js";
import { prerenderPaths, renderDocument } from "../src/entry.server.js";
import { view as aboutView } from "../src/features/about/index.js";
import { view as contactView } from "../src/features/contact/index.js";
import type { PageView } from "../src/features/page/index.js";
import { view as pricingView } from "../src/features/pricing/index.js";
import { view as thankYouView } from "../src/features/thank-you/index.js";
import { viewForPath } from "../src/routes.js";
import aboutLive from "./fixtures/about-live.json" with { type: "json" };
import contactLive from "./fixtures/contact-live.json" with { type: "json" };
import pricingLive from "./fixtures/pricing-live.json" with { type: "json" };
import thankYouLive from "./fixtures/thank-you-live.json" with { type: "json" };
import {
  headTags,
  headings,
  images,
  linkTargets,
  visibleText,
} from "./page-facts.js";

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

describe("page routes", () => {
  const addresses = ["/", "/about/", "/contact/", "/pricing/", "/thank-you/"];

  it("prerenders every page this step owns", () => {
    for (const address of addresses) {
      expect(prerenderPaths).toContain(address);
    }
  });

  it("answers each page address with a view and nothing else", () => {
    for (const address of addresses) {
      expect(viewForPath(address)).toBeDefined();
    }

    expect(viewForPath("/nope/")).toBeUndefined();
  });
});

comparesLivePage("about page", aboutView, aboutLive);

comparesLivePage("contact page", contactView, contactLive);

comparesLivePage("pricing page", pricingView, pricingLive);

comparesLivePage("thank-you page", thankYouView, thankYouLive);

describe("pricing switch", () => {
  it.effect("starts on the yearly prices", () =>
    Effect.gen(function* checkYearly() {
      const html = yield* renderView(pricingView);

      expect(html).toContain("$8");
      expect(html).toContain("$16");
      expect(html).toContain("$96 billed yearly");
      expect(html).toContain("$192 billed yearly");
      expect(html).toContain('aria-pressed="true"');
    })
  );

  it.effect("shows the monthly prices and labels when the switch moves", () =>
    Effect.gen(function* checkMonthly() {
      const monthly = update(
        initialModel,
        Message.SelectedBillingPeriod({ period: "monthly" })
      ).model;

      const application = yield* renderToString(
        {
          init: () => ({ model: monthly }),
          view: pricingView,
        },
        { isHydratable: false }
      );

      const html = renderDocument(application, assets);

      expect(html).toContain("$10");
      expect(html).toContain("$20");
      expect(html).toContain("billed monthly");
      expect(html).not.toContain("$96 billed yearly");
      expect(html).not.toContain("$192 billed yearly");
    })
  );
});
