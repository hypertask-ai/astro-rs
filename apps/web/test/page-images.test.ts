// @effect-diagnostics nodeBuiltinImport:off -- The test reads the built site output and checks that every local image a page references shipped, a file-system boundary.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToString } from "foldkit/experimental/server";

import { initialModel } from "../src/client/app/index.js";
import { renderDocument } from "../src/entry.server.js";
import { view as hallmarkView } from "../src/features/hallmark/index.js";
import type { PageView } from "../src/features/page/index.js";
import { view as testimonialIdaView } from "../src/features/testimonial-ida/index.js";
import { view as vsLinearView } from "../src/features/vs-linear/index.js";
import { images } from "./page-facts.js";

const assets = {
  entryScript: "/assets/entry.js",
  modulePreloads: [],
  stylesheets: ["/assets/entry.css"],
};

const builtClient = new URL("../dist/client/", import.meta.url);

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

const localSources = (html: string): readonly string[] =>
  images(html)
    .map((image) => image.src)
    .filter((src) => src.startsWith("/") && !src.startsWith("//"));

const builtFile = (src: string): string =>
  fileURLToPath(new URL(src.replace(/^\//u, ""), builtClient));

const pages: readonly (readonly [string, PageView])[] = [
  ["comparison page", vsLinearView],
  ["hallmark page", hallmarkView],
  ["Ida testimonial page", testimonialIdaView],
];

describe("page images", () => {
  for (const [label, view] of pages) {
    it.effect(`${label} ships every image it references`, () =>
      Effect.gen(function* checkImages() {
        const html = yield* renderView(view);
        const sources = localSources(html);

        expect(sources.length).toBeGreaterThan(0);

        for (const src of sources) {
          expect(existsSync(builtFile(src)), `${src} is missing`).toBe(true);
        }
      })
    );
  }
});
