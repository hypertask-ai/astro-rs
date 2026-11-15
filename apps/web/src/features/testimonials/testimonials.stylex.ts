import * as stylex from "@stylexjs/stylex";

const tablet = "@media (min-width: 640px)";

const tabletUp = "@media (min-width: 768px)";

const desktop = "@media (min-width: 1024px)";

const tabletOnly = "@media (min-width: 768px) and (max-width: 1023px)";

const smOnly = "@media (min-width: 640px) and (max-width: 767px)";

const reducedMotion = "@media (prefers-reduced-motion: reduce)";

const motionOk = "@media (prefers-reduced-motion: no-preference)";

const scrollUp = stylex.keyframes({
  "0%": { transform: "translateY(0)" },
  "100%": { transform: "translateY(-33.333%)" },
});

const scrollDown = stylex.keyframes({
  "0%": { transform: "translateY(-33.333%)" },
  "100%": { transform: "translateY(0)" },
});

const cardRadius = "0.75rem";

const mutedText = "#9ca3af";

const softText = "#d1d5db";

const cardBorder = "rgba(31, 41, 55, 0.5)";

export const styles = stylex.create({
  avatar: {
    borderRadius: "9999px",
    flexShrink: 0,
    height: "50px",
    objectFit: "cover",
    width: "50px",
  },
  card: {
    backdropFilter: "blur(4px)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: cardBorder,
    borderRadius: cardRadius,
    borderStyle: "solid",
    borderWidth: "1px",
    flexShrink: 0,
    height: "100%",
    marginBottom: "1.5rem",
    overflow: "hidden",
    paddingBlock: "2rem",
    paddingInline: { default: "1rem", [tablet]: "1.5rem" },
    position: "relative",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
  },
  cardFooter: {
    alignItems: "flex-start",
    display: "flex",
    gap: "0.75rem",
    marginTop: { default: "auto", [tablet]: "2.5rem" },
  },
  cardGlow: {
    backgroundImage:
      "linear-gradient(to bottom, #000000, #291e284f, #b700ffa6)",
    inset: 0,
    opacity: { default: 0, [stylex.when.ancestor(":hover")]: 0.5 },
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: "500ms",
    transitionProperty: "opacity",
  },
  cardOverlay: {
    height: "50%",
    left: 0,
    pointerEvents: "none",
    position: "absolute",
    right: 0,
    top: 0,
  },
  cardQuote: {
    color: "#ffffff",
    fontSize: { default: "1.125rem", [tabletUp]: "1.25rem" },
    fontWeight: 600,
    margin: 0,
    marginBottom: "0.75rem",
  },
  cardQuoteWrap: {
    marginBottom: "1rem",
  },
  cardText: {
    color: softText,
    fontSize: { default: "1rem", [tabletUp]: "1.125rem" },
    margin: 0,
  },
  carousel: {
    display: { default: "block", [tabletUp]: "none" },
    paddingInline: "1rem",
    width: "100%",
  },
  carouselContainer: {
    display: "flex",
    marginLeft: "-0.75rem",
    touchAction: "pan-y pinch-zoom",
  },
  carouselDots: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginRight: "-0.6rem",
  },
  carouselFrame: {
    marginInline: "auto",
    maxWidth: "48rem",
  },
  carouselRegion: {
    display: "block",
  },
  carouselViewport: {
    overflowX: "auto",
    overflowY: "hidden",
    scrollBehavior: { [motionOk]: "smooth" },
    scrollSnapType: "x mandatory",
    touchAction: "manipulation",
  },
  column: {
    height: { default: "500px", [desktop]: "900px" },
    overflow: "hidden",
    position: "relative",
  },
  columnTrack: {
    animationDuration: "60s",
    animationIterationCount: "infinite",
    animationPlayState: {
      default: "running",
      [stylex.when.ancestor(":hover")]: "paused",
      [reducedMotion]: "paused",
    },
    animationTimingFunction: "linear",
    display: "flex",
    flexDirection: "column",
  },
  columnTrackDown: {
    animationName: scrollDown,
  },
  columnTrackUp: {
    animationName: scrollUp,
  },
  columnsDesktop: {
    display: { default: "none", [desktop]: "block" },
    height: "100%",
    maskImage:
      "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
    paddingInline: "1rem",
    width: "100%",
  },
  columnsTablet: {
    display: { default: "none", [desktop]: "none", [tabletOnly]: "block" },
    height: "100%",
    maskImage:
      "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
    paddingInline: "1rem",
    width: "100%",
  },
  dot: {
    "::after": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 0.2rem rgba(255, 255, 255, 0.3)",
      content: '""',
      height: "0.7rem",
      width: "0.7rem",
    },
    alignItems: "center",
    appearance: "none",
    backgroundColor: "transparent",
    borderRadius: "50%",
    borderWidth: 0,
    cursor: "pointer",
    display: "flex",
    height: "1.5rem",
    justifyContent: "center",
    margin: 0,
    padding: 0,
    width: "1.5rem",
  },
  dotSelected: {
    "::after": {
      backgroundColor: "#ffffff",
      boxShadow: "inset 0 0 0 0.2rem #ffffff",
    },
  },
  dots: {
    display: "flex",
    justifyContent: "center",
    marginTop: "2.5rem",
  },
  grid: {
    display: "grid",
    gap: "1.5rem",
    marginInline: "auto",
  },
  gridDesktop: {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  },
  gridTablet: {
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    maxWidth: "64rem",
  },
  lede: {
    color: mutedText,
    fontSize: "1.125rem",
    marginBlock: "0 3rem",
    marginInline: 0,
    textAlign: "center",
  },
  name: {
    color: "#ffffff",
    fontSize: { default: "0.875rem", [tabletUp]: "1rem" },
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  nameBlock: {
    minWidth: 0,
  },
  nameLine: {
    display: "inline-block",
    gap: "0.5rem",
    margin: 0,
    textAlign: "left",
  },
  nameRow: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  role: {
    color: mutedText,
    fontSize: "0.875rem",
    fontWeight: 600,
    marginLeft: "0.5rem",
  },
  section: {
    overflow: "hidden",
    paddingBlock: "4rem",
    position: "relative",
  },
  slide: {
    flexBasis: "92%",
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    paddingLeft: "0.75rem",
    scrollSnapAlign: "center",
  },
  slideContent: {
    height: "100%",
    width: "100%",
  },
  star: {
    color: "#facc15",
    height: "1.25rem",
    position: "relative",
    right: "2px",
    width: "1.25rem",
  },
  stars: {
    display: "flex",
  },
  title: {
    color: "#ffffff",
    fontSize: { default: "1.875rem", [smOnly]: "2.25rem", [tabletUp]: "3rem" },
    fontWeight: 700,
    letterSpacing: "-0.025em",
    marginBlock: "0 2rem",
    textAlign: "center",
  },
});
