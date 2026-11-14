import * as stylex from "@stylexjs/stylex";

import { site } from "../tokens.stylex.js";

export const styles = stylex.create({
  heading: {
    fontSize: "1.5rem",
    margin: 0,
  },
  page: {
    backgroundColor: site.background,
    borderRadius: "4px",
    color: site.text,
    margin: 0,
    padding: "16px",
  },
});
