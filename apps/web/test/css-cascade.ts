export interface Declaration {
  readonly media: string;
  readonly order: number;
  readonly property: string;
  readonly selector: string;
  readonly value: string;
}

const withoutComments = (css: string): string =>
  css.replaceAll(/\/\*[\s\S]*?\*\//gu, "");

export const declarationsIn = (css: string): readonly Declaration[] => {
  const declarations: Declaration[] = [];
  const open: string[] = [];
  let pending = "";

  const flush = (): void => {
    const declaration = pending.trim();
    const selector = open.at(-1) ?? "";
    const separator = declaration.indexOf(":");

    pending = "";

    if (
      declaration.length === 0 ||
      separator <= 0 ||
      selector.startsWith("@")
    ) {
      return;
    }

    declarations.push({
      media: open
        .flatMap((atRule) =>
          atRule.startsWith("@media ")
            ? [atRule.slice("@media ".length).trim()]
            : []
        )
        .join(" and "),
      order: declarations.length,
      property: declaration.slice(0, separator).trim().toLowerCase(),
      selector,
      value: declaration.slice(separator + 1).trim(),
    });
  };

  for (const character of withoutComments(css)) {
    if (character === "{") {
      open.push(pending.trim());
      pending = "";
    } else if (character === "}") {
      flush();
      open.pop();
      pending = "";
    } else if (character === ";") {
      flush();
    } else {
      pending += character;
    }
  }

  return declarations;
};

const withoutParens = (text: string): string => {
  let result = text.trim();

  while (result.startsWith("(") && result.endsWith(")")) {
    result = result.slice(1, -1).trim();
  }

  return result;
};

const withinBound = (
  operator: string,
  width: number,
  value: number
): boolean => {
  if (operator === "<") {
    return width < value;
  }

  if (operator === "<=") {
    return width <= value;
  }

  if (operator === ">") {
    return width > value;
  }

  return width >= value;
};

const motionPreference = (text: string): boolean | undefined => {
  if (/^prefers-reduced-motion\s*:\s*reduce$/u.test(text)) {
    return false;
  }

  if (/^prefers-reduced-motion\s*:\s*no-preference$/u.test(text)) {
    return true;
  }

  return undefined;
};

const widthTest = (source: string): ((width: number) => boolean) => {
  const text = source.trim();

  if (text.startsWith("not ")) {
    const inner = widthTest(text.slice("not ".length));

    return (width) => !inner(width);
  }

  const unwrapped = withoutParens(text);

  if (unwrapped !== text) {
    return widthTest(unwrapped);
  }

  if (unwrapped === "all" || unwrapped === "screen") {
    return () => true;
  }

  if (unwrapped === "print") {
    return () => false;
  }

  const preference = motionPreference(unwrapped);

  if (preference !== undefined) {
    return () => preference;
  }

  const match =
    /^(?<feature>min-width|max-width|width)\s*:?\s*(?<operator>>=|<=|>|<)?\s*(?<value>[\d.]+)px$/u.exec(
      unwrapped
    );

  if (match === null) {
    throw new TypeError(
      `Unreadable media query piece "${text}". Fix: teach css-cascade.ts the shape the build emits.`
    );
  }

  const value = Number(match.groups?.value ?? "");

  if (Number.isNaN(value)) {
    throw new TypeError(
      `Unreadable media query width in "${text}". Fix: teach css-cascade.ts the shape the build emits.`
    );
  }

  const feature = match.groups?.feature ?? "";

  const operator =
    match.groups?.operator ?? (feature === "max-width" ? "<=" : ">=");

  return (width) => withinBound(operator, width, value);
};

export const matchesWidth = (media: string, width: number): boolean =>
  media
    .split(/\s+and\s+/u)
    .filter((piece) => piece.trim().length > 0)
    .every((piece) => widthTest(piece)(width));

const classSpecificity = (
  selector: string,
  classes: readonly string[]
): number | undefined => {
  if (!/^(?:\.[\w-]+)+$/u.test(selector)) {
    return undefined;
  }

  const names = [...selector.matchAll(/\.(?<name>[\w-]+)/gu)].map(
    (match) => match.groups?.name ?? ""
  );

  return names.every((name) => classes.includes(name))
    ? names.length
    : undefined;
};

export const winningValue = (
  declarations: readonly Declaration[],
  classes: readonly string[],
  property: string,
  width: number
): string | undefined => {
  let winner: Declaration | undefined;
  let winnerSpecificity = 0;

  for (const declaration of declarations) {
    if (
      declaration.property !== property ||
      !matchesWidth(declaration.media, width)
    ) {
      continue;
    }

    const specificity = classSpecificity(declaration.selector, classes);

    if (specificity === undefined) {
      continue;
    }

    if (
      winner === undefined ||
      specificity > winnerSpecificity ||
      (specificity === winnerSpecificity && declaration.order > winner.order)
    ) {
      winner = declaration;
      winnerSpecificity = specificity;
    }
  }

  return winner?.value;
};

const amountIn = (
  text: string
): { readonly unit: string; readonly value: number } | undefined => {
  const match = /^(?<value>\d+(?:\.\d+)?)(?<unit>[a-z]*)$/u.exec(text.trim());

  return match === null
    ? undefined
    : {
        unit: match.groups?.unit ?? "",
        value: Number(match.groups?.value ?? ""),
      };
};

export const computedLineHeight = (
  fontSize: string,
  lineHeight: string
): string => {
  const height = amountIn(lineHeight);
  const size = amountIn(fontSize);

  if (height === undefined || size === undefined) {
    return lineHeight;
  }

  return height.unit === "" && size.unit === "px"
    ? `${height.value * size.value}px`
    : lineHeight;
};
