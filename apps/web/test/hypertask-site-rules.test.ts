import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path, Schema } from "effect";

import { prerenderedPagePaths } from "../scripts/site-rules.js";
import {
  headersFile,
  htmlHandling,
  installAddress,
  legacyAnswer,
  legacyRedirects,
  redirectsFile,
  securityHeaderLines,
  trailingSlashRedirects,
} from "../src/hypertask/site-rules.js";

const OldSiteAnswer = Schema.Struct({
  location: Schema.NullOr(Schema.String),
  path: Schema.String,
  status: Schema.Int,
});

const OldSite = Schema.Struct({
  answers: Schema.Array(OldSiteAnswer),
  capturedAt: Schema.String,
  origin: Schema.String,
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

it.layer(NodeServices.layer)("hypertask site rules", (test) => {
  test.effect("every old address answers as the old site does", () =>
    Effect.gen(function* checkOldAnswers() {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      const oldSite = yield* fs
        .readFileString(fixture(path, "old-site.json"))
        .pipe(
          Effect.flatMap(
            Schema.decodeUnknownEffect(Schema.fromJsonString(OldSite))
          )
        );

      expect(oldSite.answers).toHaveLength(18);

      for (const answer of oldSite.answers) {
        if (answer.path === installAddress.source) {
          expect(legacyAnswer(answer.path)).toEqual({ kind: "passthrough" });
          continue;
        }

        expect(legacyAnswer(answer.path)).toEqual({
          kind: "redirect",
          location: answer.location,
          status: answer.status,
        });
      }
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
        expect(
          shipped.some((line) => line.startsWith(`${installAddress.source} `))
        ).toBe(false);
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

  test.effect(
    "the pricing page moves to its trailing-slash address and old redirects stay first",
    () =>
      Effect.sync(() => {
        const migrated = trailingSlashRedirects([
          "/pricing/",
          "/v2/",
          "/features/",
          "/",
          "/pricing/",
        ]);

        expect(htmlHandling).toBe("force-trailing-slash");
        expect(legacyAnswer("/pricing")).toEqual({ kind: "passthrough" });
        expect(migrated).toEqual([
          { destination: "/pricing/", source: "/pricing", status: 308 },
        ]);
        expect(legacyRedirects.at(0)?.source).toBe("/home2.html");
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
