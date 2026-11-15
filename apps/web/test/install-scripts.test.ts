// @effect-diagnostics nodeBuiltinImport:off -- The test reads the shipped script files and hashes them, a file-system boundary.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "@effect/vitest";

const publicDirectory = new URL("../public/", import.meta.url);

const addresses = ["/install", "/install.sh", "/install.ps1"];

const read = (name: string) => readFileSync(new URL(name, publicDirectory));

const digest = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

describe("install scripts", () => {
  it("keeps the exact bytes the old site serves", () => {
    expect(digest(read("install.sh"))).toBe(
      "a83f0798bf63b0b2c042edda837161c988519f8b39c1f7a823a1ed3a8df1ea26"
    );
    expect(digest(read("install.ps1"))).toBe(
      "ce17de828544ae531d263d2be9d8f171fac6905c12af361887d2e33bff0954ea"
    );
  });

  it("serves the short install address with the shell script bytes", () => {
    expect(read("install").equals(read("install.sh"))).toBe(true);
  });

  it("serves every install address as plain text", () => {
    const headers = read("_headers").toString("utf-8");

    for (const address of addresses) {
      expect(headers).toContain(
        `${address}\n  Content-Type: text/plain; charset=utf-8`
      );
    }
  });
});
