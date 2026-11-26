export interface PaintedLayer {
  readonly backgroundColor: string;
  readonly position: string;
  readonly tag: string;
  readonly zIndex: string;
}

const transparentColours = new Set([
  "transparent",
  "rgba(0,0,0,0)",
  "rgb(0 0 0 / 0)",
  "initial",
  "inherit",
  "unset",
]);

const customPropertyPattern = /(?<name>--[\w-]+)\s*:\s*(?<value>[^;}]+)/gu;

const colourReferencePattern = /var\(\s*(?<name>--[\w-]+)\s*\)/u;

export const customPropertiesIn = (css: string): ReadonlyMap<string, string> =>
  new Map(
    [...css.matchAll(customPropertyPattern)].map(
      (match) =>
        [match.groups?.name ?? "", (match.groups?.value ?? "").trim()] as const
    )
  );

export const resolveColour = (
  colour: string,
  customProperties: ReadonlyMap<string, string>
): string => {
  const name = colourReferencePattern.exec(colour)?.groups?.name;

  if (name === undefined) {
    return colour;
  }

  const resolved = customProperties.get(name);

  return resolved === undefined
    ? colour
    : resolveColour(resolved, customProperties);
};

export const isOpaque = (colour: string): boolean =>
  !transparentColours.has(colour.replaceAll(/\s+/gu, "").toLowerCase());

export const establishesStackingContext = (layer: PaintedLayer): boolean =>
  layer.position !== "static" && layer.zIndex !== "auto";

export const stacksBehindItsStackingContext = (layer: PaintedLayer): boolean =>
  layer.zIndex !== "auto" && Number(layer.zIndex) < 0;

export const paintsOverPageBackground = (
  glowWrapper: PaintedLayer,
  ancestors: readonly PaintedLayer[]
): boolean => {
  if (!stacksBehindItsStackingContext(glowWrapper)) {
    return true;
  }

  const boundary = ancestors.findIndex(establishesStackingContext);

  const paintedBehind =
    boundary === -1
      ? ancestors.filter((ancestor) => ancestor.tag !== "html")
      : ancestors.slice(0, boundary);

  return !paintedBehind.some((ancestor) => isOpaque(ancestor.backgroundColor));
};

const paintOrder = (layer: PaintedLayer): number =>
  layer.zIndex === "auto" ? 0 : Number(layer.zIndex);

export const contentCoversGlow = (
  content: PaintedLayer,
  glowWrapper: PaintedLayer
): boolean => paintOrder(content) > paintOrder(glowWrapper);
