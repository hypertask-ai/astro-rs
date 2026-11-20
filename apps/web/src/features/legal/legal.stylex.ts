import * as stylex from "@stylexjs/stylex";

const systemSans =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", Segoe UI Symbol, "Noto Color Emoji"';

export const styles = stylex.create({
  card: {
    backgroundColor: "#111111",
    borderRadius: "0.75rem",
    boxShadow:
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    marginBottom: "3rem",
    padding: "2.5rem",
  },
  container: {
    marginInline: "auto",
    maxWidth: "42rem",
    paddingInline: "1rem",
  },
  header: {
    marginBottom: "3rem",
    textAlign: "center",
  },
  heading: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: "2rem",
    marginBlock: "2rem 0.5rem",
    marginInline: 0,
  },
  link: {
    color: "inherit",
    textDecorationLine: "underline",
  },
  list: {
    listStyleType: "disc",
    marginBottom: "1rem",
    marginLeft: "1.5rem",
    marginRight: 0,
    marginTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
  },
  paragraph: {
    fontSize: "1rem",
    lineHeight: 1.5,
    marginBlock: "0 1rem",
    marginInline: 0,
  },
  section: {
    backgroundColor: "#000000",
    color: "#ffffff",
    fontFamily: systemSans,
    paddingBlock: "4rem",
  },
  title: {
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    backgroundImage: "linear-gradient(to right, #7e22ce, #2563eb)",
    color: "transparent",
    fontSize: "2.25rem",
    fontWeight: 700,
    lineHeight: "2.5rem",
    margin: 0,
    paddingBottom: "0.5rem",
  },
});
