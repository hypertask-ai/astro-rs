import * as stylex from "@stylexjs/stylex";

const wide = "@media (min-width: 1024px)";

export const styles = stylex.create({
  container: {
    marginInline: "auto",
    maxWidth: "896px",
    paddingBlock: { default: "32px", [wide]: "48px" },
    paddingInline: { default: "16px", [wide]: "32px" },
    width: "100%",
  },
  cta: {
    ":hover": { backgroundColor: "rgba(255, 255, 255, 0.9)" },
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    color: "#000000",
    display: "inline-flex",
    fontSize: "14px",
    fontWeight: 500,
    justifyContent: "center",
    lineHeight: "20px",
    paddingBlock: "10px",
    paddingInline: "20px",
    textDecoration: "none",
    transitionDuration: "150ms",
    transitionProperty: "background-color, color",
  },
  heading: {
    fontSize: "48px",
    fontWeight: 600,
    lineHeight: "54px",
    margin: 0,
    textWrap: "balance",
  },
  paragraph: {
    margin: 0,
  },
  prose: {
    color: "rgba(255, 255, 255, 0.7)",
    display: "flex",
    flexDirection: "column",
    fontSize: { default: "16px", [wide]: "18px" },
    gap: "20px",
    lineHeight: { default: "26px", [wide]: "28px" },
    textAlign: "left",
  },
  stack: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: { default: "24px", [wide]: "32px" },
    textAlign: "left",
    width: "100%",
  },
  subheadline: {
    color: "#fafafa",
    fontSize: "16px",
    letterSpacing: "0.5px",
    lineHeight: "20px",
    margin: 0,
    textWrap: "balance",
  },
});
