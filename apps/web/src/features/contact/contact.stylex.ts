import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  card: {
    backgroundColor: "#111111",
    borderRadius: "12px",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    marginBottom: "48px",
    padding: "40px",
    textAlign: "center",
  },
  container: {
    marginInline: "auto",
    maxWidth: "672px",
    paddingInline: "16px",
  },
  email: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: 600,
    lineHeight: "32px",
    marginBottom: "24px",
  },
  emailLink: {
    ":hover": { color: "#60a5fa" },
    color: "#c084fc",
    textDecoration: "none",
    transitionDuration: "150ms",
    transitionProperty: "color",
  },
  heading: {
    backgroundClip: "text",
    backgroundImage:
      "linear-gradient(to right, rgb(126, 34, 206), rgb(37, 99, 235))",
    color: "transparent",
    fontSize: "36px",
    fontWeight: 700,
    lineHeight: "40px",
    margin: 0,
    paddingBottom: "8px",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  header: {
    marginBottom: "48px",
    textAlign: "center",
  },
  homeLink: {
    color: "inherit",
    textDecoration: "underline",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "24px",
    marginBlock: "0 16px",
    marginInline: 0,
  },
  section: {
    backgroundColor: "#000000",
    color: "#ffffff",
    paddingBlock: "64px",
  },
});
