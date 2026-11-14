import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path, Schema } from "effect";

import {
  headersFile,
  htmlHandling,
  installRewrite,
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

const indexPagePattern = /^(.+)\/index\.html$/u;

const indexPagePaths = (
  files: readonly string[],
  separator: string
): readonly string[] =>
  files
    .map((file) => file.split(separator).join("/"))
    .flatMap((file) => {
      const directory = indexPagePattern.exec(file)?.[1];

      return directory === undefined ? [] : [`/${directory}/`];
    });

const lines = (file: string) =>
  file
    .trim()
    .split("\n")
    .map((line) => line.trim());

const fixture = (path: Path.Path, name: string) =>
  path.join(
    path.fromFileUrl(
      new URL("./fixtures/hypertask-site-rules/", import.meta.url)
    ),
    name
  );

it.layer(NodeServices.layer)("hypertask site rules", (test) => {
  test.effect("every old address answers as the old site does", () =>
    Effect.gen(function* checkOldAnswers() {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const oldSite = Schema.decodeUnknownSync(OldSite)(
        JSON.parse(yield* fs.readFileString(fixture(path, "old-site.json")))
      );

      expect(oldSite.answers).toHaveLength(18);

      for (const answer of oldSite.answers) {
        const shipped = legacyAnswer(answer.path);

        if (answer.path === installRewrite.source) {
          expect(shipped).toEqual({ kind: "passthrough" });
          continue;
        }

        expect(shipped).toEqual({
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

        expect(lines(redirectsFile([]))).toEqual(
          oldRedirects.filter(
            (line) => !line.startsWith(`${installRewrite.source} `)
          )
        );
        expect(
          lines(redirectsFile([])).some((line) =>
            line.startsWith(`${installRewrite.source} `)
          )
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
    "the pricing page moves to its trailing-slash address and old redirects stay first",
    () =>
      Effect.gen(function* checkTrailingSlash() {
        const migrated = trailingSlashRedirects([
          "/pricing/",
          "/v2/",
          "/features/",
          "/",
        ]);

        expect(htmlHandling).toBe("force-trailing-slash");
        expect(legacyAnswer("/pricing")).toEqual({ kind: "passthrough" });
        expect(migrated).toEqual([
          { destination: "/pricing/", source: "/pricing", status: 308 },
        ]);
        expect(legacyRedirects.at(0)?.source).toBe("/home2.html");
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

        for (const pagePath of indexPagePaths(listing, path.sep)) {
          const source = pagePath.replace(/\/+$/u, "");

          if (legacyRedirects.some((redirect) => redirect.source === source)) {
            continue;
          }

          expect(shipped).toContain(`${source} ${pagePath} 308`);
        }

        expect(
          shipped.some((line) => line.startsWith(`${installRewrite.source} `))
        ).toBe(false);

        for (const line of securityHeaderLines) {
          expect(headers).toContain(`  ${line}`);
        }
      })
  );
});
