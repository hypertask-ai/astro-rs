import * as stylex from "@stylexjs/stylex";
import type { Html, HtmlBuilder } from "foldkit/html";

import type { AppMessage } from "../../client/app/message.js";

const desktop = "@media (min-width: 1024px)";

const reducedMotion = "@media (prefers-reduced-motion: reduce)";

export type CtaSize = "hero" | "large";

export type CtaVariant = "primary" | "secondary";

export interface CtaLink {
  readonly external?: boolean;
  readonly href: string;
  readonly id?: string;
  readonly label: string;
}

const classes = (...entries: readonly (stylex.StyleXStyles | false)[]) =>
  stylex.props(...entries).className ?? "";

export const ctaStyles = stylex.create({
  base: {
    alignItems: "center",
    borderRadius: "6px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    display: "inline-flex",
    gap: "8px",
    justifyContent: "center",
    transitionDuration: { default: "200ms", [reducedMotion]: "0.01ms" },
    transitionProperty: "background-color, border-color, color",
    whiteSpace: "nowrap",
  },
  hero: {
    fontSize: { default: "14px", [desktop]: "16px" },
    fontWeight: 600,
    paddingBlock: "12px",
    paddingInline: "32px",
  },
  large: {
    fontSize: { default: "16px", [desktop]: "18px" },
    fontWeight: 600,
    paddingBlock: { default: "12px", [desktop]: "16px" },
    paddingInline: { default: "32px", [desktop]: "40px" },
  },
  primary: {
    backgroundColor: { ":hover": "#f9fafb", default: "#ffffff" },
    borderColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: "1px",
    color: "#000000",
  },
  secondary: {
    backgroundColor: {
      ":hover": "rgba(255, 255, 255, 0.1)",
      default: "#000000",
    },
    borderColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: "1px",
    color: "#ffffff",
  },
});

export const ctaLink = (
  h: HtmlBuilder<AppMessage>,
  link: CtaLink,
  variant: CtaVariant,
  size: CtaSize
): Html =>
  h.a(
    [
      ...(link.id === undefined ? [] : [h.Id(link.id)]),
      h.Href(link.href),
      ...(link.external === true
        ? [h.Target("_blank"), h.Rel("noopener noreferrer")]
        : []),
      h.Class(
        classes(
          ctaStyles.base,
          size === "hero" ? ctaStyles.hero : ctaStyles.large,
          variant === "primary" ? ctaStyles.primary : ctaStyles.secondary
        )
      ),
    ],
    [link.label]
  );
