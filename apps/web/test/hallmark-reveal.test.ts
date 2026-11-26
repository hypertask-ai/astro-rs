import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";

interface RevealElementOnLive {
  readonly marker: string;
  readonly tag: string;
}

const revealElementsOnLive: readonly RevealElementOnLive[] = [
  { marker: "Fast enough to actually enjoy.", tag: "section" },
  { marker: "Ship auth fix", tag: "section" },
  {
    marker: "If it runs a shell command or speaks MCP, it works.",
    tag: "section",
  },
  { marker: "Three steps to a board that runs itself.", tag: "section" },
  { marker: "What our users say", tag: "div" },
  { marker: "Free forever. Upgrade when your team needs more.", tag: "div" },
  { marker: "Put your agents on the board.", tag: "section" },
];

const openingTag = /<(?<tag>[a-z][a-z0-9]*)\b(?<attributes>[^>]*)>/giu;

const classAttribute = /class="(?<value>[^"]*)"/u;

const classesIn = (attributes: string): readonly string[] =>
  (classAttribute.exec(attributes)?.groups?.value ?? "")
    .split(/\s+/u)
    .filter((name) => name.length > 0);

interface RevealElement {
  readonly start: number;
  readonly tag: string;
}

const revealElementsIn = (html: string): readonly RevealElement[] =>
  [...html.matchAll(openingTag)].flatMap((match) => {
    const tag = (match.groups?.tag ?? "").toLowerCase();
    const classes = classesIn(match.groups?.attributes ?? "");

    return classes.includes("reveal") ? [{ start: match.index ?? 0, tag }] : [];
  });

it.layer(NodeServices.layer)("Hallmark reveal", (test) => {
  test.effect(
    "puts the reveal class on the same elements the live page puts it on",
    () =>
      Effect.gen(function* checkReveal() {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        const html = yield* fs.readFileString(
          path.resolve(
            import.meta.dirname,
            "../dist/client/hallmark/index.html"
          )
        );

        const found = revealElementsIn(html);

        const sections = found.map((element, index) => ({
          html: html.slice(
            element.start,
            found[index + 1]?.start ?? html.length
          ),
          tag: element.tag,
        }));

        expect(sections.map((section) => section.tag)).toEqual(
          revealElementsOnLive.map((element) => element.tag)
        );

        for (const [index, section] of sections.entries()) {
          const live = revealElementsOnLive[index];

          expect(section.html).toContain(live?.marker ?? "");
        }
      })
  );
});
