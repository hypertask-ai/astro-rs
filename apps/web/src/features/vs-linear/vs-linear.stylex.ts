import * as stylex from "@stylexjs/stylex";

const phone = "@media (max-width: 720px)";

const paper = "#08080b";

const paperRaised = "#0e0e14";

const paperCard = "#14141c";

const ink = "#f4f4f7";

const inkMuted = "rgba(244, 244, 247, 0.64)";

const inkFaint = "rgba(244, 244, 247, 0.40)";

const line = "rgba(244, 244, 247, 0.10)";

const lineStrong = "rgba(244, 244, 247, 0.16)";

const accent = "#a235eb";

const accentLight = "#c688f4";

const accentSoft = "rgba(162, 53, 235, 0.14)";

const accentLine = "rgba(162, 53, 235, 0.38)";

const display = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";

const body = "'Inter', ui-sans-serif, system-ui, sans-serif";

const mono = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

export const styles = stylex.create({
  articleBody: {
    borderTopColor: line,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
  },
  codeComment: {
    color: inkFaint,
  },
  codeLine: {
    fontFamily: mono,
  },
  comparisonNote: {
    color: inkFaint,
    fontSize: "0.75rem",
    lineHeight: 1.6,
    paddingBlock: "0 3rem",
    textAlign: "center",
  },
  comparisonNoteText: {
    margin: 0,
  },
  copySection: {
    borderBottomColor: line,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    columnGap: "clamp(2.5rem, 7vw, 6.5rem)",
    display: { default: "grid", [phone]: "block" },
    gridTemplateColumns: "minmax(220px, 0.72fr) minmax(0, 1.28fr)",
    paddingBlock: { default: "clamp(4rem, 8vw, 6.5rem)", [phone]: "3.5rem" },
  },
  ctaActions: {
    alignItems: { default: "center", [phone]: "stretch" },
    display: "flex",
    flexDirection: { default: "row", [phone]: "column" },
    flexWrap: "wrap",
    gap: "0.8rem",
    justifyContent: "center",
    marginBlock: { default: 0, [phone]: "2rem" },
  },
  ctaInner: {
    alignItems: "center",
    columnGap: "2rem",
    display: { default: "grid", [phone]: "block" },
    gridTemplateColumns: "1fr auto 1fr",
    rowGap: "2rem",
  },
  ctaRule: {
    backgroundColor: line,
    height: "1px",
  },
  ctaSection: {
    paddingBlock: "clamp(4rem, 8vw, 6rem)",
  },
  eyebrow: {
    color: accentLight,
    fontFamily: mono,
    fontSize: "0.74rem",
    letterSpacing: "0.16em",
    marginBlock: "0 1.5rem",
    textTransform: "uppercase",
  },
  featureColumn: {
    width: "24%",
  },
  hero: {
    "::before": {
      backgroundImage: `radial-gradient(ellipse at center, ${accentSoft}, transparent 68%)`,
      borderRadius: "999px",
      content: '""',
      inset: "5% 8% 8%",
      pointerEvents: "none",
      position: "absolute",
      zIndex: 0,
    },
    paddingBlock: {
      default: "clamp(4.5rem, 10vw, 8rem) clamp(4rem, 9vw, 7rem)",
      [phone]: "4rem",
    },
    position: "relative",
    textAlign: "center",
  },
  heroChildren: {
    position: "relative",
    zIndex: 1,
  },
  heroSubtitle: {
    color: inkMuted,
    fontSize: "clamp(1.08rem, 1.4vw, 1.3rem)",
    lineHeight: 1.6,
    marginBlock: "1.75rem 0",
    marginInline: "auto",
    maxWidth: "57ch",
  },
  heroTitle: {
    color: ink,
    fontFamily: display,
    fontSize: "clamp(3rem, 8vw, 5.5rem)",
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 0.98,
    margin: 0,
  },
  page: {
    backgroundColor: paper,
    color: ink,
    fontFamily: body,
    overflow: "hidden",
  },
  pageHeading: {
    color: ink,
    fontFamily: display,
    fontSize: "clamp(1.8rem, 3.1vw, 2.65rem)",
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.08,
    margin: 0,
    maxWidth: { default: "12ch", [phone]: "14ch" },
  },
  productColumn: {
    width: "38%",
  },
  productMark: {
    backgroundColor: accent,
    borderRadius: "50%",
    display: "inline-block",
    height: "0.48rem",
    marginRight: "0.5rem",
    verticalAlign: "0.08em",
    width: "0.48rem",
  },
  prose: {
    color: inkMuted,
    fontSize: "1.05rem",
    lineHeight: 1.72,
    textAlign: "left",
  },
  proseAfter: {
    marginBlock: "1.5rem 0",
  },
  proseFirst: {
    margin: 0,
  },
  publication: {
    backgroundColor: paperRaised,
    borderColor: lineStrong,
    borderRadius: "8px",
    borderStyle: "solid",
    borderWidth: "1px",
    color: ink,
    fontFamily: mono,
    fontSize: { default: "0.84rem", [phone]: "0.75rem" },
    gridColumn: "2",
    lineHeight: 1.75,
    marginBlock: "2rem 0",
    marginInline: 0,
    overflowX: "auto",
    padding: {
      default: "1.35rem 1.5rem",
      [phone]: "1.1rem",
    },
    textAlign: "left",
  },
  sectionHeading: {
    alignSelf: "start",
    marginBottom: { default: 0, [phone]: "1.75rem" },
  },
  sectionNumber: {
    color: accentLight,
    display: "block",
    fontFamily: mono,
    fontSize: "0.74rem",
    letterSpacing: "0.16em",
    marginBottom: "1rem",
    textTransform: "uppercase",
  },
  srOnly: {
    borderWidth: 0,
    clip: "rect(0, 0, 0, 0)",
    height: "1px",
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
  },
  table: {
    borderCollapse: "collapse",
    color: inkMuted,
    fontSize: { default: "0.91rem", [phone]: "0.84rem" },
    lineHeight: 1.55,
    minWidth: { default: "780px", [phone]: "740px" },
    tableLayout: "fixed",
    textAlign: "left",
    width: "100%",
  },
  tableCell: {
    borderBottomColor: line,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    borderRightColor: line,
    borderRightStyle: "solid",
    borderRightWidth: "1px",
    padding: { default: "1.25rem 1.35rem", [phone]: "1rem" },
    textAlign: "left",
    verticalAlign: "top",
  },
  tableCellLastColumn: {
    borderRightWidth: 0,
  },
  tableCellLastRow: {
    borderBottomWidth: 0,
  },
  tableFrame: {
    backgroundColor: paperRaised,
    borderColor: lineStrong,
    borderRadius: "14px",
    borderStyle: "solid",
    borderWidth: "1px",
    overflow: "hidden",
    [phone]: {
      borderBottomLeftRadius: "14px",
      borderRadius: "14px 0 0 14px",
      borderRightWidth: 0,
      marginRight: "calc((100vw - 100%) / -2)",
    },
  },
  tableHead: {
    backgroundColor: paperCard,
  },
  tableHeadCell: {
    color: ink,
    fontFamily: display,
    fontSize: "1rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    verticalAlign: "middle",
  },
  tableRow: {
    backgroundColor: "rgba(244, 244, 247, 0.02)",
  },
  tableRowHeader: {
    color: ink,
    fontWeight: 500,
  },
  tableScroll: {
    ":focus-visible": {
      outlineColor: accent,
      outlineOffset: "-2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    overflowX: "auto",
  },
  tableSection: {
    display: "block",
  },
  tableSectionHeading: {
    alignItems: "baseline",
    display: { default: "flex", [phone]: "block" },
    gap: "1.25rem",
    marginBottom: { default: "2.5rem", [phone]: "1.75rem" },
  },
  tableSectionNumber: {
    marginBottom: { default: 0, [phone]: "1rem" },
  },
  tableSectionTitle: {
    maxWidth: "none",
  },
  winnerCell: {
    backgroundColor: accentSoft,
    boxShadow: `inset 3px 0 0 ${accent}`,
    color: ink,
  },
  winsItem: {
    "::before": {
      backgroundColor: accentSoft,
      borderColor: accentLine,
      borderRadius: "2px",
      borderStyle: "solid",
      borderWidth: "1px",
      content: '""',
      height: "0.5rem",
      left: 0,
      position: "absolute",
      top: "0.72em",
      transform: "translateY(-50%)",
      width: "0.5rem",
    },
    marginBlock: "0.5em",
    paddingLeft: "1.65rem",
    position: "relative",
  },
  winsList: {
    display: "grid",
    gap: "1rem",
    listStyle: "none",
    marginBlock: "0 2rem",
    marginInline: 0,
    padding: 0,
  },
  wrap: {
    marginInline: "auto",
    width: {
      default: "min(100% - 2.5rem, 1040px)",
      [phone]: "min(100% - 2rem, 1040px)",
    },
  },
});
