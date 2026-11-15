import * as stylex from "@stylexjs/stylex";

const wide = "@media (min-width: 1024px)";

const tablet = "@media (max-width: 768px)";

const phone = "@media (max-width: 567px)";

const ctaShadow =
  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)";

export const styles = stylex.create({
  card: {
    alignItems: "center",
    backgroundImage: 'url("/gradient1.avif")',
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    justifyContent: { default: "normal", [tablet]: "end" },
    marginBottom: {
      "@media (min-width: 568px) and (max-width: 768px)": "32px",
      default: 0,
    },
    marginInline: "auto",
    maxWidth: "672px",
    minHeight: { default: "auto", [phone]: "75svh" },
    overflow: "hidden",
    paddingInline: "24px",
    paddingTop: "32px",
    position: "relative",
    textAlign: "center",
    width: "94%",
  },
  cta: {
    alignItems: "center",
    borderRadius: "6px",
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: ctaShadow,
    display: "inline-flex",
    fontSize: { default: "16px", [wide]: "18px" },
    fontWeight: 600,
    gap: "8px",
    justifyContent: "center",
    lineHeight: { default: "24px", [wide]: "28px" },
    paddingBlock: { default: "12px", [wide]: "16px" },
    paddingInline: { default: "32px", [wide]: "40px" },
    textDecoration: "none",
    transitionDuration: "200ms",
    transitionProperty: "background-color, color, border-color",
    whiteSpace: "nowrap",
  },
  ctaContainer: {
    bottom: { default: "auto", [tablet]: "-10px" },
    display: "flex",
    flexDirection: { default: "row", [tablet]: "column" },
    flexWrap: "wrap",
    gap: "16px",
    justifyContent: "center",
    marginBottom: "16px",
    position: { default: "static", [tablet]: "absolute" },
    width: { default: "auto", [tablet]: "90%" },
    zIndex: { default: "auto", [tablet]: 2 },
  },
  ctaOutline: {
    ":focus-visible": {
      boxShadow: `0 0 0 1px #d4d4d4, ${ctaShadow}`,
      outlineStyle: "none",
    },
    backgroundColor: "transparent",
    borderColor: "#ffffff",
    color: "#ffffff",
  },
  ctaPrimary: {
    ":focus-visible": {
      boxShadow: `0 0 0 1px #d4d4d4, ${ctaShadow}`,
      outlineStyle: "none",
    },
    ":hover": { backgroundColor: "rgb(249, 250, 251)" },
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    color: "#000000",
  },
  fade: {
    backgroundImage:
      "linear-gradient(to bottom, transparent 0%, rgb(6, 6, 6) 80%)",
    display: { default: "none", [phone]: "block" },
    height: "60%",
    left: 0,
    pointerEvents: "none",
    position: "absolute",
    right: 0,
    width: "110%",
    zIndex: 1,
  },
  heading: {
    fontSize: "36px",
    fontWeight: 700,
    lineHeight: "40px",
    marginBlock: "0 24px",
    marginInline: 0,
  },
  icon: {
    color: "#22c55e",
    fontSize: "60px",
    lineHeight: "60px",
    marginBottom: "32px",
  },
  message: {
    color: "#e5e7eb",
    fontSize: "18px",
    lineHeight: "28px",
    marginBlock: "0 32px",
    marginInline: "auto",
    maxWidth: "512px",
  },
  section: {
    alignItems: "center",
    backgroundColor: "#000000",
    color: "#ffffff",
    display: "flex",
    justifyContent: "center",
    paddingBlock: "64px",
  },
  subtitle: {
    fontSize: "20px",
    lineHeight: "28px",
    marginBlock: "0 16px",
    marginInline: 0,
    textTransform: "uppercase",
  },
});
