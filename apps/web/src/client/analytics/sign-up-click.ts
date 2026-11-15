import { Option, Predicate, Schema } from "effect";

import { appOrigin, signUpClickEvent } from "../../features/analytics/fathom.js";

type LinkElement = Readonly<{ href: string }>;

type ClosestCapable = Readonly<{
  closest: (selector: string) => LinkElement | null;
}>;

export type SignUpTracker = Readonly<{
  trackEvent: (event: string) => void;
}>;

declare global {
  interface Window {
    readonly fathom?: SignUpTracker;
  }
}

export type ClickEvent = Readonly<{ target: unknown }>;

export type ClickListener = (event: ClickEvent) => void;

export type ClickDocument = Readonly<{
  addEventListener: (type: "click", listener: ClickListener) => void;
}>;

const ClosestTarget = Schema.declare<ClosestCapable>(
  (value): value is ClosestCapable =>
    Predicate.hasProperty(value, "closest") &&
    Predicate.isFunction(value.closest)
);

const Link = Schema.declare<LinkElement>(
  (value): value is LinkElement =>
    Predicate.hasProperty(value, "href") && Predicate.isString(value.href)
);

const decodeClosestTarget = Schema.decodeUnknownOption(ClosestTarget);

const decodeLink = Schema.decodeUnknownOption(Link);

export const clickedAppAddress = (event: ClickEvent): string | null => {
  const target = decodeClosestTarget(event.target);

  if (Option.isNone(target)) {
    return null;
  }

  const link = decodeLink(target.value.closest("a[href]"));

  return Option.isSome(link) ? link.value.href : null;
};

export const signUpEventFor = (href: string | null): string | null =>
  href !== null && href.startsWith(appOrigin) ? signUpClickEvent : null;

export const installSignUpClicks = (
  clickDocument: ClickDocument,
  track: (event: string) => void
): void => {
  clickDocument.addEventListener("click", (event) => {
    const eventName = signUpEventFor(clickedAppAddress(event));

    if (eventName !== null) {
      track(eventName);
    }
  });
};
