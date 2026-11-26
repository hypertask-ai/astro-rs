import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";

import liveFooter from "./fixtures/live-footer-links.json" with { type: "json" };
import {
  footerLinkHeight,
  footerMarks,
  footerPhoneRowGap,
  footerRowGaps,
} from "./footer-rules.js";

const pageSuffix = "index.html";

const homePage = "index.html";

const sameClasses = (
  left: readonly string[],
  right: readonly string[]
): boolean => [...left].sort().join(" ") === [...right].sort().join(" ");

it.layer(NodeServices.layer)("page footer link rows", (test) => {
  const builtSite = Effect.gen(function* readBuiltSite() {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const client = path.resolve(import.meta.dirname, "../dist/client");
    const listing = yield* fs.readDirectory(client, { recursive: true });
    const files = listing.map((file) => file.split(path.sep).join("/"));
    const pageFiles = files.filter(
      (file) => file.endsWith(pageSuffix) && file !== homePage
    );
    const sheets = files.filter((file) => file.endsWith(".css"));

    return {
      css: (
        yield* Effect.forEach(sheets, (file) =>
          fs.readFileString(path.join(client, file))
        )
      ).join("\n"),
      pages: yield* Effect.forEach(pageFiles, (file) =>
        Effect.map(fs.readFileString(path.join(client, file)), (html) => ({
          file,
          html,
        }))
      ),
    };
  });

  test.effect(
    "keeps every page footer link row 52px apart at the phone width",
    () =>
      Effect.gen(function* checkFooterRows() {
        const site = yield* builtSite;

        expect(site.pages.length).toBeGreaterThan(0);

        const first = footerMarks(site.pages.at(0)?.html ?? "");
        const ownFooter = site.pages.filter(({ html }) => {
          const marks = footerMarks(html);

          return !(
            sameClasses(marks.navClasses, first.navClasses) &&
            sameClasses(marks.linkClasses, first.linkClasses)
          );
        });
        const linkHeight = footerLinkHeight(site.css, first.linkClasses);
        const phoneRowGap = footerPhoneRowGap(site.css, first.navClasses);
        const pitch =
          linkHeight === undefined || phoneRowGap === undefined
            ? undefined
            : linkHeight + phoneRowGap;

        expect(ownFooter.map(({ file }) => file)).toEqual([]);

        expect(linkHeight).toBe(
          liveFooter.linkLineHeight + liveFooter.linkPaddingBlock * 2
        );

        expect(phoneRowGap).toBe(liveFooter.phoneRowGap);

        expect(footerRowGaps(site.css, first.navClasses)).toEqual([
          liveFooter.phoneRowGap,
          liveFooter.wideRowGap,
        ]);

        expect(pitch).toBe(liveFooter.phoneRowPitch);
      })
  );
});
