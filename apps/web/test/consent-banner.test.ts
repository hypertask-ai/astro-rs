import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import type { AppModel } from "../src/client/app/model.js";
import { renderDocument } from "../src/entry.server.js";
import {
  acceptButtonId,
  bannerLabel,
  bannerMessage,
  privacyHref,
  privacyLabel,
  rejectButtonId,
} from "../src/features/consent/copy.js";
import { view } from "../src/features/home/index.js";

const assets = {
  entryScript: "/assets/entry.js",
  modulePreloads: [],
  stylesheets: ["/assets/entry.css"],
};

const renderPage = (model: AppModel) =>
  Effect.gen(function* renderConsentPage() {
    const application = yield* renderToString(
      { init: () => ({ model }), view },
      { isHydratable: false }
    );

    return renderDocument(application, assets);
  });

const bannerMarkup = (html: string): string => {
  const match =
    /<section[^>]*id="cookie-consent"[^>]*>[\s\S]*?<\/section>/u.exec(html);

  if (match === null) {
    throw new Error("the page has no cookie banner");
  }

  return match[0];
};

const openingTag = (markup: string): string =>
  markup.slice(0, markup.indexOf(">"));

const analyticsScriptSources = (html: string): readonly string[] =>
  [...html.matchAll(/<script[^>]*\ssrc="(?<src>[^"]+)"/gu)].flatMap((match) => {
    const source = match.groups?.src ?? "";

    return /analytics|fathom|posthog|relay/iu.test(source) ? [source] : [];
  });

const visibleModel: AppModel = { ...initialModel, bannerVisible: true };

describe("cookie banner markup", () => {
  it.effect("renders hidden until the stored choice is read", () =>
    Effect.gen(function* hiddenFirst() {
      const markup = bannerMarkup(yield* renderPage(initialModel));

      expect(openingTag(markup)).toContain('hidden=""');
    })
  );

  it.effect("renders visible when the visitor has no stored choice", () =>
    Effect.gen(function* shown() {
      const markup = bannerMarkup(yield* renderPage(visibleModel));

      expect(openingTag(markup)).not.toContain('hidden=""');
    })
  );

  it.effect("is one labelled region named the way the old site named it", () =>
    Effect.gen(function* labelled() {
      const markup = bannerMarkup(yield* renderPage(visibleModel));

      expect(openingTag(markup)).toContain('role="region"');
      expect(openingTag(markup)).toContain(`aria-label="${bannerLabel}"`);
      expect(bannerLabel).toBe("Cookie preferences");
    })
  );

  it.effect("says the old words and links the privacy policy", () =>
    Effect.gen(function* words() {
      const markup = bannerMarkup(yield* renderPage(visibleModel));

      expect(bannerMessage).toBe(
        "We use PostHog analytics to understand visits and clicks. Optional cookies stay off unless you accept."
      );
      expect(markup).toMatch(
        new RegExp(`<strong[^>]*>${bannerLabel}</strong>`, "u")
      );
      expect(markup).toContain(`${bannerMessage} <a`);
      expect(markup).toContain(`href="${privacyHref}"`);
      expect(markup).toContain(`>${privacyLabel}</a>`);
      expect(privacyLabel).toBe("Privacy policy");
      expect(privacyHref).toBe("/privacy/");
    })
  );

  it.effect("offers Accept and Reject as two equal plain buttons", () =>
    Effect.gen(function* buttons() {
      const markup = bannerMarkup(yield* renderPage(visibleModel));

      expect(markup).toContain(`id="${acceptButtonId}"`);
      expect(markup).toContain(`id="${rejectButtonId}"`);
      expect(markup).toContain('type="button"');
      expect(markup).toContain(">Accept</button>");
      expect(markup).toContain(">Reject</button>");
    })
  );

  it.effect("loads no analytics script before the visitor chooses", () =>
    Effect.gen(function* noEarlyScript() {
      const asked = yield* renderPage(visibleModel);
      const decided = yield* renderPage(initialModel);

      expect(analyticsScriptSources(asked)).toStrictEqual([]);
      expect(analyticsScriptSources(decided)).toStrictEqual([]);
    })
  );
});
