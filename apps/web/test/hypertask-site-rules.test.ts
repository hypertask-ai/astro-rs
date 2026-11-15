import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path, Schema } from "effect";

import { prerenderedPagePaths } from "../scripts/site-rules.js";
import {
  headersFile,
  htmlHandling,
  installAddress,
  legacyRedirects,
  addressAnswer,
  redirectsFile,
  securityHeaderLines,
  trailingSlashRedirects,
} from "../src/hypertask/site-rules.js";

const OldSiteAnswer = Schema.Struct({
  headers: Schema.Record(Schema.String, Schema.String),
  location: Schema.NullOr(Schema.String),
  path: Schema.String,
  status: Schema.Int,
});

const OldSite = Schema.Struct({
  answers: Schema.Array(OldSiteAnswer),
  capturedAt: Schema.String,
  origin: Schema.String,
  pages: Schema.Array(Schema.String),
});

const lines = (file: string) =>
  file
    .trim()
    .split("\n")
    .map((line) => line.trim());

const fixture = (path: Path.Path, name: string) =>
  path.join(
    path.resolve(import.meta.dirname, "fixtures/hypertask-site-rules"),
    name
  );

const headerValues = (
  headerLines: readonly string[]
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    headerLines.map((line) => {
      const separator = line.indexOf(":");

      return [
        line.slice(0, separator).trim().toLowerCase(),
        line.slice(separator + 1).trim(),
      ] as const;
    })
  );

const securityHeaders = headerValues(securityHeaderLines);

const loadOldSite = Effect.gen(function* loadOldSite() {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  return yield* fs
    .readFileString(fixture(path, "old-site.json"))
    .pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(Schema.fromJsonString(OldSite)))
    );
});

it.layer(NodeServices.layer)("hypertask site rules", (test) => {
  test.effect(
    "every old address answers as the old site does, row by row",
    () =>
      Effect.gen(function* checkOldAnswers() {
        const oldSite = yield* loadOldSite;

        expect(oldSite.answers.length).toBeGreaterThanOrEqual(18);

        const headerNames = Object.keys(securityHeaders).toSorted();

        const pageAnswers = oldSite.answers.filter((row) => row.status === 200);

        for (const row of oldSite.answers) {
          expect(addressAnswer(row.path, oldSite.pages)).toEqual({
            location: row.location,
            status: row.status,
          });
          expect(Object.keys(row.headers).toSorted()).toEqual(headerNames);
        }

        expect(pageAnswers.length).toBeGreaterThan(0);

        for (const row of pageAnswers) {
          expect(row.headers).toEqual(securityHeaders);
        }
      })
  );

  test.effect(
    "the pricing page and the other pages keep their trailing slash",
    () =>
      Effect.gen(function* checkTrailingSlash() {
        const oldSite = yield* loadOldSite;

        expect(htmlHandling).toBe("force-trailing-slash");
        expect(addressAnswer("/pricing", oldSite.pages)).toEqual({
          location: "/pricing/",
          status: 308,
        });
        expect(addressAnswer("/blog", oldSite.pages)).toEqual({
          location: "/blog/",
          status: 308,
        });
        expect(addressAnswer("/about", oldSite.pages)).toEqual({
          location: "/about/",
          status: 308,
        });
        expect(addressAnswer("/features", oldSite.pages)).toEqual({
          location: "/",
          status: 301,
        });
        expect(legacyRedirects.at(0)?.source).toBe("/home2.html");
      })
  );

  test.effect(
    "an address that already ends in a slash answers without a redirect",
    () =>
      Effect.gen(function* checkNoRedirect() {
        const oldSite = yield* loadOldSite;
        const shipped = lines(redirectsFile(oldSite.pages));

        expect(addressAnswer("/pricing/", oldSite.pages)).toEqual({
          location: null,
          status: 200,
        });
        expect(addressAnswer("/", oldSite.pages)).toEqual({
          location: null,
          status: 200,
        });
        expect(shipped.some((line) => line.startsWith("/pricing/ "))).toBe(
          false
        );
        expect(shipped.some((line) => line.startsWith("/ "))).toBe(false);
        expect(
          shipped.some((line) => line.startsWith(`${installAddress.source} `))
        ).toBe(false);
      })
  );

  test.effect(
    "the rule file keeps every old redirect and leaves /install to the install scripts",
    () =>
      Effect.gen(function* checkRedirectFiles() {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        const oldRedirects = lines(
          yield* fs.readFileString(fixture(path, "old-redirects.txt"))
        );

        const shipped = lines(redirectsFile([]));

        expect(shipped).toEqual(
          oldRedirects.filter(
            (line) => !line.startsWith(`${installAddress.source} `)
          )
        );
      })
  );

  test.effect("the 3 old security headers are shipped unchanged", () =>
    Effect.gen(function* checkHeaders() {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      const oldHeaders = yield* fs.readFileString(
        fixture(path, "old-headers.txt")
      );

      const shipped = headersFile("");

      expect(securityHeaderLines).toHaveLength(3);

      for (const line of securityHeaderLines) {
        expect(oldHeaders).toContain(`  ${line}`);
        expect(shipped).toContain(`  ${line}`);
      }

      expect(shipped).toContain("/*");
      expect(headersFile(shipped)).toBe(shipped);
    })
  );

  test.effect(
    "an existing header file keeps its own rules and stays once-only",
    () =>
      Effect.sync(() => {
        const existing =
          "/install\n  Content-Type: text/plain; charset=utf-8\n";

        const merged = headersFile(existing);

        expect(merged.startsWith(existing)).toBe(true);
        expect(merged).toContain(securityHeaderLines[0] ?? "");
        expect(headersFile(merged)).toBe(merged);
      })
  );

  test.effect("old redirects run before the generated slash rules", () =>
    Effect.sync(() => {
      const shipped = lines(
        redirectsFile(["/features/", "/pricing/", "/pricing/"])
      );

      const slashRules = trailingSlashRedirects([
        "/features/",
        "/pricing/",
        "/pricing/",
      ]);

      expect(slashRules).toEqual([
        { destination: "/pricing/", source: "/pricing", status: 308 },
      ]);
      expect(shipped.at(-1)).toBe("/pricing /pricing/ 308");
    })
  );

  test.effect("a prerendered page list only offers directories", () =>
    Effect.sync(() => {
      const pages = prerenderedPagePaths(
        [
          "index.html",
          "pricing/index.html",
          "blog/tags/launch/index.html",
          "_astro/app.js",
          "_headers",
          "_redirects",
        ],
        "/"
      );

      expect(pages).toEqual(["/pricing/", "/blog/tags/launch/"]);
    })
  );

  test.effect(
    "the built site ships the rule file, the headers and a slash rule per page",
    () =>
      Effect.gen(function* checkBuild() {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const client = path.resolve(import.meta.dirname, "../dist/client");
        const listing = yield* fs.readDirectory(client, { recursive: true });

        const shipped = lines(
          yield* fs.readFileString(path.join(client, "_redirects"))
        );

        const headers = yield* fs.readFileString(path.join(client, "_headers"));

        for (const redirect of legacyRedirects) {
          expect(shipped).toContain(
            `${redirect.source} ${redirect.destination} ${redirect.status}`
          );
        }

        for (const pagePath of prerenderedPagePaths(listing, path.sep)) {
          const source = pagePath.replace(/\/+$/u, "");

          if (legacyRedirects.some((redirect) => redirect.source === source)) {
            continue;
          }

          expect(shipped).toContain(`${source} ${pagePath} 308`);
        }

        expect(
          shipped.some((line) => line.startsWith(`${installAddress.source} `))
        ).toBe(false);

        for (const line of securityHeaderLines) {
          expect(headers).toContain(`  ${line}`);
        }
      })
  );
});
