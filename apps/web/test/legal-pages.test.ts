import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import { prerenderPaths, renderDocument } from "../src/entry.server.js";
import type { PageView } from "../src/features/page/index.js";
import { view as privacyView } from "../src/features/privacy/index.js";
import { view as termsView } from "../src/features/terms/index.js";
import { viewForPath } from "../src/routes.js";
import privacyLive from "./fixtures/privacy-live.json" with { type: "json" };
import termsLive from "./fixtures/terms-live.json" with { type: "json" };
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

interface WordingChange {
  readonly links: readonly string[];
  readonly newText: readonly string[];
  readonly oldText: string;
  readonly reason: string;
}

const withWordingText = (
  visible: readonly string[],
  change: WordingChange | undefined
): readonly string[] =>
  change === undefined
    ? visible
    : visible.flatMap((entry) =>
        entry === change.oldText ? change.newText : [entry]
      );

const withoutWordingLinks = (
  targets: readonly string[],
  change: WordingChange | undefined
): readonly string[] => {
  if (change === undefined) {
    return targets;
  }

  const start = targets.findIndex(
    (target, index) =>
      target === change.links[0] && targets[index + 1] === change.links[1]
  );

  return start === -1
    ? targets
    : [
        ...targets.slice(0, start),
        ...targets.slice(start + change.links.length),
      ];
};

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
  live: PageFacts,
  change?: WordingChange
): void => {
  describe(
    change === undefined
      ? `${label} against the live page`
      : `${label} against the live page, allowing one recorded change: ${change.reason}`,
    () => {
      it.effect("keeps every heading in the old order", () =>
        Effect.gen(function* checkHeadings() {
          const html = yield* renderView(view);

          expect(headings(html)).toEqual(live.headings);
        })
      );

      it.effect("keeps the old words", () =>
        Effect.gen(function* checkText() {
          const html = yield* renderView(view);

          expect(visibleText(html)).toEqual(
            withWordingText(live.visibleText, change)
          );
        })
      );

      it.effect("keeps every link target in the old order", () =>
        Effect.gen(function* checkLinks() {
          const html = yield* renderView(view);

          expect(withoutWordingLinks(linkTargets(html), change)).toEqual(
            live.linkTargets
          );
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
    }
  );
};

describe("legal page routes", () => {
  const addresses = ["/privacy/", "/terms/"];

  it("prerenders both pages this step owns", () => {
    expect(prerenderPaths).toEqual(expect.arrayContaining(addresses));
  });

  it("answers each page address with its own view", () => {
    expect(addresses.map((address) => viewForPath(address))).toEqual([
      privacyView,
      termsView,
    ]);
    expect(viewForPath("/nope/")).toBeUndefined();
  });
});

const privacyWordingChange = {
  links: ["https://posthog.com/privacy", "https://usefathom.com/privacy"],
  newText: ["PostHog", "Fathom Analytics"],
  oldText: "Google Analytics",
  reason:
    "Valentin, 2026-11-15: we dont use GA4 we use posthog and fathon analytics, and all customer facing assets must have fathom",
} as const satisfies WordingChange;

comparesLivePage(
  "privacy page",
  privacyView,
  privacyLive,
  privacyWordingChange
);

comparesLivePage("terms page", termsView, termsLive);
