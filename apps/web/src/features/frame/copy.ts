export const homeHref = "/";

export const loginUrl = "https://app.hypertask.ai/login";

export type FrameLink = Readonly<{
  external: boolean;
  href: string;
  label: string;
}>;

export const primaryLinks: readonly FrameLink[] = [
  { external: false, href: "/pricing/", label: "Pricing" },
  { external: false, href: "/blog/", label: "Blog" },
];

export const resourceLinks: readonly FrameLink[] = [
  { external: true, href: "https://docs.hypertask.ai/", label: "Docs" },
  { external: true, href: "https://help.hypertask.ai/", label: "Help" },
];

export const pageFooterLinks: readonly FrameLink[] = [
  { external: false, href: "/", label: "Home" },
  { external: false, href: "/pricing/", label: "Pricing" },
  { external: false, href: "/blog/", label: "Blog" },
  { external: false, href: "/privacy/", label: "Privacy" },
  { external: false, href: "/contact/", label: "Contact" },
  { external: false, href: "/terms/", label: "Terms" },
  { external: true, href: "https://docs.hypertask.ai/", label: "Docs" },
  { external: true, href: "https://help.hypertask.ai/", label: "Help" },
];

export const homeFooterLinks: readonly FrameLink[] = [
  { external: false, href: "/", label: "Home" },
  { external: false, href: "/pricing/", label: "Pricing" },
  { external: false, href: "/blog/", label: "Blog" },
  { external: true, href: "https://docs.hypertask.ai/", label: "Docs" },
  { external: true, href: "https://help.hypertask.ai/", label: "Help" },
  {
    external: true,
    href: "https://docs.hypertask.ai/changelog/",
    label: "Changelog",
  },
  { external: false, href: "/privacy/", label: "Privacy" },
  { external: false, href: "/terms/", label: "Terms" },
  { external: false, href: "/contact/", label: "Contact" },
];

export const skipLabel = "Skip to content";

export const wordmark = "Hypertask";

export const loginLabel = "Login";

export const startLabel = "Start free";

export const mobileStartLabel = "Get Started";

export const menuLabel = "Toggle menu";

export const loginHintBefore = "Press";

export const loginHintAfter = "to log in";

export const loginKey = "L";

export const cookieSettingsLabel = "Cookie settings";

export const cookieSettingsId = "cookie-settings";

export const copyrightOwner = "Hypertask Lab Ltd.";

export const footerLabel = "Footer";

export const menuOpenGlyph = "✕";

export const menuClosedGlyph = "☰";

export const mainId = "main-content";

export const copyrightLine = (year: number): string =>
  `© ${year} ${copyrightOwner}`;
