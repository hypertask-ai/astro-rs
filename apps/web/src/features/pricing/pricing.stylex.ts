import * as stylex from "@stylexjs/stylex";

const narrow = "@media (max-width: 900px)";

const serif = "'Newsreader', Georgia, serif";

const system = 'system-ui, -apple-system, "Segoe UI", sans-serif';

const panelBackground = "#111113";

const panelBorder = "#222226";

const softBorder = "#303036";

const mutedText = "#a1a1aa";

export const styles = stylex.create({
  discount: {
    color: "#d97757",
    fontSize: "14px",
    marginLeft: "4px",
    paddingRight: "10px",
  },
  page: {
    backgroundColor: "#000000",
    fontFamily: system,
    minHeight: "100vh",
  },
  plan: {
    backgroundColor: panelBackground,
    borderColor: panelBorder,
    borderRadius: "14px",
    borderStyle: "solid",
    borderWidth: "1px",
    display: "flex",
    flexDirection: "column",
    paddingBlock: "28px",
    paddingInline: "26px",
  },
  planCta: {
    alignItems: "center",
    borderRadius: "8px",
    borderStyle: "solid",
    borderWidth: "1px",
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: 500,
    height: "44px",
    justifyContent: "center",
    marginTop: "auto",
    paddingInline: "26px",
    textDecoration: "none",
    transitionDuration: "150ms",
    transitionProperty: "background-color",
  },
  planCtaPrimary: {
    ":focus-visible": {
      outlineColor: "#ffffff",
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    ":hover": { backgroundColor: "#d9d9d9" },
    backgroundColor: "#ffffff",
    borderColor: "transparent",
    color: "#000000",
  },
  planCtaSecondary: {
    ":focus-visible": {
      outlineColor: "#ffffff",
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    ":hover": { backgroundColor: "#18181b" },
    backgroundColor: "transparent",
    borderColor: softBorder,
    color: "#ffffff",
  },
  planFeature: {
    "::before": {
      color: "#d97757",
      content: '"\\2713"',
      fontSize: "12px",
    },
    alignItems: "baseline",
    display: "flex",
    gap: "10px",
  },
  planFeatured: {
    borderColor: softBorder,
    position: "relative",
  },
  planFeatures: {
    color: mutedText,
    display: "flex",
    flexDirection: "column",
    fontSize: "14px",
    gap: "10px",
    lineHeight: 1.45,
    listStyle: "none",
    marginBlock: "22px 26px",
    marginInline: 0,
    padding: 0,
  },
  planName: {
    fontSize: "15px",
    fontWeight: 600,
    marginBlock: "0 14px",
    marginInline: 0,
  },
  planNote: {
    color: "#8e9093",
    fontSize: "12px",
    marginBlock: "2px 0",
    marginInline: 0,
    minHeight: "15px",
  },
  planPrice: {
    fontFamily: serif,
    fontSize: "42px",
    fontWeight: 500,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  planTag: {
    backgroundColor: "#ffffff",
    borderRadius: "9999px",
    color: "#000000",
    fontSize: "11px",
    fontWeight: 600,
    paddingBlock: "4px",
    paddingInline: "12px",
    position: "absolute",
    right: "20px",
    top: "-12px",
    whiteSpace: "nowrap",
  },
  planUnit: {
    color: "#8e9093",
    fontSize: "13px",
    marginBlock: "6px 0",
    marginInline: 0,
  },
  plans: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: { default: "repeat(3, 1fr)", [narrow]: "1fr" },
    marginInline: { default: 0, [narrow]: "auto" },
    maxWidth: { default: "none", [narrow]: "420px" },
  },
  plansWrap: {
    paddingBlock: "48px 128px",
  },
  pricingHero: {
    paddingTop: "104px",
    textAlign: "center",
  },
  pricingModule: {
    boxSizing: "border-box",
    color: "#ffffff",
    paddingBlock: "60px",
  },
  pricingTitle: {
    fontFamily: serif,
    fontSize: "clamp(2.4rem, 4.4vw, 3.6rem)",
    fontWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: 1.08,
    marginBlock: 0,
    marginInline: "auto",
    maxWidth: "800px",
    textWrap: "balance",
  },
  pricingWrap: {
    marginInline: "auto",
    maxWidth: "1168px",
    paddingInline: "24px",
    width: "100%",
  },
  toggle: {
    alignItems: "center",
    backgroundColor: panelBackground,
    borderColor: panelBorder,
    borderRadius: "9999px",
    borderStyle: "solid",
    borderWidth: "1px",
    display: "inline-flex",
    gap: "4px",
    marginTop: "36px",
    padding: "4px",
  },
  toggleButton: {
    ":focus-visible": {
      outlineColor: "#ffffff",
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    backgroundColor: "transparent",
    borderRadius: "9999px",
    borderWidth: 0,
    color: "#8e9093",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: 500,
    height: "30px",
    paddingInline: "14px",
    transitionDuration: "150ms",
    transitionProperty: "background-color, color",
  },
  toggleButtonSelected: {
    backgroundColor: "#18181b",
    color: "#f4f4f7",
  },
});
