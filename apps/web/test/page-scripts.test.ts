import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { renderToString } from "foldkit/experimental/server";

import {
  firstGraphType,
  recordPageScripts,
  sourceScriptType,
} from "../scripts/page-scripts.js";
import { initialModel } from "../src/client/app/index.js";
import { renderDocument } from "../src/entry.server.js";
import {
  fathomScriptTag,
  pageScripts,
  slotForScript,
} from "../src/features/analytics/index.js";
import type { ObservedScript } from "../src/features/analytics/index.js";
import { view } from "../src/features/home/index.js";
import livePagesJson from "./fixtures/live-page-scripts.json" with { type: "json" };

const RecordedScript = Schema.Struct({
  attributes: Schema.Array(Schema.String),
  graphType: Schema.NullOr(Schema.String),
  inline: Schema.String,
  order: Schema.Int,
  place: Schema.Literals(["head", "body"]),
  src: Schema.NullOr(Schema.String),
  type: Schema.NullOr(Schema.String),
});

const RecordedPage = Schema.Struct({
  headCount: Schema.Int,
  path: Schema.String,
  scripts: Schema.Array(RecordedScript),
});

const LivePages = Schema.Struct({
  capturedAt: Schema.String,
  capturedWith: Schema.String,
  pages: Schema.Array(RecordedPage),
  rewrittenBy: Schema.String,
});

const livePages = Schema.decodeUnknownSync(LivePages)(livePagesJson);

const assets = {
  entryScript: "/assets/entry.js",
  modulePreloads: [],
  stylesheets: ["/assets/entry.css"],
};

const renderHome = Effect.fn("test.renderScriptOrderHome")(
  function* renderHome() {
    const application = yield* renderToString(
      {
        init: () => ({ model: initialModel }),
        view,
      },
      { isHydratable: false }
    );

    return renderDocument(application, assets);
  }
);

const slotIds = (scripts: readonly { id: string }[]): readonly string[] =>
  scripts.map((slot) => slot.id);

const recordedSlots = (scripts: readonly ObservedScript[]) =>
  scripts.flatMap((script) => {
    const slot = slotForScript(script);

    return slot === undefined ? [`unrecorded ${script.inline}`] : [slot.id];
  });

describe("recorded page scripts", () => {
  it("keeps the served order with the head scripts first", () => {
    for (const page of livePages.pages) {
      expect(page.scripts.map((script) => script.order)).toEqual(
        page.scripts.map((_script, index) => index + 1)
      );
      expect(
        page.scripts
          .slice(0, page.headCount)
          .every((script) => script.place === "head")
      ).toBe(true);
      expect(
        page.scripts
          .slice(page.headCount)
          .every((script) => script.place === "body")
      ).toBe(true);
    }
  });

  it("gives every recorded script exactly one row of the table", () => {
    for (const page of livePages.pages) {
      for (const script of page.scripts) {
        const slot = slotForScript(script);

        expect(slot).toBeDefined();
        expect(slot?.recordedOn).toContain(page.path);
      }
    }
  });

  it("keeps every recorded page in the table's order", () => {
    const order = slotIds(pageScripts);

    for (const page of livePages.pages) {
      const indices = recordedSlots(page.scripts).map((id) =>
        order.indexOf(id)
      );

      expect(indices).toEqual(
        [...indices].toSorted((left, right) => left - right)
      );
      expect(new Set(indices).size).toBe(indices.length);
    }
  });

  it("records every row the old site serves", () => {
    const recorded = new Set(
      livePages.pages.flatMap((page) => recordedSlots(page.scripts))
    );

    const oldSiteRows = pageScripts.filter(
      (slot) => slot.carriedBy !== "client-entry"
    );

    expect(oldSiteRows.filter((slot) => !recorded.has(slot.id))).toEqual([]);
  });

  it("reads the structured data type from the recorded body", () => {
    for (const page of livePages.pages) {
      for (const script of page.scripts) {
        expect(script.graphType).toBe(firstGraphType(script.inline));
      }
    }
  });

  it("undoes only the type Cloudflare rewrote", () => {
    expect(sourceScriptType("cb2535b77a1a41527c31ca9f-text/javascript")).toBe(
      null
    );
    expect(sourceScriptType("cb2535b77a1a41527c31ca9f-module")).toBe("module");
    expect(sourceScriptType("application/ld+json")).toBe("application/ld+json");
    expect(sourceScriptType(null)).toBe(null);
  });

  it("parses the served order and the head boundary", () => {
    const recorded = recordPageScripts(
      [
        '<html><head><script type="cb2535b77a1a41527c31ca9f-text/javascript">console.log(1)</script>',
        '<script src="/a.js" defer></script>',
        "</head><body>",
        '<script src="/_astro/CookieConsent.astro_x.js" type="cb2535b77a1a41527c31ca9f-module"></script>',
        "</body></html>",
      ].join("")
    );

    expect(recorded.map((script) => script.place)).toEqual([
      "head",
      "head",
      "body",
    ]);
    expect(recorded.map((script) => script.type)).toEqual([
      null,
      null,
      "module",
    ]);
    expect(recorded.map((script) => script.attributes)).toEqual([
      [],
      ["defer"],
      [],
    ]);
    expect(recorded.map((script) => script.src)).toEqual([
      null,
      "/a.js",
      "/_astro/CookieConsent.astro_x.js",
    ]);
  });
});

describe("rendered page scripts", () => {
  it.effect("loads the recorded Fathom row and nothing out of order", () =>
    Effect.gen(function* checkRenderedOrder() {
      const html = yield* renderHome();
      const rendered = recordPageScripts(html);

      const slots = rendered.flatMap((script) => {
        const slot = slotForScript(script);

        return slot === undefined ? [] : [slot];
      });

      const order = slotIds(pageScripts);
      const indices = slotIds(slots).map((id) => order.indexOf(id));

      expect(slotIds(slots)).toEqual([
        "home-redirect",
        "organization-json-ld",
        "fathom",
        "client-entry",
      ]);
      expect(indices).toEqual(
        [...indices].toSorted((left, right) => left - right)
      );
      expect(html).toContain(fathomScriptTag);
    })
  );

  it.effect("serves the Fathom tag exactly as the old site does", () =>
    Effect.gen(function* checkFathomTag() {
      const html = yield* renderHome();

      const script = recordPageScripts(html).find(
        (candidate) => slotForScript(candidate)?.id === "fathom"
      );

      const oldSite = livePages.pages
        .flatMap((page) => page.scripts)
        .filter((candidate) => candidate.src === script?.src);

      expect(script).toBeDefined();
      expect(oldSite).toHaveLength(livePages.pages.length);
      expect(script?.attributes).toEqual(oldSite[0]?.attributes);
      expect(script?.type).toBe(oldSite[0]?.type);
    })
  );
});
