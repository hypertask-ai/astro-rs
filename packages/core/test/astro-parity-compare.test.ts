import { describe, expect, it } from "@effect/vitest";
import { PNG } from "pngjs";

import {
  compareCaptures,
  heightReasonOf,
  mergeNoise,
  noiseMaskOf,
  normalizeVisibleText,
  visibleTextsMatch,
} from "../../../scripts/astro-parity-compare.js";

type Color = readonly [number, number, number];

const WHITE: Color = [255, 255, 255];

const BLACK: Color = [0, 0, 0];

const captureOf = (
  width: number,
  height: number,
  pixels: readonly Color[]
): Buffer => {
  const image = new PNG({ height, width });

  for (const [index, [red, green, blue]] of pixels.entries()) {
    image.data[index * 4] = red;
    image.data[index * 4 + 1] = green;
    image.data[index * 4 + 2] = blue;
    image.data[index * 4 + 3] = 255;
  }

  return PNG.sync.write(image);
};

const filled = (width: number, height: number, color: Color = WHITE): Buffer =>
  captureOf(
    width,
    height,
    Array.from({ length: width * height }, () => color)
  );

const unvaryingMask = (capture: Buffer) => noiseMaskOf(capture, capture);

describe("parity visible text", () => {
  it("ignores whitespace that moved between elements", () => {
    const oldText = "Join  the   waitlist\n\nStart now";
    const newText = "\nJoin the waitlist Start now  ";

    expect(normalizeVisibleText(oldText)).toBe("Join the waitlist Start now");
    expect(visibleTextsMatch(oldText, newText)).toBe(true);
  });

  it("ignores whitespace that a stylesheet replaces", () => {
    expect(visibleTextsMatch("Home / Blog", "Home/Blog")).toBe(true);
  });

  it("ignores invisible characters that never render", () => {
    const oldText = "Plans\u200B and\u00A0pricing";
    const newText = "Plans and pricing";

    expect(normalizeVisibleText(oldText)).toBe("Plans and pricing");
    expect(visibleTextsMatch(oldText, newText)).toBe(true);
  });

  it("keeps every rendered word apart", () => {
    expect(visibleTextsMatch("Plans and pricing", "Plans and price")).toBe(
      false
    );
  });

  it("keeps a separator apart from its neighbours", () => {
    expect(visibleTextsMatch("Home / Blog", "Home Blog")).toBe(false);
  });

  it("tells text that is absent from text that is empty", () => {
    expect(visibleTextsMatch("", "")).toBe(true);
    expect(visibleTextsMatch("", "Pricing")).toBe(false);
  });
});

describe("parity pixel comparison", () => {
  it("scores the whole capture when both heights match", () => {
    const before = captureOf(2, 2, [BLACK, WHITE, WHITE, WHITE]);
    const after = filled(2, 2);

    const diff = compareCaptures(before, after, unvaryingMask(before));

    expect(diff.heightDelta).toBe(0);
    expect(diff.percent).toBe(25);
    expect(diff.diffImage.length).toBeGreaterThan(0);
  });

  it("compares the overlapping area when the new capture is taller", () => {
    const before = filled(2, 2);
    const after = filled(2, 3);

    const diff = compareCaptures(before, after, unvaryingMask(before));

    expect(diff.heightDelta).toBe(1);
    expect(diff.percent).toBe(0);
    expect(heightReasonOf(diff.heightDelta)).toBe("height grew by 1 pixel");
  });

  it("compares the overlapping area when the old capture is taller", () => {
    const before = captureOf(2, 2, [BLACK, WHITE, WHITE, WHITE]);
    const after = filled(2, 1);

    const diff = compareCaptures(before, after, unvaryingMask(before));

    expect(diff.heightDelta).toBe(-1);
    expect(diff.percent).toBe(50);
    expect(heightReasonOf(diff.heightDelta)).toBe("height shrank by 1 pixel");
  });

  it("reports a height difference in whole pixels", () => {
    expect(heightReasonOf(12)).toBe("height grew by 12 pixels");
    expect(heightReasonOf(-12)).toBe("height shrank by 12 pixels");
  });

  it("ignores pixels that moved between two captures of the same site", () => {
    const first = captureOf(2, 2, [BLACK, WHITE, WHITE, WHITE]);
    const second = filled(2, 2);
    const mask = noiseMaskOf(first, second);

    const diff = compareCaptures(first, second, mask);

    expect(mask.percent).toBe(25);
    expect(diff.noisePercent).toBe(25);
    expect(diff.percent).toBe(0);
  });

  it("keeps a real difference outside the noise mask", () => {
    const first = captureOf(2, 2, [BLACK, WHITE, WHITE, WHITE]);
    const second = filled(2, 2);
    const mask = noiseMaskOf(first, second);
    const after = captureOf(2, 2, [WHITE, WHITE, WHITE, BLACK]);

    const diff = compareCaptures(first, after, mask);

    expect(diff.percent).toBeCloseTo(100 / 3, 6);
  });

  it("reports a noise baseline of zero for two identical captures", () => {
    const capture = filled(3, 4);

    const mask = noiseMaskOf(capture, capture);

    expect(mask.percent).toBe(0);
    expect(mask.width).toBe(3);
    expect(mask.height).toBe(4);
  });

  it("ignores a band that only moved in one of the two sites", () => {
    const oldFirst = filled(2, 2);
    const oldSecond = filled(2, 2);
    const newFirst = captureOf(2, 2, [WHITE, WHITE, WHITE, BLACK]);
    const newSecond = filled(2, 2);

    const noise = mergeNoise(
      noiseMaskOf(oldFirst, oldSecond),
      noiseMaskOf(newFirst, newSecond)
    );

    const diff = compareCaptures(oldFirst, newFirst, noise);

    expect(noise.percent).toBe(25);
    expect(diff.percent).toBe(0);
  });

  it("keeps a difference that is stable on both sites", () => {
    const oldFirst = captureOf(2, 2, [WHITE, WHITE, WHITE, BLACK]);
    const oldSecond = oldFirst;
    const newFirst = filled(2, 2);
    const newSecond = newFirst;

    const noise = mergeNoise(
      noiseMaskOf(oldFirst, oldSecond),
      noiseMaskOf(newFirst, newSecond)
    );

    const diff = compareCaptures(oldFirst, newFirst, noise);

    expect(noise.percent).toBe(0);
    expect(diff.percent).toBe(25);
  });
});
