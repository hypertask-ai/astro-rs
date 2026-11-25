// @effect-diagnostics nodeBuiltinImport:off -- The test reads the stylesheets of the built home page, a file-system boundary.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "@effect/vitest";

import liveFont from "./fixtures/live-body-font.json" with { type: "json" };

const client = path.resolve(import.meta.dirname, "../dist/client");

const builtStylesheets = (): string =>
  readdirSync(client, { recursive: true })
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(path.join(client, file), "utf8"))
    .join("\n");

const declarationsIn = (css: string): readonly string[] =>
  [
    ...css.matchAll(/(?:--[\w-]+|font-family)\s*:\s*(?<value>[^;}]+)/gu),
  ].flatMap((match) => match.groups?.value ?? []);

const bodyFontStack = (css: string): string | undefined =>
  [...css.matchAll(/(?<![\w.#-])body\s*\{(?<body>[^{}]*)\}/gu)]
    .flatMap((match) =>
      [
        ...(match.groups?.body ?? "").matchAll(
          /font-family\s*:\s*(?<value>[^;}]+)/gu
        ),
      ].flatMap((declaration) => declaration.groups?.value ?? [])
    )
    .at(-1);

const comparable = (stack: string): string =>
  stack
    .replaceAll(/["']/gu, "")
    .split(",")
    .map((family) => family.trim().toLowerCase())
    .join(",");

describe("page font", () => {
  it("sets body text in the stack the live site uses", () => {
    const body = bodyFontStack(builtStylesheets());

    expect(body).toBeDefined();

    expect(comparable(body ?? "")).toBe(comparable(liveFont.body));
  });

  it("declares the IBM Plex Sans the live home page keeps", () => {
    expect(declarationsIn(builtStylesheets()).map(comparable)).toContain(
      comparable(liveFont.homeChrome)
    );
  });
});
