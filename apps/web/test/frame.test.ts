import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel, Message, update } from "../src/client/app/index.js";
import { renderDocument } from "../src/entry.server.js";
import { view } from "../src/features/home/index.js";

const assets = {
  entryScript: "/assets/entry.js",
  modulePreloads: [],
  stylesheets: ["/assets/entry.css"],
};

const renderHome = Effect.fn("test.renderHome")(function* renderHome() {
  const application = yield* renderToString({
    init: () => ({ model: initialModel }),
    view,
  });

  return renderDocument(application, assets);
});

const externalLoads = (html: string): readonly (string | undefined)[] =>
  [...html.matchAll(/<(?:script|link|img|source|video)\b[^>]*>/gu)]
    .map((match) => match[0])
    .flatMap((tag) =>
      tag.includes('rel="canonical"') || tag.includes('rel="alternate"')
        ? []
        : [...tag.matchAll(/\b(?:src|href)="(?<url>https?:\/\/[^"]+)"/gu)].map(
            (match) => match.groups?.url
          )
    );

describe("frame update", () => {
  it("opens and closes the mobile menu", () => {
    const opened = update(initialModel, Message.ToggledMenu()).model;

    expect(opened.menuOpen).toBe(true);
    expect(update(opened, Message.ToggledMenu()).model.menuOpen).toBe(false);
    expect(update(opened, Message.ClosedMenu()).model.menuOpen).toBe(false);
  });

  it("tracks the scroll border", () => {
    const scrolled = update(
      initialModel,
      Message.Scrolled({ scrolled: true })
    ).model;

    expect(scrolled.scrolled).toBe(true);
    expect(
      update(scrolled, Message.Scrolled({ scrolled: false })).model.scrolled
    ).toBe(false);
  });

  it("opens login when L is pressed", () => {
    const result = update(initialModel, Message.PressedLoginKey());

    expect(result.commands).toHaveLength(1);
    expect(result.commands?.[0]?.name).toBe("OpenLogin");
  });
});

describe("rendered home page", () => {
  it.effect("renders the header, footer and skip link", () =>
    Effect.gen(function* checkFrame() {
      const html = yield* renderHome();

      expect(html).toContain('id="main-header"');
      expect(html).toContain('id="login-button"');
      expect(html).toContain('id="get-started-button"');
      expect(html).toContain('id="mobile-get-started-button"');
      expect(html).toContain('href="#main-content"');
      expect(html).toContain('aria-label="Footer"');
      expect(html).toContain("Cookie settings");
      expect(html).toContain("Hypertask Lab Ltd.");
    })
  );

  it.effect("carries the old head fields for the home page", () =>
    Effect.gen(function* checkHead() {
      const html = yield* renderHome();

      expect(html).toContain(
        "<title>The fastest project board — Hypertask</title>"
      );
      expect(html).toContain('href="https://hypertask.ai/"');
      expect(html).toContain('content="index, follow"');
      expect(html).toContain("application/ld+json");
    })
  );

  it.effect("loads nothing from another host", () =>
    Effect.gen(function* checkHosts() {
      const html = yield* renderHome();

      expect(externalLoads(html)).toEqual([]);
      expect(html).not.toContain("fonts.googleapis.com");
      expect(html).not.toContain("fonts.gstatic.com");
      expect(html).not.toContain("cloudfront.net");
    })
  );
});
