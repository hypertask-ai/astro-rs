export type LegacyRedirect = {
  readonly destination: string;
  readonly source: string;
  readonly status: 301;
};

export const legacyRedirects: readonly LegacyRedirect[] = [
  { destination: "/", source: "/home2.html", status: 301 },
  { destination: "/", source: "/home2.html/", status: 301 },
  { destination: "/", source: "/hallmark-1", status: 301 },
  { destination: "/", source: "/new-home", status: 301 },
  { destination: "/", source: "/v2", status: 301 },
  { destination: "/", source: "/v3-cursor", status: 301 },
  { destination: "/", source: "/v3-linear", status: 301 },
  { destination: "/", source: "/v3-resend", status: 301 },
  { destination: "/", source: "/v3-shell", status: 301 },
  { destination: "/", source: "/v3-superhuman", status: 301 },
  { destination: "/", source: "/v3-vercel", status: 301 },
  { destination: "/", source: "/v4", status: 301 },
  { destination: "/", source: "/versions", status: 301 },
  { destination: "/", source: "/features", status: 301 },
  { destination: "/", source: "/features/", status: 301 },
  { destination: "/", source: "/agents", status: 301 },
  { destination: "/", source: "/agents/", status: 301 },
];

export const installRewrite = {
  destination: "/install.sh",
  owner: "HTPR-9133 install scripts serve it as a plain-text 200 asset",
  source: "/install",
  status: 200,
} as const;

export const htmlHandling = "force-trailing-slash" as const;

export const securityHeaderLines: readonly string[] = [
  "Strict-Transport-Security: max-age=31536000",
  "X-Content-Type-Options: nosniff",
  "Referrer-Policy: strict-origin-when-cross-origin",
];

export const securityHeadersBlock = `/*\n${securityHeaderLines
  .map((line) => `  ${line}`)
  .join("\n")}\n`;

const legacySources = new Set(
  legacyRedirects.map((redirect) => redirect.source)
);

export type TrailingSlashRedirect = {
  readonly destination: string;
  readonly source: string;
  readonly status: 308;
};

export const trailingSlashRedirects = (
  pagePaths: readonly string[]
): readonly TrailingSlashRedirect[] =>
  [...new Set(pagePaths)]
    .map((pagePath) => pagePath.replace(/\/+$/u, ""))
    .filter((source) => source !== "" && !legacySources.has(source))
    .toSorted()
    .map((source) => ({ destination: `${source}/`, source, status: 308 }));

export const redirectLine = (redirect: {
  readonly destination: string;
  readonly source: string;
  readonly status: number;
}): string => `${redirect.source} ${redirect.destination} ${redirect.status}`;

export const redirectsFile = (pagePaths: readonly string[]): string =>
  `${[
    ...legacyRedirects.map(redirectLine),
    ...trailingSlashRedirects(pagePaths).map(redirectLine),
  ].join("\n")}\n`;

export const headersFile = (existing: string): string =>
  existing.includes(securityHeaderLines[0] ?? "")
    ? existing
    : `${existing}\n${securityHeadersBlock}`;

export type LegacyAnswer =
  | {
      readonly kind: "redirect";
      readonly location: string;
      readonly status: number;
    }
  | { readonly kind: "passthrough" };

export const legacyAnswer = (path: string): LegacyAnswer => {
  const redirect = legacyRedirects.find((rule) => rule.source === path);

  return redirect === undefined
    ? { kind: "passthrough" }
    : {
        kind: "redirect",
        location: redirect.destination,
        status: redirect.status,
      };
};
