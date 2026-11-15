import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path, Schema } from "effect";
import {
  classifyRequest,
  Rendered,
  toResponse,
} from "foldkit/experimental/server";

import {
  homeAnswerHeaders,
  htmlAnswerCacheControl,
  legacyAnswer,
  notFoundHandling,
  redirectAnswerBody,
  redirectAnswerCacheControl,
  redirectAnswerContentType,
  redirectResponse,
  securityHeaders,
  workerFirstRedirectSources,
} from "../src/hypertask/site-rules.js";

const CapturedAnswer = Schema.Struct({
  bodyEqualsHomePage: Schema.NullOr(Schema.Boolean),
  bodySha256: Schema.NullOr(Schema.String),
  cacheControl: Schema.String,
  contentType: Schema.String,
  headers: Schema.Record(Schema.String, Schema.String),
  headline: Schema.optional(Schema.String),
  method: Schema.Literals(["GET", "HEAD"]),
  normalizedBodySha256: Schema.NullOr(Schema.String),
  path: Schema.String,
  status: Schema.Int,
  title: Schema.optional(Schema.String),
});

const HomePage = Schema.Struct({
  bodySha256: Schema.String,
  headline: Schema.String,
  normalizedBodySha256: Schema.String,
  path: Schema.String,
  title: Schema.String,
});

const RedirectAnswer = Schema.Struct({
  body: Schema.String,
  cacheControl: Schema.String,
  capturedFrom: Schema.String,
  capturedWith: Schema.String,
  contentType: Schema.String,
  headers: Schema.Record(Schema.String, Schema.String),
  location: Schema.String,
  status: Schema.Int,
});

const UnknownAddressCapture = Schema.Struct({
  answers: Schema.Array(CapturedAnswer),
  bodyNormalization: Schema.String,
  capturedAt: Schema.String,
  capturedWith: Schema.String,
  homePage: HomePage,
  origin: Schema.String,
  redirectAnswer: RedirectAnswer,
});

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

const fixture = (path: Path.Path, name: string) =>
  path.join(
    path.resolve(import.meta.dirname, "fixtures/hypertask-site-rules"),
    name
  );

const loadCapture = Effect.gen(function* loadCapture() {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  return yield* fs
    .readFileString(fixture(path, "old-site-unknown.json"))
    .pipe(
      Effect.flatMap(
        Schema.decodeUnknownEffect(Schema.fromJsonString(UnknownAddressCapture))
      )
    );
});

const loadOldSite = Effect.gen(function* loadOldSite() {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  return yield* fs
    .readFileString(fixture(path, "old-site.json"))
    .pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(Schema.fromJsonString(OldSite)))
    );
});

const answerKind = (origin: string, path: string) =>
  classifyRequest(`${origin}${path}`);

it.layer(NodeServices.layer)("hypertask unknown addresses", (test) => {
  test.effect("every recorded unknown address keeps today's answer", () =>
    Effect.gen(function* checkUnknownAnswers() {
      const capture = yield* loadCapture;
      const paths = [...new Set(capture.answers.map((row) => row.path))];
      const headerNames = Object.keys(securityHeaders).toSorted();

      expect(capture.answers.length).toBeGreaterThanOrEqual(16);
      expect(paths.length).toBeGreaterThanOrEqual(8);
      expect(capture.homePage.path).toBe("/");

      for (const row of capture.answers) {
        const kind = answerKind(capture.origin, row.path);

        const recordedKind =
          row.path.endsWith(".png") ||
          row.path.endsWith(".js") ||
          row.path.endsWith(".xml")
            ? "PathAsset"
            : "Page";

        expect(Object.keys(row.headers).toSorted()).toEqual(headerNames);
        expect(kind).toBe(recordedKind);
        expect(row.status).toBe(200);

        if (kind === "Page") {
          expect(legacyAnswer(row.path).kind).toBe("passthrough");
          expect(row.cacheControl).toBe(htmlAnswerCacheControl);
          expect(homeAnswerHeaders).toEqual({
            ...securityHeaders,
            "cache-control": row.cacheControl,
          });
        } else {
          expect(notFoundHandling).toBe("single-page-application");
        }

        if (row.method === "GET") {
          expect(row.bodyEqualsHomePage).toBe(true);
          expect(row.normalizedBodySha256).toBe(
            capture.homePage.normalizedBodySha256
          );
          expect(row.title).toBe(capture.homePage.title);
          expect(row.headline).toBe(capture.homePage.headline);
        }
      }
    })
  );

  test.effect(
    "the home answer is a 200 HTML response with today's headers",
    () =>
      Effect.gen(function* checkHomeAnswer() {
        const capture = yield* loadCapture;

        const response = toResponse(
          () => "",
          Rendered(
            { html: "<main></main>", title: capture.homePage.title },
            { headers: homeAnswerHeaders }
          )
        );

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe(
          "text/html; charset=utf-8"
        );
        expect(response.headers.get("cache-control")).toBe(
          htmlAnswerCacheControl
        );

        for (const [name, value] of Object.entries(securityHeaders)) {
          expect(response.headers.get(name)).toBe(value);
        }
      })
  );

  test.effect(
    "every old redirect answers with the three security headers",
    () =>
      Effect.gen(function* checkRedirectAnswers() {
        const capture = yield* loadCapture;
        const oldSite = yield* loadOldSite;
        const redirects = oldSite.answers.filter((row) => row.status === 301);
        const recorded = capture.redirectAnswer;

        expect(redirects.length).toBeGreaterThan(0);
        expect(workerFirstRedirectSources.length).toBeLessThanOrEqual(100);
        expect(redirectAnswerContentType).toBe(recorded.contentType);
        expect(redirectAnswerCacheControl).toBe(recorded.cacheControl);
        expect(redirectAnswerBody(recorded.location)).toBe(recorded.body);

        for (const [name, value] of Object.entries(recorded.headers)) {
          expect(securityHeaders[name]).toBe(value);
        }

        for (const row of redirects) {
          expect(workerFirstRedirectSources).toContain(row.path);
          expect(legacyAnswer(row.path)).toEqual({
            kind: "redirect",
            location: row.location,
            status: row.status,
          });

          const response = redirectResponse(row.location ?? "", row.status);

          expect(response.status).toBe(row.status);
          expect(response.headers.get("location")).toBe(row.location);
          expect(response.headers.get("content-type")).toBe(
            redirectAnswerContentType
          );
          expect(response.headers.get("cache-control")).toBe(
            redirectAnswerCacheControl
          );

          for (const [name, value] of Object.entries(row.headers)) {
            expect(response.headers.get(name)).toBe(value);
          }
        }
      })
  );
});
