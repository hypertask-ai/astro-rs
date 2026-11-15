import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path, Schema } from "effect";
import * as Digest from "effect/crypto/Digest";

import { redirectsFile } from "../src/hypertask/site-rules.js";

const InstallAnswer = Schema.Struct({
  cacheControl: Schema.String,
  contentLength: Schema.Int,
  contentType: Schema.String,
  location: Schema.NullOr(Schema.String),
  path: Schema.String,
  sha256: Schema.String,
  status: Schema.Int,
  xContentTypeOptions: Schema.String,
});

const LiveInstallAnswers = Schema.Struct({
  answers: Schema.Array(InstallAnswer),
  capturedAt: Schema.String,
  origin: Schema.String,
});

const liveAnswers = Effect.gen(function* readLiveAnswers() {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  return yield* fs
    .readFileString(
      path.resolve(import.meta.dirname, "fixtures/install-scripts/live.json")
    )
    .pipe(
      Effect.flatMap(
        Schema.decodeUnknownEffect(Schema.fromJsonString(LiveInstallAnswers))
      )
    );
});

const sha256Hex = Effect.fn("sha256Hex")(function* sha256Hex(
  bytes: Uint8Array
) {
  const digest = yield* Digest.Digest;

  return yield* digest.digestHex(Digest.sha256, bytes);
});

it.layer(Layer.mergeAll(NodeServices.layer, Digest.layerWebCrypto))(
  "install scripts",
  (test) => {
    test.effect("serves every live install address", () =>
      Effect.gen(function* checkAnswers() {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const live = yield* liveAnswers;

        const headers = yield* fs.readFileString(
          path.resolve(import.meta.dirname, "../public/_headers")
        );

        const redirects = redirectsFile([]);

        expect(live.answers).toHaveLength(3);

        for (const answer of live.answers) {
          expect(answer.status).toBe(200);
          expect(answer.location).toBeNull();
          expect(headers).toContain(
            `${answer.path}\n  Content-Type: ${answer.contentType}`
          );
          expect(headers).toContain(
            `  X-Content-Type-Options: ${answer.xContentTypeOptions}`
          );
          expect(
            redirects
              .split("\n")
              .some((line) => line.startsWith(`${answer.path} `))
          ).toBe(false);
        }
      })
    );

    test.effect("ships the exact bytes the live site serves", () =>
      Effect.gen(function* checkBytes() {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const live = yield* liveAnswers;

        for (const answer of live.answers) {
          const bytes = yield* fs.readFile(
            path.resolve(import.meta.dirname, "../public", answer.path.slice(1))
          );

          expect(bytes).toHaveLength(answer.contentLength);
          expect(yield* sha256Hex(bytes)).toBe(answer.sha256);
        }
      })
    );

    test.effect("answers the short address with the shell script", () =>
      Effect.gen(function* checkShortAddress() {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const live = yield* liveAnswers;

        const short = live.answers.find((answer) => answer.path === "/install");

        const shell = live.answers.find(
          (answer) => answer.path === "/install.sh"
        );

        expect(short?.sha256).toBe(shell?.sha256);

        const publicDirectory = path.resolve(import.meta.dirname, "../public");

        const shortBytes = yield* fs.readFile(
          path.join(publicDirectory, "install")
        );

        const shellBytes = yield* fs.readFile(
          path.join(publicDirectory, "install.sh")
        );

        expect(shortBytes).toEqual(shellBytes);
      })
    );
  }
);
