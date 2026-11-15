import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "@effect/vitest";
import { Effect, Predicate } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import {
  prerenderPaths,
  renderDocument,
  renderPage,
} from "../src/entry.server.js";
import { codeHighlights } from "../src/features/blog/code-highlights.js";
import { postViews } from "../src/features/blog/index.js";
import { publishedPosts } from "../src/features/blog/posts.js";
import { viewForPath } from "../src/routes.js";
import type { BlogFacts } from "./blog-page.js";
import { factsOf } from "./blog-page.js";
import imageHashesJson from "./fixtures/blog-images.json" with { type: "json" };

interface ImageHash {
  readonly bytes: number;
  readonly sha256: string;
}

const assets = {
  entryScript: "/assets/entry.js",
  modulePreloads: [],
  stylesheets: ["/assets/entry.css"],
};

const publicRoot = fileURLToPath(new URL("../public", import.meta.url));

const fixtures: Readonly<Record<string, BlogFacts>> =
  import.meta.glob<BlogFacts>("./fixtures/blog/*.json", {
    eager: true,
    import: "default",
  });

const imageHashes: Readonly<Record<string, ImageHash>> = imageHashesJson;

const fixtureAddresses = Object.values(fixtures)
  .map((fixture) => fixture.address)
  .toSorted();

const renderAddress = (address: string) =>
  Effect.gen(function* renderPost() {
    const view = viewForPath(address);

    if (view === undefined) {
      return yield* Effect.die(new Error(`No view for ${address}`));
    }

    const application = yield* renderToString(
      {
        init: () => ({ model: initialModel }),
        view,
      },
      { isHydratable: false }
    );

    return renderDocument(application, assets);
  });

describe("blog routes", () => {
  it("prerenders every post address", () => {
    for (const address of fixtureAddresses) {
      expect(prerenderPaths).toContain(address);
    }
  });

  it("owns one view per published post and nothing else", () => {
    expect([...postViews.keys()].toSorted()).toEqual(fixtureAddresses);
    expect(postViews.size).toBe(publishedPosts.length);
  });

  it("answers a post address without its trailing slash", () => {
    const address = "/blog/ai-agent-task-management";

    expect(viewForPath(address)).toBeDefined();
    expect(viewForPath(`${address}/`)).toBeDefined();
  });

  it("answers an unknown blog address with nothing", () => {
    expect(viewForPath("/blog/not-a-post/")).toBeUndefined();
  });

  it.effect("renders the not found answer for an unknown address", () =>
    Effect.gen(function* checkMissing() {
      const result = yield* Effect.promise(() =>
        renderPage(new Request("https://hypertask.ai/blog/not-a-post/"))
      );

      expect(Predicate.isTagged(result, "Responded")).toBe(true);

      if (Predicate.isTagged(result, "Responded")) {
        expect(result.response.status).toBe(404);
      }
    })
  );
});

describe("blog images", () => {
  it("serves every image from this site with the old bytes", () => {
    for (const [src, expected] of Object.entries(imageHashes)) {
      const bytes = readFileSync(path.join(publicRoot, src));

      expect(src.startsWith("/")).toBe(true);
      expect(bytes.length).toBe(expected.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        expected.sha256
      );
    }
  });

  it("points every image on every post at one of those files", () => {
    for (const fixture of Object.values(fixtures)) {
      for (const image of fixture.images) {
        expect(imageHashes[image.src]).toBeDefined();
      }
    }
  });
});

describe("blog code blocks", () => {
  it("keeps one highlighted fragment per source code block", () => {
    for (const fixture of Object.values(fixtures)) {
      const slug = fixture.address.slice("/blog/".length, -1);

      expect(fixture.codeBlocks.length).toBeGreaterThan(0);

      for (const [index] of fixture.codeBlocks.entries()) {
        expect(codeHighlights[`${slug}/${index}`]).toBeDefined();
      }
    }
  });
});

for (const address of fixtureAddresses) {
  const fixture = Object.values(fixtures).find(
    (candidate) => candidate.address === address
  );

  if (fixture === undefined) {
    throw new Error(`No fixture for ${address}`);
  }

  describe(address, () => {
    it("hydrates from the address it was served at", () => {
      expect(viewForPath(address)).toBeDefined();
    });

    it.effect("answers with a rendered page", () =>
      Effect.gen(function* checkRendered() {
        const result = yield* Effect.promise(() =>
          renderPage(new Request(`https://hypertask.ai${address}`))
        );

        expect(Predicate.isTagged(result, "Rendered")).toBe(true);
      })
    );

    it.effect("keeps the old head tags", () =>
      Effect.gen(function* checkHead() {
        const facts = factsOf(yield* renderAddress(address));

        expect(facts.head).toEqual(fixture.head);
      })
    );

    it.effect("keeps the old structured data", () =>
      Effect.gen(function* checkStructuredData() {
        const facts = factsOf(yield* renderAddress(address));

        expect(facts.structuredData).toEqual(fixture.structuredData);
      })
    );

    it.effect("keeps every heading in order with its id", () =>
      Effect.gen(function* checkHeadings() {
        const facts = factsOf(yield* renderAddress(address));

        expect(facts.headings).toEqual(fixture.headings);
      })
    );

    it.effect("keeps the old words", () =>
      Effect.gen(function* checkText() {
        const facts = factsOf(yield* renderAddress(address));

        expect(facts.visibleText).toEqual(fixture.visibleText);
      })
    );

    it.effect("keeps every link target in order", () =>
      Effect.gen(function* checkLinks() {
        const facts = factsOf(yield* renderAddress(address));

        expect(facts.links).toEqual(fixture.links);
      })
    );

    it.effect("keeps every image with its alt text and source", () =>
      Effect.gen(function* checkImages() {
        const facts = factsOf(yield* renderAddress(address));

        expect(facts.images).toEqual(fixture.images);
      })
    );

    it.effect("keeps every table cell", () =>
      Effect.gen(function* checkTables() {
        const facts = factsOf(yield* renderAddress(address));

        expect(facts.tables).toEqual(fixture.tables);
      })
    );

    it.effect("keeps every code block and its language", () =>
      Effect.gen(function* checkCodeBlocks() {
        const facts = factsOf(yield* renderAddress(address));

        expect(facts.codeBlocks).toEqual(fixture.codeBlocks);
      })
    );
  });
}
