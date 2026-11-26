import * as stylex from "@stylexjs/stylex";

const sm = "@media (min-width: 640px)";

const md = "@media (min-width: 768px)";

const smOnly = "@media (min-width: 640px) and (max-width: 767px)";

const mdOnly = "@media (min-width: 768px) and (max-width: 1023px)";

const lg = "@media (min-width: 1024px)";

const white = "#ffffff";

const muted = "rgba(255, 255, 255, 0.8)";

const softer = "rgba(255, 255, 255, 0.7)";

const purple = "#a235eb";

const purpleLight = "#c084fc";

const purplePale = "#d8b4fe";

const gray = "#d1d5db";

const grayMuted = "#9ca3af";

const cardBorder = "rgba(255, 255, 255, 0.1)";

const imageOverlayFirst =
  "radial-gradient(90% 63% at 100% 100%, rgba(0, 0, 0, 0.35) 10%, rgba(0, 0, 0, 0) 64%), linear-gradient(300deg, rgba(0, 0, 0, 0.85) 8%, rgba(0, 0, 0, 0.25) 30%, rgba(0, 0, 0, 0) 78%), radial-gradient(65% 49% at 100% 0%, rgba(0, 0, 0, 1) 2%, rgba(0, 0, 0, 0) 94%)";

const imageOverlaySecond =
  "radial-gradient(120% 70% at 100% 100%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 70%), linear-gradient(300deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.0) 70%), radial-gradient(60% 45% at 100% 0%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.0) 80%)";

const systemFontStack =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const styles = stylex.create({
  badge: {
    borderRadius: "9999px",
    fontSize: "1rem",
    fontWeight: 600,
    paddingBlock: "0.25rem",
    paddingInline: "1.25rem",
  },
  badgeAfter: {
    backgroundColor: "rgba(162, 53, 235, 0.1)",
    color: purple,
  },
  badgeBefore: {
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    color: "#6b7280",
  },
  badgeWrap: {
    width: "fit-content",
  },
  bottomBody: {
    color: muted,
    fontSize: { default: "1rem", [md]: "1.125rem" },
    lineHeight: { default: 1.625, [md]: "1.75rem" },
    margin: 0,
    maxWidth: "48rem",
  },
  bottomCard: {
    backgroundImage:
      "linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent)",
    borderColor: cardBorder,
    borderRadius: "0.75rem",
    borderStyle: "solid",
    borderWidth: "1px",
    padding: { default: "1.5rem", [md]: "2.5rem" },
    position: "relative",
    width: "100%",
    zIndex: 1,
  },
  bottomGlow: {
    backgroundImage:
      "linear-gradient(to right, rgba(126, 34, 206, 0.25), rgba(192, 38, 211, 0.2), rgba(168, 85, 247, 0.25))",
    borderRadius: "1.5rem",
    filter: "blur(64px)",
    height: "16rem",
    marginInline: "auto",
    opacity: 0.6,
    width: "90%",
  },
  bottomGlowWrap: {
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
    zIndex: 0,
  },
  bottomSection: {
    paddingBlock: "60px",
  },
  bottomTitle: {
    color: white,
    fontSize: { default: "1.5rem", [md]: "2.25rem", [smOnly]: "1.875rem" },
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: { default: 1.25, [md]: "2.5rem", [smOnly]: "2.25rem" },
    margin: 0,
    textWrap: "balance",
  },
  bullet: {
    fontSize: "1rem",
  },
  challengeCard: {
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: "0.75rem",
    borderStyle: "solid",
    borderWidth: "2px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    overflow: "hidden",
    padding: "2rem",
    position: "relative",
  },
  challengeCardAfter: {
    borderColor: "rgba(162, 53, 235, 0.2)",
  },
  challengeCardBefore: {
    borderColor: "rgba(107, 114, 128, 0.2)",
  },
  challengeGrid: {
    columnGap: "2rem",
    display: "grid",
    gridTemplateColumns: { default: "1fr", [md]: "repeat(2, minmax(0, 1fr))" },
    marginBottom: "4rem",
    marginInline: "auto",
    minWidth: "80%",
    rowGap: "2rem",
  },
  challengeHeader: {
    marginBottom: "4rem",
    textAlign: "center",
  },
  challengeLede: {
    color: softer,
    fontSize: "1.25rem",
    lineHeight: 1.625,
    marginBlock: "1.5rem 0",
    marginInline: "auto",
    maxWidth: "48rem",
  },
  challengeTitle: {
    color: white,
    fontSize: "1.5rem",
    fontWeight: 700,
    lineHeight: "2rem",
    marginBlock: "0 1rem",
    textAlign: "left",
  },
  challengeTitleWrap: {
    marginBottom: "1.5rem",
    width: "100%",
  },
  content: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: { default: "1rem", [lg]: "1.5rem" },
    textAlign: "center",
    width: "100%",
  },
  ctaGroup: {
    alignItems: "center",
    display: "flex",
    flexDirection: { default: "column", [sm]: "row" },
    gap: "1rem",
  },
  ctaHero: {
    lineHeight: { default: "1.25rem", [lg]: "1.5rem" },
  },
  ctaLarge: {
    lineHeight: { default: "1.5rem", [lg]: "1.75rem" },
  },
  ctaPrimary: {
    borderWidth: 0,
  },
  ctaSecondary: {
    backgroundColor: "transparent",
  },
  headline: {
    color: white,
    fontSize: "3rem",
    fontWeight: 600,
    lineHeight: "3.375rem",
    margin: 0,
    textAlign: "center",
    textWrap: "balance",
  },
  hero: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: { default: "1.25rem", [lg]: "1.5rem" },
    paddingBlock: { default: "3rem 0", [md]: "6rem 0" },
    paddingInline: { default: 0, [lg]: "2.5rem" },
    position: "relative",
    textAlign: "center",
    width: "100%",
  },
  heroGlow: {
    backgroundImage:
      "linear-gradient(to right, rgba(126, 34, 206, 0.25), rgba(192, 38, 211, 0.2), rgba(168, 85, 247, 0.25))",
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
    zIndex: 0,
  },
  heroInner: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: { default: "1.5rem", [lg]: "2rem" },
    position: "relative",
    textAlign: "center",
    width: "100%",
    zIndex: 1,
  },
  heroSubtitle: {
    color: "#fafafa",
    fontSize: "1rem",
    fontWeight: 400,
    letterSpacing: "0.5px",
    lineHeight: "1.25rem",
    margin: 0,
    textWrap: "balance",
  },
  heroTitle: {
    color: white,
    fontSize: "clamp(3rem, 1.625rem + 6vw, 96px)",
    fontWeight: 700,
    lineHeight: 0.95,
    margin: 0,
    textAlign: "center",
    textWrap: "balance",
  },
  image: {
    borderRadius: "0.75rem",
    display: "block",
    height: "auto",
    maxWidth: { default: "none", [sm]: "40rem" },
    minHeight: { default: "auto", [sm]: "30rem" },
    objectFit: "cover",
    objectPosition: "left",
    width: "100%",
  },
  imageCell: {
    gridColumn: { default: "auto", [lg]: "span 7" },
    position: "relative",
  },
  imageCellReversed: {
    order: { default: 0, [lg]: 2 },
  },
  item: {
    alignItems: "flex-start",
    columnGap: "0.75rem",
    display: "flex",
  },
  itemDetail: {
    color: softer,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    margin: 0,
  },
  itemIcon: {
    flexShrink: 0,
    height: "1.25rem",
    marginTop: "0.125rem",
    width: "1.25rem",
  },
  itemIconAfter: {
    color: purple,
  },
  itemIconBefore: {
    color: "#6b7280",
  },
  itemTitle: {
    color: white,
    fontWeight: 500,
    margin: 0,
    textAlign: "left",
  },
  items: {
    display: "grid",
    rowGap: "1rem",
  },
  metricLabel: {
    color: muted,
    fontSize: "1.125rem",
    fontWeight: 500,
    lineHeight: "1.75rem",
  },
  metricStack: {
    display: "grid",
    rowGap: "0.5rem",
  },
  metricValue: {
    backgroundClip: "text",
    backgroundImage: "linear-gradient(to right, #c084fc, #60a5fa)",
    color: "transparent",
    fontSize: { default: "2.25rem", [md]: "6rem" },
    fontWeight: 700,
    lineHeight: { default: "2.5rem", [md]: 1 },
  },
  metricsGrid: {
    display: "grid",
    gap: "2rem",
    gridTemplateColumns: { default: "1fr", [md]: "repeat(3, minmax(0, 1fr))" },
    textAlign: "center",
  },
  overlay: {
    backgroundImage: imageOverlaySecond,
    display: { default: "none", [sm]: "block" },
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  },
  overlayFirst: {
    backgroundImage: imageOverlayFirst,
  },
  page: {
    fontFamily: systemFontStack,
    width: "100%",
  },
  quote: {
    color: muted,
    fontSize: { default: "1rem", [md]: "1.125rem" },
    fontStyle: "italic",
    lineHeight: { default: 1.625, [md]: "1.75rem" },
    marginBlock: "0 1rem",
    marginInline: 0,
  },
  resultAfterLabel: {
    color: white,
    fontWeight: 600,
  },
  resultBeforeLabel: {
    color: grayMuted,
    fontWeight: 600,
  },
  resultBody: {
    color: gray,
    display: "grid",
    rowGap: "0.75rem",
  },
  resultCard: {
    borderColor: "rgba(168, 85, 247, 0.3)",
    borderRadius: "0.75rem",
    borderStyle: "solid",
    borderWidth: "1px",
    padding: "2rem",
    textAlign: "left",
  },
  resultLine: {
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    margin: 0,
  },
  resultNote: {
    color: "rgba(243, 232, 255, 0.6)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    margin: 0,
  },
  resultTitle: {
    color: purpleLight,
    fontSize: "1.5rem",
    fontWeight: 700,
    lineHeight: "2rem",
    marginBlock: "0 1rem",
  },
  resultsGrid: {
    columnGap: "2rem",
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      [lg]: "repeat(3, minmax(0, 1fr))",
      [mdOnly]: "repeat(2, minmax(0, 1fr))",
    },
    marginTop: "3rem",
    rowGap: "2rem",
  },
  row: {
    alignItems: "center",
    columnGap: { default: "2rem", [md]: "3rem" },
    display: "grid",
    gridTemplateColumns: { default: "1fr", [lg]: "repeat(12, minmax(0, 1fr))" },
    rowGap: { default: "2rem", [md]: "3rem" },
    width: "100%",
  },
  rowBullets: {
    color: muted,
    display: "grid",
    fontSize: "1rem",
    listStyleType: "disc",
    margin: 0,
    paddingLeft: "1.5rem",
    rowGap: "0.5rem",
  },
  rowDescription: {
    color: muted,
    fontSize: "1rem",
    lineHeight: { default: 1.625, [md]: "1.5rem" },
    marginBlock: "0 1rem",
    whiteSpace: "pre-line",
  },
  rowList: {
    display: "grid",
    marginTop: "3rem",
    rowGap: "4rem",
  },
  rowText: {
    textAlign: "left",
  },
  rowTextCell: {
    gridColumn: { default: "auto", [lg]: "span 5" },
  },
  rowTextCellReversed: {
    order: { default: 0, [lg]: 1 },
  },
  rowTitle: {
    color: white,
    fontSize: { default: "1.5rem", [md]: "2.25rem", [smOnly]: "1.875rem" },
    fontWeight: 600,
    letterSpacing: "-0.025em",
    lineHeight: { default: 1.25, [md]: "2.5rem", [smOnly]: "2.25rem" },
    marginBlock: "0 1rem",
    textWrap: "balance",
  },
  rule: {
    borderRadius: "9999px",
    height: "4px",
  },
  ruleAfter: {
    backgroundColor: purple,
    width: "100%",
  },
  ruleBefore: {
    backgroundColor: "#6b7280",
    width: "4rem",
  },
  section: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    marginInline: "auto",
    maxWidth: "1344px",
    paddingBlock: { default: "3rem", [lg]: "4rem" },
    paddingInline: { default: "1rem", [lg]: "2rem" },
    width: "100%",
  },
  sectionRelative: {
    position: "relative",
  },
  table: {
    borderCollapse: "collapse",
    color: white,
    width: "100%",
  },
  tableBodyCell: {
    borderBottomColor: cardBorder,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    color: gray,
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    padding: "1rem",
    textAlign: "left",
    verticalAlign: "middle",
  },
  tableBodyFirst: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: white,
    fontWeight: 500,
    left: 0,
    position: "sticky",
    zIndex: 10,
  },
  tableBodyLast: {
    color: purplePale,
    fontWeight: 700,
  },
  tableHead: {
    fontWeight: 600,
  },
  tableHeadCell: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    padding: "1rem",
    textAlign: "left",
    verticalAlign: "middle",
  },
  tableHeadFirst: {
    color: white,
    left: 0,
    position: "sticky",
    zIndex: 10,
  },
  tableHeadFourth: {
    color: purpleLight,
    fontWeight: 700,
  },
  tableHeadSecond: {
    color: gray,
    fontWeight: 700,
  },
  tableHeadThird: {
    color: white,
    fontWeight: 700,
  },
  tableRow: {
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
  },
  tableWrap: {
    backgroundColor: "transparent",
    borderColor: cardBorder,
    borderRadius: "0.5rem",
    borderStyle: "solid",
    borderWidth: "1px",
    marginInline: "auto",
    marginTop: "3rem",
    maxWidth: "100%",
    overflowX: "auto",
    padding: { default: 0, [md]: "1rem" },
    width: "100%",
  },
  visual: {
    borderRadius: "0.5rem",
    borderStyle: "solid",
    borderWidth: "1px",
    marginTop: "2rem",
    padding: "1rem",
    width: "100%",
  },
  visualAfter: {
    backgroundColor: "rgba(162, 53, 235, 0.05)",
    borderColor: "rgba(162, 53, 235, 0.2)",
  },
  visualBar: {
    backgroundColor: "rgba(162, 53, 235, 0.2)",
    borderRadius: "9999px",
    height: "0.75rem",
    width: "100%",
  },
  visualBarNarrow: {
    backgroundColor: "rgba(162, 53, 235, 0.15)",
    width: "80%",
  },
  visualBarNarrowest: {
    backgroundColor: "rgba(162, 53, 235, 0.1)",
    width: "60%",
  },
  visualBars: {
    display: "grid",
    rowGap: "0.5rem",
  },
  visualBefore: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderColor: cardBorder,
  },
  visualBox: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "0.25rem",
    borderStyle: "dashed",
    borderWidth: "2px",
    height: "4rem",
  },
  visualBoxes: {
    columnGap: "0.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  visualCaption: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    marginBlock: "0.5rem 0",
    textAlign: "center",
  },
  visualCaptionAfter: {
    color: purple,
  },
  visualCaptionBefore: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  whyCard: {
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: cardBorder,
    borderRadius: "0.75rem",
    borderStyle: "solid",
    borderWidth: "1px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    maxWidth: "20rem",
    minWidth: "260px",
    padding: "1.5rem",
    width: "100%",
  },
  whyGrid: {
    display: "grid",
    gap: "2rem",
    gridTemplateColumns: {
      default: "1fr",
      [md]: "repeat(4, minmax(0, 1fr))",
      [smOnly]: "repeat(2, minmax(0, 1fr))",
    },
    justifyItems: "center",
    marginTop: "3rem",
  },
  whyText: {
    color: gray,
    lineHeight: 1.625,
    margin: 0,
    textAlign: "left",
  },
  whyTitle: {
    alignItems: "center",
    color: purpleLight,
    display: "flex",
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: "1.75rem",
    marginBlock: "0 1rem",
    minHeight: "3.5rem",
    textAlign: "left",
  },
});
