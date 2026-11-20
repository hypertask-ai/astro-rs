const rootRelativePath = /^\/[\w.~%/-]*$/u;

const htmlAttribute =
  /(?<attribute>href|src|srcset|action|poster)="(?<value>[^"]*)"/gu;

const cssUrl = /url\(\s*(?<quote>['"]?)(?<url>[^'")]+)\k<quote>\s*\)/gu;

const scriptAsset =
  /"(?<asset>\/(?!\/)[^"\s]*\.(?:js|mjs|css|woff2?|png|avif|jpe?g|gif|svg|webp|mp4|webm|json|xml|txt))"/gu;

const pathOf = (value: string): string => value.split(/[?#]/u)[0] ?? value;

export const normalizeSiteBasePath = (value: string | undefined): string => {
  const trimmed = (value ?? "").trim();

  if (trimmed === "" || trimmed === "/") {
    return "";
  }

  if (!rootRelativePath.test(trimmed) || trimmed.includes("//")) {
    throw new Error(
      "Site base path must be one root-relative path such as /ratstack. A relative path or a full URL cannot prefix the site's own links. Fix: set SITE_BASE_PATH to /ratstack, or leave it empty to serve the site at the origin root."
    );
  }

  return `/${trimmed.replaceAll(/^\/+|\/+$/gu, "")}`;
};

export const addSiteBasePath = (basePath: string, path: string): string => {
  if (basePath === "" || !path.startsWith("/") || path.startsWith("//")) {
    return path;
  }

  const own = pathOf(path);

  if (own === basePath || own.startsWith(`${basePath}/`)) {
    return path;
  }

  return `${basePath}${path}`;
};

export const removeSiteBasePath = (basePath: string, path: string): string => {
  if (basePath === "") {
    return path;
  }

  if (path === basePath) {
    return "/";
  }

  return path.startsWith(`${basePath}/`) ? path.slice(basePath.length) : path;
};

export const escapesSiteBasePath = (basePath: string, url: string): boolean => {
  if (basePath === "" || !url.startsWith("/") || url.startsWith("//")) {
    return false;
  }

  const own = pathOf(url);

  return own !== basePath && !own.startsWith(`${basePath}/`);
};

const htmlUrls = (content: string): readonly string[] =>
  [...content.matchAll(htmlAttribute)].flatMap((match) => {
    const value = match.groups?.value ?? "";

    if (match.groups?.attribute !== "srcset") {
      return [value];
    }

    return value
      .split(",")
      .map((candidate) => candidate.trim().split(/\s+/u)[0] ?? "");
  });

const cssUrls = (content: string): readonly string[] =>
  [...content.matchAll(cssUrl)].map((match) => match.groups?.url ?? "");

const scriptUrls = (content: string): readonly string[] =>
  [...content.matchAll(scriptAsset)].map((match) => match.groups?.asset ?? "");

const redirectUrls = (content: string): readonly string[] =>
  content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"))
    .flatMap((line) => line.split(/\s+/u).slice(0, 2));

const universalHeaderPatterns = new Set(["/*", "*"]);

const headerUrls = (content: string): readonly string[] =>
  content
    .split("\n")
    .filter(
      (line) => line.startsWith("/") && !universalHeaderPatterns.has(line)
    );

export const siteUrls = (file: string, content: string): readonly string[] => {
  if (file.endsWith(".html")) {
    return htmlUrls(content);
  }

  if (file.endsWith(".css")) {
    return cssUrls(content);
  }

  if (file.endsWith(".js")) {
    return scriptUrls(content);
  }

  if (file.endsWith("_redirects")) {
    return redirectUrls(content);
  }

  if (file.endsWith("_headers")) {
    return headerUrls(content);
  }

  return [];
};

export const escapingUrls = (
  basePath: string,
  file: string,
  content: string
): readonly string[] => [
  ...new Set(
    siteUrls(file, content).filter((url) => escapesSiteBasePath(basePath, url))
  ),
];

export const basePathViolationMessage = (
  basePath: string,
  file: string,
  url: string
): string =>
  `${file} points at ${url}, a same-site address outside the site base path. Every link, asset and redirect must stay under ${basePath} while the site is served there. Fix: build the URL with addSiteBasePath from \`apps/web/src/site-base-path.ts\`, the only owner of SITE_BASE_PATH.`;
