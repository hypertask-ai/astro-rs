import { PNG } from "pngjs";

export interface CaptureDiff {
  readonly diffImage: Buffer;
  readonly heightDelta: number;
  readonly noisePercent: number;
  readonly percent: number;
}

export interface NoiseMask {
  readonly differing: Uint8Array;
  readonly height: number;
  readonly percent: number;
  readonly width: number;
}

const INVISIBLE_CHARACTER = /\u00AD|\u200B|\u200C|\u200D|\u2060|\uFEFF/gu;

const WHITESPACE_RUN = /\s+/gu;

export const normalizeVisibleText = (raw: string): string =>
  raw
    .replaceAll(INVISIBLE_CHARACTER, "")
    .replaceAll(WHITESPACE_RUN, " ")
    .trim();

const squashedText = (raw: string): string =>
  normalizeVisibleText(raw).replaceAll(" ", "");

export const visibleTextsMatch = (oldRaw: string, newRaw: string): boolean =>
  squashedText(oldRaw) === squashedText(newRaw);

const channelDiffers = (
  first: PNG,
  firstOffset: number,
  second: PNG,
  secondOffset: number
): boolean =>
  first.data[firstOffset] !== second.data[secondOffset] ||
  first.data[firstOffset + 1] !== second.data[secondOffset + 1] ||
  first.data[firstOffset + 2] !== second.data[secondOffset + 2];

const offBy = (image: PNG, row: number, column: number): number =>
  (row * image.width + column) * 4;

const paintChanged = (image: PNG, offset: number): void => {
  image.data[offset] = 255;
  image.data[offset + 1] = 0;
  image.data[offset + 2] = 0;
  image.data[offset + 3] = 255;
};

const paintIgnored = (image: PNG, offset: number): void => {
  image.data[offset] = 153;
  image.data[offset + 1] = 153;
  image.data[offset + 2] = 153;
  image.data[offset + 3] = 64;
};

export const noiseMaskOf = (first: Buffer, second: Buffer): NoiseMask => {
  const left = PNG.sync.read(first);
  const right = PNG.sync.read(second);
  const width = Math.min(left.width, right.width);
  const height = Math.min(left.height, right.height);
  const differing = new Uint8Array(width * height);
  const total = width * height;

  let changed = 0;

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      if (
        channelDiffers(
          left,
          offBy(left, row, column),
          right,
          offBy(right, row, column)
        )
      ) {
        differing[row * width + column] = 1;
        changed += 1;
      }
    }
  }

  return {
    differing,
    height,
    percent: total === 0 ? 0 : (changed / total) * 100,
    width,
  };
};

const ignoredByNoise = (
  noise: NoiseMask,
  row: number,
  column: number
): boolean =>
  column < noise.width &&
  row < noise.height &&
  noise.differing[row * noise.width + column] === 1;

export const mergeNoise = (first: NoiseMask, second: NoiseMask): NoiseMask => {
  const width = Math.min(first.width, second.width);
  const height = Math.min(first.height, second.height);
  const differing = new Uint8Array(width * height);
  const total = width * height;

  let changed = 0;

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      if (
        ignoredByNoise(first, row, column) ||
        ignoredByNoise(second, row, column)
      ) {
        differing[row * width + column] = 1;
        changed += 1;
      }
    }
  }

  return {
    differing,
    height,
    percent: total === 0 ? 0 : (changed / total) * 100,
    width,
  };
};

export const compareCaptures = (
  before: Buffer,
  after: Buffer,
  noise: NoiseMask
): CaptureDiff => {
  const oldImage = PNG.sync.read(before);
  const newImage = PNG.sync.read(after);
  const width = Math.min(oldImage.width, newImage.width);
  const height = Math.min(oldImage.height, newImage.height);
  const diffImage = new PNG({ height, width });

  let changed = 0;
  let compared = 0;

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const target = offBy(diffImage, row, column);

      if (ignoredByNoise(noise, row, column)) {
        paintIgnored(diffImage, target);

        continue;
      }

      compared += 1;

      if (
        channelDiffers(
          oldImage,
          offBy(oldImage, row, column),
          newImage,
          offBy(newImage, row, column)
        )
      ) {
        changed += 1;
        paintChanged(diffImage, target);
      }
    }
  }

  return {
    diffImage: PNG.sync.write(diffImage),
    heightDelta: newImage.height - oldImage.height,
    noisePercent: noise.percent,
    percent: compared === 0 ? 0 : (changed / compared) * 100,
  };
};

export const heightReasonOf = (delta: number): string =>
  `height ${delta > 0 ? "grew" : "shrank"} by ${Math.abs(delta)} ${Math.abs(delta) === 1 ? "pixel" : "pixels"}`;
