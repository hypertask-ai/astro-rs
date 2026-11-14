import { NodeCrypto, NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as Digest from "effect/crypto/Digest";

import { installScriptHeaders } from "../scripts/install-scripts.js";

const oldSiteDigests = new Map([
  [
    "install.ps1",
    "ce17de828544ae531d263d2be9d8f171fac6905c12af361887d2e33bff0954ea",
  ],
  [
    "install.sh",
    "a83f0798bf63b0b2c042edda837161c988519f8b39c1f7a823a1ed3a8df1ea26",
  ],
]);

const shippedScripts = [
  { path: "/install", source: "install.sh" },
  { path: "/install.ps1", source: "install.ps1" },
  { path: "/install.sh", source: "install.sh" },
];

it.layer(Layer.mergeAll(NodeServices.layer, NodeCrypto.layerDigest))(
  "install scripts",
  (test) => {
    test.effect(
      "both scripts keep the bytes the old site serves and ship at three plain-text addresses",
      () =>
        Effect.gen(function* checkInstallScripts() {
          const fs = yield* FileSystem.FileSystem;
          const paths = yield* Path.Path;
          const digest = yield* Digest.Digest;
          const root = paths.resolve(import.meta.dirname, "..");
          const staticDirectory = paths.join(root, "static");
          const client = paths.join(root, "dist/client");

          for (const [name, expected] of oldSiteDigests) {
            const bytes = yield* fs.readFile(paths.join(staticDirectory, name));

            expect(yield* digest.digestHex(Digest.sha256, bytes)).toBe(
              expected
            );
          }

          for (const script of shippedScripts) {
            const source = yield* fs.readFile(
              paths.join(staticDirectory, script.source)
            );
            const shipped = yield* fs.readFile(`${client}${script.path}`);

            expect(Array.from(shipped)).toEqual(Array.from(source));
          }

          const headers = yield* fs.readFileString(`${client}/_headers`);

          expect(headers).toContain(installScriptHeaders);
        })
    );
  }
);
