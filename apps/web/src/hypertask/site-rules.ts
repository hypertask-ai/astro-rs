import { noindexHeaderLine } from "../preview-marks.js";
import { addSiteBasePath } from "../site-base-path.js";

export interface LegacyRedirect {
  readonly destination: string;
  readonly source: string;
  readonly status: 301;
}

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

export const installAddress = {
  owner: "HTPR-9133 serves /install as a plain-text 200 script",
  source: "/install",
  status: 200,
} as const;

export const htmlHandling = "force-trailing-slash" as const;

export const securityHeaderLines: readonly string[] = [
  "Strict-Transport-Security: max-age=31536000",
  "X-Content-Type-Options: nosniff",
  "Referrer-Policy: strict-origin-when-cross-origin",
];

const requiredHeaderLines = (preview: boolean): readonly string[] =>
  preview ? [...securityHeaderLines, noindexHeaderLine] : securityHeaderLines;

const legacySources = new Set(
  legacyRedirects.map((redirect) => redirect.source)
);

export interface TrailingSlashRedirect {
  readonly destination: string;
  readonly source: string;
  readonly status: 308;
}

export const trailingSlashRedirects = (
  pagePaths: readonly string[]
): readonly TrailingSlashRedirect[] => {
  const sources = new Set<string>();

  for (const pagePath of pagePaths) {
    const source = pagePath.replace(/\/+$/u, "");

    if (source !== "" && !legacySources.has(source)) {
      sources.add(source);
    }
  }

  return [...sources]
    .toSorted()
    .map((source) => ({ destination: `${source}/`, source, status: 308 }));
};

export const redirectLine = (redirect: {
  readonly destination: string;
  readonly source: string;
  readonly status: number;
}): string => `${redirect.source} ${redirect.destination} ${redirect.status}`;

export const redirectsFile = (
  pagePaths: readonly string[],
  basePath = ""
): string =>
  `${[...legacyRedirects, ...trailingSlashRedirects(pagePaths)]
    .map((redirect) =>
      redirectLine({
        destination: addSiteBasePath(basePath, redirect.destination),
        source: addSiteBasePath(basePath, redirect.source),
        status: redirect.status,
      })
    )
    .join("\n")}\n`;

export const headersFile = (existing: string, preview = false): string => {
  const missing = requiredHeaderLines(preview).filter(
    (line) => !existing.includes(line)
  );

  if (missing.length === 0) {
    return existing;
  }

  const block = `/*\n${missing.map((line) => `  ${line}`).join("\n")}\n`;
  const separator = existing === "" || existing.endsWith("\n") ? "" : "\n";

  return `${existing}${separator}${existing === "" ? "" : "\n"}${block}`;
};

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
