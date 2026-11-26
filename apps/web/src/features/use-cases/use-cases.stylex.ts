import * as stylex from "@stylexjs/stylex";

import { site } from "../tokens.stylex.js";

const min640 = "@media (min-width: 640px)";

const min768 = "@media (min-width: 768px)";

const min1024 = "@media (min-width: 1024px)";

const glow = `linear-gradient(to right, rgba(126, 34, 206, 0.25), rgba(192, 38, 211, 0.2), rgba(168, 85, 247, 0.25))`;

const overlayImageFirstDesktop = `radial-gradient(90% 63% at 100% 100%, rgba(0, 0, 0, 0.35) 10%, rgba(0, 0, 0, 0) 64%), linear-gradient(300deg, rgba(0, 0, 0, 0.85) 8%, rgba(0, 0, 0, 0.25) 30%, rgba(0, 0, 0, 0) 78%), radial-gradient(65% 49% at 100% 0%, rgba(0, 0, 0, 1) 2%, rgba(0, 0, 0, 0) 94%)`;

const overlayImageFirstPhone = `radial-gradient(130% 80% at 0% 100%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.0) 65%), linear-gradient(50deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.0) 75%)`;

const overlayTextFirstDesktop = `radial-gradient(120% 70% at 100% 100%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 70%), linear-gradient(300deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.0) 70%), radial-gradient(60% 45% at 100% 0%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.0) 80%)`;

const overlayTextFirstPhone = `radial-gradient(130% 80% at 100% 100%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 65%), linear-gradient(310deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.0) 75%)`;

const buttonShadow =
  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)";

const buttonRing = `${buttonShadow}, 0 0 0 1px #d4d4d4`;

export const styles = stylex.create({
  bullet: {
    margin: 0,
  },
  bulletList: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "16px",
    lineHeight: 1.5,
    listStyleType: "disc",
    margin: 0,
    paddingLeft: "24px",
  },
  bulletSpaced: {
    marginTop: "8px",
  },
  bullets: {
    marginTop: "24px",
  },
  bulletsTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "20px",
    marginBottom: "12px",
    marginTop: 0,
  },
  copy: {
    gridColumn: { default: "auto", [min1024]: "span 5 / span 5" },
  },
  copyFirst: {
    gridColumn: { default: "auto", [min1024]: "span 5 / span 5" },
    order: { default: 0, [min1024]: 1 },
  },
  cta: {
    ":focus-visible": {
      boxShadow: buttonRing,
      outline: "none",
    },
    alignItems: "center",
    borderRadius: "6px",
    boxShadow: buttonShadow,
    display: "inline-flex",
    gap: "8px",
    justifyContent: "center",
    textDecoration: "none",
    transitionDuration: "150ms",
    transitionProperty: "color, background-color, border-color",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
  },
  ctaBody: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: { default: "16px", [min768]: "18px" },
    lineHeight: 1.625,
    margin: 0,
    maxWidth: "768px",
  },
  ctaCard: {
    backgroundImage:
      "linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    borderStyle: "solid",
    borderWidth: "1px",
    padding: { default: "24px", [min768]: "40px" },
    width: "100%",
  },
  ctaGlow: {
    backgroundImage: glow,
    borderRadius: "24px",
    filter: "blur(64px)",
    height: "256px",
    marginInline: "auto",
    opacity: 0.6,
    width: "90%",
  },
  ctaGlowWrap: {
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
    zIndex: -10,
  },
  ctaHero: {
    fontSize: { default: "14px", [min1024]: "16px" },
    fontWeight: 600,
    lineHeight: { default: "20px", [min1024]: "24px" },
    paddingBlock: "12px",
    paddingInline: "32px",
  },
  ctaInner: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: { default: "16px", [min1024]: "24px" },
    textAlign: "center",
    width: "100%",
  },
  ctaLarge: {
    fontSize: { default: "16px", [min1024]: "18px" },
    fontWeight: 600,
    lineHeight: { default: "24px", [min1024]: "28px" },
    paddingBlock: { default: "12px", [min1024]: "16px" },
    paddingInline: { default: "32px", [min1024]: "40px" },
  },
  ctaPrimary: {
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  ctaRow: {
    alignItems: "center",
    display: "flex",
    flexDirection: { default: "column", [min640]: "row" },
    gap: "16px",
  },
  ctaSecondary: {
    ":hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
    backgroundColor: "transparent",
    borderColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: "1px",
    color: "#ffffff",
  },
  ctaSection: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    marginInline: "auto",
    maxWidth: "1344px",
    paddingBlock: { default: "48px", [min1024]: "64px" },
    paddingInline: { default: "16px", [min1024]: "32px" },
    position: "relative",
    width: "100%",
  },
  ctaShell: {
    paddingBlock: "60px",
  },
  ctaTitle: {
    color: "#ffffff",
    fontSize: { default: "24px", [min640]: "30px", [min768]: "36px" },
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: { default: "30px", [min640]: "36px", [min768]: "40px" },
    margin: 0,
    textWrap: "balance",
  },
  eyebrow: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.1em",
    lineHeight: "16px",
    marginBottom: "12px",
    marginTop: 0,
    textTransform: "uppercase",
  },
  grid: {
    alignItems: "center",
    columnGap: { default: "32px", [min768]: "48px" },
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      [min1024]: "repeat(12, minmax(0, 1fr))",
    },
    rowGap: { default: "32px", [min768]: "48px" },
    width: "100%",
  },
  hero: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: { default: "20px", [min1024]: "24px" },
    paddingBlockEnd: 0,
    paddingBlockStart: { default: "48px", [min768]: "96px" },
    paddingInline: { default: 0, [min1024]: "40px" },
    position: "relative",
    textAlign: "center",
    width: "100%",
  },
  heroGlow: {
    backgroundImage: glow,
    borderRadius: "9999px",
    filter: "blur(64px)",
    height: "420px",
    marginInline: "auto",
    opacity: 0.5,
    width: "85%",
  },
  heroGlowWrap: {
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
    zIndex: -10,
  },
  heroInner: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: { default: "24px", [min1024]: "32px" },
    textAlign: "center",
    width: "100%",
  },
  heroLede: {
    color: site.text,
    fontSize: "16px",
    letterSpacing: "0.5px",
    lineHeight: "20px",
    margin: 0,
    textWrap: "balance",
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: "clamp(3rem, 1.625rem + 6vw, 96px)",
    fontWeight: 700,
    lineHeight: 0.95,
    margin: 0,
    textWrap: "balance",
  },
  module: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    marginInline: "auto",
    maxWidth: "1344px",
    paddingBlock: { default: "48px", [min1024]: "64px" },
    paddingInline: { default: "16px", [min1024]: "32px" },
    width: "100%",
  },
  moduleBody: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "16px",
    lineHeight: 1.625,
    marginBottom: 0,
    marginTop: "16px",
    whiteSpace: "pre-line",
  },
  moduleImage: {
    borderRadius: "12px",
    display: "block",
    height: "auto",
    maxWidth: { default: "100%", [min640]: "40rem" },
    minHeight: { default: "auto", [min640]: "30rem" },
    objectFit: "cover",
    objectPosition: "left",
    width: "100%",
  },
  moduleText: {
    textAlign: "left",
  },
  moduleTitle: {
    color: "#ffffff",
    fontSize: { default: "24px", [min640]: "30px", [min768]: "36px" },
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: { default: "30px", [min640]: "36px", [min768]: "40px" },
    margin: 0,
    textWrap: "balance",
  },
  overlayImageFirstDesktop: {
    backgroundImage: overlayImageFirstDesktop,
  },
  overlayImageFirstPhone: {
    backgroundImage: overlayImageFirstPhone,
  },
  overlayPhone: {
    display: { default: "block", [min640]: "none" },
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  },
  overlayTablet: {
    display: { default: "none", [min640]: "block" },
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  },
  overlayTextFirstDesktop: {
    backgroundImage: overlayTextFirstDesktop,
  },
  overlayTextFirstPhone: {
    backgroundImage: overlayTextFirstPhone,
  },
  visual: {
    position: "relative",
  },
  visualFirst: {
    gridColumn: { default: "auto", [min1024]: "span 7 / span 7" },
  },
  visualSecond: {
    gridColumn: { default: "auto", [min1024]: "span 7 / span 7" },
    order: { default: 0, [min1024]: 2 },
  },
});
