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

export const notFoundHandling = "single-page-application" as const;

export const securityHeaderLines: readonly string[] = [
  "Strict-Transport-Security: max-age=31536000",
  "X-Content-Type-Options: nosniff",
  "Referrer-Policy: strict-origin-when-cross-origin",
];

const requiredHeaderLines = (preview: boolean): readonly string[] =>
  preview ? [...securityHeaderLines, noindexHeaderLine] : securityHeaderLines;

interface HeaderBlock {
  readonly lines: readonly string[];
  readonly pattern: string;
}

const headerBlocks = (file: string): readonly HeaderBlock[] => {
  const blocks: { lines: string[]; pattern: string }[] = [];

  for (const raw of file.split("\n")) {
    const line = raw.trim();

    if (line === "") {
      continue;
    }

    if (raw === line) {
      blocks.push({ lines: [], pattern: line });

      continue;
    }

    const last = blocks.at(-1);

    if (last !== undefined) {
      last.lines.push(line);
    }
  }

  return blocks;
};

const renderHeaderBlocks = (blocks: readonly HeaderBlock[]): string =>
  `${blocks
    .map((block) =>
      [block.pattern, ...block.lines.map((line) => `  ${line}`)].join("\n")
    )
    .join("\n\n")}\n`;

export const securityHeaders: Readonly<Record<string, string>> =
  Object.fromEntries(
    securityHeaderLines.map((line) => {
      const separator = line.indexOf(":");

      return [
        line.slice(0, separator).trim().toLowerCase(),
        line.slice(separator + 1).trim(),
      ] as const;
    })
  );

export const htmlAnswerCacheControl =
  "public, max-age=0, must-revalidate, no-store" as const;

export const redirectAnswerCacheControl = "no-store" as const;

export const redirectAnswerContentType = "text/plain;charset=UTF-8" as const;

export const homeAnswerHeaders = {
  ...securityHeaders,
  "cache-control": htmlAnswerCacheControl,
};

export const redirectAnswerHeaders = (location: string) => ({
  ...securityHeaders,
  "cache-control": redirectAnswerCacheControl,
  "content-type": redirectAnswerContentType,
  location,
});

export const redirectAnswerBody = (location: string): string =>
  `Redirecting to ${location}`;

export const redirectResponse = (location: string, status: number): Response =>
  new Response(redirectAnswerBody(location), {
    headers: redirectAnswerHeaders(location),
    status,
  });

export const workerFirstRedirectSources: readonly string[] =
  legacyRedirects.map((redirect) => redirect.source);

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

const mountedHeaderPaths = (existing: string, basePath: string): string =>
  basePath === ""
    ? existing
    : existing
        .split("\n")
        .map((line) =>
          line.startsWith("/") ? addSiteBasePath(basePath, line) : line
        )
        .join("\n");

export const headersFile = (existing: string, basePath = ""): string => {
  const preview = basePath !== "";
  const mounted = mountedHeaderPaths(existing, basePath);
  const required = requiredHeaderLines(preview);
  const blocks = headerBlocks(mounted);
  const root = blocks.find(
    (block) => block.pattern === addSiteBasePath(basePath, "/*")
  );

  if (root === undefined) {
    const block = `${addSiteBasePath(basePath, "/*")}\n${required
      .map((line) => `  ${line}`)
      .join("\n")}\n`;
    const separator = mounted === "" || mounted.endsWith("\n") ? "" : "\n";

    return `${mounted}${separator}${mounted === "" ? "" : "\n"}${block}`;
  }

  const merged = [
    ...root.lines,
    ...required.filter((line) => !root.lines.includes(line)),
  ];

  return merged.length === root.lines.length
    ? mounted
    : renderHeaderBlocks(
        blocks.map((block) =>
          block === root ? { lines: merged, pattern: block.pattern } : block
        )
      );
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

export interface AddressAnswer {
  readonly location: string | null;
  readonly status: number;
}

export const addressAnswer = (
  path: string,
  pagePaths: readonly string[]
): AddressAnswer => {
  const legacy = legacyAnswer(path);

  if (legacy.kind === "redirect") {
    return { location: legacy.location, status: legacy.status };
  }

  const redirect = trailingSlashRedirects(pagePaths).find(
    (rule) => rule.source === path
  );

  return redirect === undefined
    ? { location: null, status: 200 }
    : { location: redirect.destination, status: redirect.status };
};
