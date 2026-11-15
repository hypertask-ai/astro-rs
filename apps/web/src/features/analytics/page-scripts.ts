import { fathomScriptUrl } from "./fathom.js";

export type ScriptPlacement = "head" | "body";

export type ScriptCarrier =
  | "head-markup"
  | "page-markup"
  | "client-entry"
  | "client-command"
  | "client-subscription"
  | "astro-runtime"
  | "cloudflare";

export type ScriptIdentity =
  | Readonly<{ kind: "attribute"; name: string }>
  | Readonly<{ kind: "inline"; marker: string }>
  | Readonly<{ kind: "source"; src: string }>
  | Readonly<{ kind: "source-pattern"; pattern: string }>
  | Readonly<{ kind: "structured-data"; graphType: string }>;

export type ObservedScript = Readonly<{
  attributes: readonly string[];
  graphType: string | null;
  inline: string;
  src: string | null;
  type: string | null;
}>;

export type PageScriptSlot = Readonly<{
  attributes: readonly string[];
  carriedBy: ScriptCarrier;
  id: string;
  identity: ScriptIdentity;
  placement: ScriptPlacement;
  recordedOn: readonly string[];
  type: string | null;
  waitsFor: string;
}>;

const liveHome = "/";

const livePost = "/blog/ai-task-manager/";

const everyRecordedPage = [liveHome, livePost];

const identityHolds = (
  identity: ScriptIdentity,
  script: ObservedScript
): boolean => {
  switch (identity.kind) {
    case "attribute": {
      return script.attributes.some(
        (attribute) =>
          attribute === identity.name ||
          attribute.startsWith(`${identity.name}=`)
      );
    }

    case "inline": {
      return script.inline.includes(identity.marker);
    }

    case "source": {
      return script.src === identity.src;
    }

    case "source-pattern": {
      return (
        script.src !== null &&
        new RegExp(identity.pattern, "u").test(script.src)
      );
    }

    case "structured-data": {
      return script.graphType === identity.graphType;
    }

    default: {
      return identity satisfies never;
    }
  }
};

export const pageScripts: readonly PageScriptSlot[] = [
  {
    attributes: [],
    carriedBy: "head-markup",
    id: "home-redirect",
    identity: { kind: "inline", marker: "ht_in=1" },
    placement: "head",
    recordedOn: [liveHome],
    type: null,
    waitsFor:
      "Nothing. It runs while the head parses, so a returning app user leaves the marketing page before it paints.",
  },
  {
    attributes: [],
    carriedBy: "head-markup",
    id: "organization-json-ld",
    identity: { graphType: "Organization", kind: "structured-data" },
    placement: "head",
    recordedOn: everyRecordedPage,
    type: "application/ld+json",
    waitsFor: "Nothing. Crawler data, never executed.",
  },
  {
    attributes: ['data-site="SSBYTYUQ"', "defer"],
    carriedBy: "head-markup",
    id: "fathom",
    identity: { kind: "source", src: fathomScriptUrl },
    placement: "head",
    recordedOn: everyRecordedPage,
    type: null,
    waitsFor:
      "The HTML parse. It is deferred, so it runs in document order after the parse and before DOMContentLoaded, which puts the tracker in place before a click can read it.",
  },
  {
    attributes: [],
    carriedBy: "head-markup",
    id: "page-json-ld",
    identity: { graphType: "BlogPosting", kind: "structured-data" },
    placement: "head",
    recordedOn: [livePost],
    type: "application/ld+json",
    waitsFor: "Nothing. Crawler data, never executed.",
  },
  {
    attributes: ["data-foldkit-flags"],
    carriedBy: "client-entry",
    id: "foldkit-flags",
    identity: { kind: "attribute", name: "data-foldkit-flags" },
    placement: "body",
    recordedOn: [],
    type: "application/json",
    waitsFor:
      "The render that produced it. It carries the Foldkit flags payload beside the page root and is read by the client entry.",
  },
  {
    attributes: [],
    carriedBy: "client-entry",
    id: "client-entry",
    identity: { kind: "source-pattern", pattern: "^/assets/[^/]+\\.js$" },
    placement: "body",
    recordedOn: [],
    type: "module",
    waitsFor:
      "The HTML parse. It is a module at the end of the body, so it runs after every deferred head script and then hydrates the page.",
  },
  {
    attributes: [],
    carriedBy: "astro-runtime",
    id: "astro-loader",
    identity: { kind: "inline", marker: "self.Astro" },
    placement: "body",
    recordedOn: everyRecordedPage,
    type: null,
    waitsFor:
      "Nothing. The old site's Astro runtime loader, replaced by the client entry on the new site.",
  },
  {
    attributes: [],
    carriedBy: "astro-runtime",
    id: "astro-island",
    identity: { kind: "inline", marker: "Object.defineProperty" },
    placement: "body",
    recordedOn: everyRecordedPage,
    type: null,
    waitsFor:
      "The island markup above it. The old site's hydration payload, replaced by the client entry on the new site.",
  },
  {
    attributes: [],
    carriedBy: "client-subscription",
    id: "login-key",
    identity: { kind: "inline", marker: "addEventListener('keydown'" },
    placement: "body",
    recordedOn: everyRecordedPage,
    type: null,
    waitsFor:
      "The frame markup, because it reads the login link it follows. The login shortcut subscription owns it on the new site.",
  },
  {
    attributes: [],
    carriedBy: "client-subscription",
    id: "scroll-border",
    identity: { kind: "inline", marker: "getElementById('main-header')" },
    placement: "body",
    recordedOn: everyRecordedPage,
    type: null,
    waitsFor:
      "The header markup. The scrolled subscription owns it on the new site.",
  },
  {
    attributes: [],
    carriedBy: "page-markup",
    id: "pricing-module",
    identity: { kind: "inline", marker: "data-pricing-module" },
    placement: "body",
    recordedOn: [liveHome],
    type: null,
    waitsFor:
      "The pricing markup above it. It only exists on a page that renders the pricing module.",
  },
  {
    attributes: [],
    carriedBy: "page-markup",
    id: "install-tabs",
    identity: { kind: "inline", marker: "data-install" },
    placement: "body",
    recordedOn: [liveHome],
    type: null,
    waitsFor:
      "The install markup above it. It only exists on a page that renders the install tabs.",
  },
  {
    attributes: [],
    carriedBy: "client-command",
    id: "cookie-consent",
    identity: {
      kind: "source-pattern",
      pattern: "^/_astro/CookieConsent\\..+\\.js$",
    },
    placement: "body",
    recordedOn: everyRecordedPage,
    type: "module",
    waitsFor:
      "The cookie banner markup above it. The consent command owns it on the new site.",
  },
  {
    attributes: [
      'data-cfasync="false"',
      'data-mode="floating"',
      'data-nudge-delay="20"',
    ],
    carriedBy: "client-command",
    id: "help-chat",
    identity: {
      kind: "source",
      src: "https://help.hypertask.ai/widget/widget.js",
    },
    placement: "body",
    recordedOn: everyRecordedPage,
    type: null,
    waitsFor:
      "The page body, because the widget reads data-mode from the tag it finds. The help chat command appends it on the new site.",
  },
  {
    attributes: [],
    carriedBy: "client-command",
    id: "sign-up-click",
    identity: { kind: "inline", marker: "closest('a[href]')" },
    placement: "body",
    recordedOn: everyRecordedPage,
    type: null,
    waitsFor:
      "The page body. The listener sits on the document, so it is in place before the first app link is clicked.",
  },
  {
    attributes: ["defer"],
    carriedBy: "cloudflare",
    id: "rocket-loader",
    identity: {
      kind: "source-pattern",
      pattern: "^/cdn-cgi/scripts/.+/rocket-loader\\.min\\.js$",
    },
    placement: "body",
    recordedOn: everyRecordedPage,
    type: null,
    waitsFor:
      "Nothing. Cloudflare adds it to the old site and rewrites the type of every script above it. The new site does not carry it.",
  },
];

export const slotForScript = (
  script: ObservedScript,
  slots: readonly PageScriptSlot[] = pageScripts
): PageScriptSlot | undefined =>
  slots.find((slot) => identityHolds(slot.identity, script));
