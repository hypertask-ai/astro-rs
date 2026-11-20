import * as stylex from "@stylexjs/stylex";

const phone = "@media (max-width: 860px)";

const smallPhone = "@media (max-width: 480px)";

const logoPhone = "@media (max-width: 600px)";

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

const accentDim = "rgba(162, 53, 235, 0.14)";

const accentLine = "rgba(162, 53, 235, 0.38)";

const display = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";

const body = "'Inter', ui-sans-serif, system-ui, sans-serif";

const mono = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

const easeOut = "cubic-bezier(0.22, 1, 0.36, 1)";

const radius = "8px";

export const styles = stylex.create({
  agents: {
    columnGap: "2.5rem",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [phone]: "1fr",
    },
    rowGap: { default: "2.5rem", [phone]: "1.5rem" },
    textAlign: "left",
  },
  agentsLabel: {
    color: inkFaint,
    display: "block",
    fontFamily: mono,
    fontSize: "0.72rem",
    letterSpacing: "0.14em",
    marginBottom: "1rem",
    textTransform: "uppercase",
  },
  band: {
    backgroundImage:
      "linear-gradient(180deg, rgba(162, 53, 235, 0.14), rgba(162, 53, 235, 0.04))",
    borderBottomColor: accentLine,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    borderTopColor: accentLine,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
    paddingBlock: { default: "6.5rem", [phone]: "4rem" },
    width: "100%",
  },
  bandFoot: {
    color: inkMuted,
    fontSize: "0.92rem",
    marginBlock: "2.5rem 0",
    marginInline: 0,
  },
  bandFootLink: {
    ":hover": { color: "#ffffff" },
    borderBottomColor: accentLine,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    color: accentLight,
    textDecoration: "none",
  },
  bandInner: {
    marginInline: "auto",
    maxWidth: "1000px",
    paddingInline: "1.25rem",
    textAlign: "center",
  },
  bandTitle: {
    fontFamily: display,
    fontSize: "clamp(1.7rem, 3vw + 0.5rem, 2.7rem)",
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.02,
    marginBlock: "0 2.5rem",
    marginInline: "auto",
    maxWidth: "20ch",
  },
  bodyLine: {
    color: inkMuted,
    fontFamily: body,
    fontSize: "1.02rem",
    lineHeight: 1.6,
    marginBlock: "0 1.5rem",
    maxWidth: "42ch",
  },
  chip: {
    backgroundColor: paper,
    borderColor: lineStrong,
    borderRadius: "6px",
    borderStyle: "solid",
    borderWidth: "1px",
    color: ink,
    fontFamily: mono,
    fontSize: "0.82rem",
    paddingBlock: "0.5rem",
    paddingInline: "0.8rem",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.55rem",
  },
  cli: {
    alignItems: "center",
    backgroundColor: {
      ":hover": paperCard,
      default: paperRaised,
    },
    borderColor: { ":hover": accentLine, default: lineStrong },
    borderRadius: radius,
    borderStyle: "solid",
    borderWidth: "1px",
    color: ink,
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: mono,
    fontSize: "0.82rem",
    gap: "0.7rem",
    marginTop: "2.5rem",
    maxWidth: "100%",
    paddingBlock: "0.7rem",
    paddingInline: "0.85rem",
    transitionDuration: "0.18s",
    transitionProperty: "border-color, background-color",
    transitionTimingFunction: easeOut,
  },
  cliCommand: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cliPrompt: {
    color: accentLight,
  },
  cliState: {
    color: inkFaint,
    display: "inline-flex",
    marginLeft: "0.15rem",
  },
  cliStateIconHidden: {
    display: "none",
  },
  cliStateIconShown: {
    display: "inline",
  },
  code: {
    backgroundColor: paperRaised,
    borderColor: lineStrong,
    borderRadius: radius,
    borderStyle: "solid",
    borderWidth: "1px",
    fontFamily: mono,
    fontSize: "0.82rem",
    lineHeight: 1.9,
    paddingBlock: "1.1rem",
    paddingInline: "1.2rem",
  },
  codeInline: {
    fontSize: "0.76rem",
    lineHeight: 1.8,
    marginTop: "1rem",
  },
  codeLine: {
    color: ink,
    overflowX: "auto",
    whiteSpace: "nowrap",
  },
  codeOut: {
    color: inkFaint,
  },
  codePrompt: {
    color: accentLight,
    marginRight: "0.5rem",
  },
  ctaCenter: {
    justifyContent: "center",
  },
  ctaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.6rem",
    marginTop: "1.5rem",
  },
  figure: {
    margin: 0,
  },
  final: {
    paddingBlock: { default: "6.5rem", [phone]: "4rem" },
    textAlign: "center",
  },
  finalTitle: {
    fontFamily: display,
    fontSize: "clamp(2rem, 4vw + 0.5rem, 3.4rem)",
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.02,
    marginBlock: "0 1.5rem",
  },
  ghostButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: { ":hover": accentLine, default: lineStrong },
    borderRadius: radius,
    borderStyle: "solid",
    borderWidth: "1px",
    color: ink,
    display: "inline-flex",
    fontSize: "0.92rem",
    fontWeight: 600,
    justifyContent: "center",
    paddingBlock: "0.72rem",
    paddingInline: "1.35rem",
    textDecoration: "none",
    transitionDuration: "0.18s",
    transitionProperty: "background-color, border-color",
    transitionTimingFunction: easeOut,
    whiteSpace: "nowrap",
  },
  hero: {
    paddingTop: "4rem",
  },
  heroCopy: {
    textAlign: "left",
  },
  heroGrid: {
    alignItems: "center",
    display: "grid",
    gap: { default: "clamp(2rem, 4vw, 4rem)", [phone]: "2.5rem" },
    gridTemplateColumns: { default: "minmax(0, 46rem)", [phone]: "1fr" },
    paddingBlock: "clamp(2rem, 5vw, 4.5rem)",
  },
  heroTitle: {
    fontFamily: display,
    fontSize: "clamp(2.6rem, 6vw + 0.4rem, 5.1rem)",
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.02,
    margin: 0,
  },
  how: {
    paddingBlock: { default: "6.5rem", [phone]: "4rem" },
  },
  howHead: {
    marginBottom: "4rem",
    maxWidth: "24ch",
  },
  lede: {
    color: inkMuted,
    fontSize: "clamp(1.05rem, 0.55vw + 0.92rem, 1.22rem)",
    lineHeight: 1.55,
    marginBlock: "1.5rem 0",
    maxWidth: { default: "34ch", [phone]: "none" },
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  listDetail: {
    color: inkMuted,
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
  listItem: {
    display: "flex",
    gap: "0.85rem",
  },
  listTitle: {
    color: ink,
    display: "block",
    fontSize: "0.98rem",
    fontWeight: 600,
  },
  logo: {
    height: "26px",
    opacity: { ":hover": 1, default: 0.85 },
    transitionDuration: "0.18s",
    transitionProperty: "opacity",
    transitionTimingFunction: easeOut,
    width: "auto",
  },
  logos: {
    borderTopColor: line,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
    marginTop: "1.5rem",
    paddingTop: "2.5rem",
    textAlign: "center",
  },
  logosLabel: {
    color: inkFaint,
    display: "block",
    fontSize: "0.68rem",
    letterSpacing: "0.2em",
    marginBottom: "1.5rem",
    textTransform: "uppercase",
  },
  logosRow: {
    alignItems: "center",
    display: { default: "flex", [logoPhone]: "grid" },
    flexWrap: "wrap",
    gap: { default: "1.75rem 3rem", [logoPhone]: "1.75rem 1.5rem" },
    gridTemplateColumns: {
      default: "none",
      [logoPhone]: "repeat(2, minmax(0, 1fr))",
    },
    justifyContent: "center",
    justifyItems: { default: "normal", [logoPhone]: "center" },
  },
  note: {
    color: inkFaint,
    fontSize: "0.85rem",
    marginBlock: "1.5rem 0",
    marginInline: 0,
  },
  noteLink: {
    ":hover": { color: "#ffffff" },
    borderBottomColor: accentLine,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    color: accentLight,
    textDecoration: "none",
  },
  page: {
    backgroundColor: paper,
    color: ink,
    fontFamily: body,
    overflowX: "clip",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: { ":hover": "#b352f0", default: accent },
    borderRadius: radius,
    color: "#ffffff",
    display: "inline-flex",
    fontSize: "0.92rem",
    fontWeight: 600,
    justifyContent: "center",
    paddingBlock: "0.72rem",
    paddingInline: "1.35rem",
    textDecoration: "none",
    transitionDuration: "0.18s",
    transitionProperty: "background-color",
    transitionTimingFunction: easeOut,
    whiteSpace: "nowrap",
  },
  proofCaption: {
    color: inkFaint,
    fontSize: "0.8rem",
    marginBlock: "0.7rem 0",
    marginInline: 0,
  },
  proofMedia: {
    aspectRatio: "16 / 10",
    backgroundColor: paperRaised,
    borderColor: lineStrong,
    borderRadius: radius,
    borderStyle: "solid",
    borderWidth: "1px",
    display: "block",
    objectFit: "cover",
    width: "100%",
  },
  sectionRule: {
    borderTopColor: line,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
  },
  split: {
    alignItems: "center",
    columnGap: { default: "clamp(2rem, 5vw, 5rem)", [phone]: "2rem" },
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) minmax(0, 1fr)",
      [phone]: "1fr",
    },
    paddingBlock: { default: "6.5rem", [phone]: "4rem" },
    rowGap: { default: "clamp(2rem, 5vw, 5rem)", [phone]: "2rem" },
  },
  splitCopyReversed: {
    order: { default: 2, [phone]: 0 },
  },
  status: {
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    listStyle: "none",
    marginBlock: "1.5rem 0",
    marginInline: 0,
    padding: 0,
  },
  statusDone: {
    backgroundColor: accent,
    borderRadius: "50%",
    flexShrink: 0,
    height: "12px",
    width: "12px",
  },
  statusItem: {
    alignItems: "center",
    backgroundColor: paperRaised,
    borderColor: line,
    borderRadius: "7px",
    borderStyle: "solid",
    borderWidth: "1px",
    color: inkMuted,
    display: "flex",
    fontSize: "0.88rem",
    gap: "0.7rem",
    paddingBlock: "0.6rem",
    paddingInline: "0.85rem",
  },
  statusShip: {
    backgroundColor: accentLight,
    borderRadius: "2px",
    flexShrink: 0,
    height: "4px",
    width: "12px",
  },
  statusWait: {
    backgroundColor: "transparent",
    borderColor: accentLine,
    borderRadius: "50%",
    borderStyle: "solid",
    borderWidth: "2px",
    flexShrink: 0,
    height: "12px",
    width: "12px",
  },
  step: {
    columnGap: { default: "1.5rem", [smallPhone]: "1rem" },
    display: "grid",
    gridTemplateColumns: {
      default: "3.5rem minmax(0, 1fr)",
      [smallPhone]: "2.6rem minmax(0, 1fr)",
    },
    paddingLeft: { default: "2.5rem", [smallPhone]: "1rem" },
  },
  stepBody: {
    color: inkMuted,
    fontSize: "0.96rem",
    lineHeight: 1.6,
    margin: 0,
  },
  stepBodyNarrow: {
    maxWidth: "34ch",
  },
  stepBodyWide: {
    maxWidth: "44ch",
  },
  stepIndent: {
    marginLeft: { default: "clamp(0px, 8vw, 7rem)", [phone]: 0 },
  },
  stepIndentSmall: {
    marginLeft: { default: "clamp(0px, 4vw, 3.5rem)", [phone]: 0 },
  },
  stepNumber: {
    alignItems: "center",
    backgroundColor: accentDim,
    borderColor: accentLine,
    borderRadius: "50%",
    borderStyle: "solid",
    borderWidth: "1px",
    color: accentLight,
    display: "grid",
    fontFamily: mono,
    fontSize: { default: "1rem", [smallPhone]: "0.85rem" },
    fontWeight: 500,
    height: { default: "2.6rem", [smallPhone]: "2.2rem" },
    placeItems: "center",
    width: { default: "2.6rem", [smallPhone]: "2.2rem" },
  },
  stepTitle: {
    fontFamily: display,
    fontSize: "1.28rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    marginBlock: "0.35rem 0.55rem",
  },
  steps: {
    borderLeftColor: line,
    borderLeftStyle: "solid",
    borderLeftWidth: "1px",
    display: "flex",
    flexDirection: "column",
    gap: "2.5rem",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  stepsTitle: {
    fontFamily: display,
    fontSize: "clamp(1.85rem, 2.6vw + 0.6rem, 2.85rem)",
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.02,
    margin: 0,
  },
  tick: {
    "::after": {
      borderColor: accentLight,
      borderStyle: "solid",
      borderWidth: "0 2px 2px 0",
      content: '""',
      height: "9px",
      inset: 0,
      margin: "auto",
      position: "absolute",
      transform: "translateY(-1px) rotate(45deg)",
      width: "5px",
    },
    backgroundColor: accentDim,
    borderColor: accentLine,
    borderRadius: "5px",
    borderStyle: "solid",
    borderWidth: "1px",
    flexShrink: 0,
    height: "18px",
    marginTop: "3px",
    position: "relative",
    width: "18px",
  },
  title: {
    fontFamily: display,
    fontSize: "clamp(1.85rem, 2.6vw + 0.6rem, 2.85rem)",
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.02,
    marginBlock: "0 1rem",
    marginInline: 0,
    maxWidth: "16ch",
  },
  wrap: {
    marginInline: "auto",
    maxWidth: "1160px",
    paddingInline: "1.25rem",
  },
});
