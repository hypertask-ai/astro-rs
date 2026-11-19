#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SCREENS = process.env.SCREENS_DIR ?? "verify-screens";

const TIMEOUT = 45_000;

/** @typedef {{ text: () => string; type: () => string }} VerifierConsoleMessage */
/** @typedef {{ message: string }} VerifierPageError */
/** @typedef {{ errorText: string }} VerifierRequestFailure */
/** @typedef {{ failure: () => VerifierRequestFailure | null; method: () => string; url: () => string }} VerifierRequest */
/** @typedef {{ headers: () => Record<string, string>; status: () => number }} VerifierResponse */
/** @typedef {{ close: () => Promise<void>; newPage: () => Promise<VerifierPage> }} VerifierContext */
/** @typedef {{ close: () => Promise<void>; newContext: (options: { deviceScaleFactor: number; permissions?: string[]; viewport: { height: number; width: number } }) => Promise<VerifierContext> }} VerifierBrowser */
/** @typedef {{ chromium: { launch: () => Promise<VerifierBrowser> } }} VerifierChromium */
/** @typedef {{ click: (selector: string, options?: { timeout?: number }) => Promise<void>; evaluate: <Result>(expression: string) => Promise<Result>; goto: (url: string, options?: { timeout?: number; waitUntil?: string }) => Promise<VerifierResponse | null>; keyboard: { press: (key: string) => Promise<void> }; on: (event: string, handler: (value: never) => void) => void; screenshot: (options: { fullPage: boolean; path: string }) => Promise<Uint8Array>; title: () => Promise<string>; url: () => string; waitForEvent: (event: string, options?: { timeout?: number }) => Promise<unknown>; waitForLoadState: (state?: string, options?: { timeout?: number }) => Promise<void>; waitForTimeout: (milliseconds: number) => Promise<void> }} VerifierPage */
/** @typedef {{ height: number; name: string; width: number }} Viewport */
/** @typedef {{ consoleErrors: string[]; failedRequests: string[]; pageErrors: string[] }} Watch */
/** @typedef {{ canonical: string; description: string; ogTitle: string; robots: string; title: string }} HeadTags */
/** @typedef {{ clipboard: string; headTags: HeadTags; robotsHeader: string; screenshot: string; status: number; textLines: string[]; title: string; url: string }} SideState */
/** @typedef {{ action: string; addedInHead: string[]; base: SideState; head: SideState; missingFromHead: string[] }} ActReport */
/** @typedef {{ context: VerifierContext; page: VerifierPage; watched: Watch }} Session */
/** @typedef {{ watched: Watch }} Runtime */
/** @typedef {{ level: string; text: string }} Heading */
/** @typedef {{ alt: string; resolved: string; src: string }} PageImage */
/** @typedef {{ href: string; resolved: string; text: string }} PageLink */
/** @typedef {{ height: number; width: number }} ShotSize */
/** @typedef {{ basePath: string; root: string }} SiteParts */
/** @typedef {{ consoleErrors: string[]; error?: string; failedRequests: string[]; finalUrl?: string; fonts?: string[]; head?: HeadTags; headings?: Heading[]; images?: PageImage[]; label: string; links?: PageLink[]; pageErrors: string[]; robotsHeader?: string; screenshotFull?: string; screenshotViewport?: string; status?: number; textFile?: string; title?: string; url: string; viewport: string; viewportSize?: ShotSize; words?: number }} PageReport */
/** @typedef {{ addedImagesInHead: string[]; addedInHead: string[]; addedLinksInHead: string[]; baseHead: HeadTags; baseStatus: number; headHead: HeadTags; headStatus: number; imagesOutsideHeadBase: string[]; linksOutsideHeadBase: string[]; missingFromHead: string[]; missingImagesInHead: string[]; missingLinksFromHead: string[]; path: string }} CompareReport */

const VIEWPORTS = [
  { height: 900, name: "1440", width: 1440 },
  { height: 844, name: "390", width: 390 },
];

const HEADER_NAMES = [
  "access-control-allow-origin",
  "cache-control",
  "content-type",
  "content-security-policy",
  "x-frame-options",
];

const WHITESPACE = /\s+/gu;

const SLUG = /[^a-z0-9]+/giu;

const VISIBLE_TEXT = `(() => {
  const body = document.body;
  if (body === null) return "";
  const ignored = new Set(["NOSCRIPT", "SCRIPT", "STYLE", "TEMPLATE"]);
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const lines = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (parent !== null && !ignored.has(parent.tagName) && parent.checkVisibility()) {
      const text = (node.textContent ?? "").replace(/\\s+/gu, " ").trim();
      if (text.length > 0) {
        lines.push(text);
      }
    }
  }
  return lines.join("\\n");
})()`;

const HEADINGS = `Array.from(document.querySelectorAll("h1, h2, h3")).map((node) => ({
  level: node.tagName.toLowerCase(),
  text: (node.textContent ?? "").replace(/\\s+/gu, " ").trim(),
}))`;

const LINKS = `Array.from(document.querySelectorAll("a[href]")).map((node) => ({
  href: node.getAttribute("href") ?? "",
  resolved: node.href,
  text: (node.textContent ?? "").replace(/\\s+/gu, " ").trim(),
}))`;

const IMAGES = `Array.from(document.querySelectorAll("img")).map((node) => ({
  alt: node.getAttribute("alt") ?? "",
  resolved: node.currentSrc || node.src,
  src: node.getAttribute("src") ?? "",
}))`;

const HEAD_TAGS = `(() => {
  const content = (selector) =>
    document.querySelector(selector)?.getAttribute("content") ?? "";
  return {
    canonical:
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
    description: content('meta[name="description"]'),
    ogTitle: content('meta[property="og:title"]'),
    robots: content('meta[name="robots"]'),
    title: document.title,
  };
})()`;

const FONTS = `(async () => {
  await document.fonts.ready;
  return Array.from(document.fonts).flatMap((face) =>
    face.status === "loaded" ? [face.family + " " + face.weight + " " + face.style] : [],
  );
})()`;

const USAGE = `node verify/driver.mjs <command> [flags]

Commands:
  page     --head <url> [--base <url>] [--path /pricing/ ...]
  compare  --head <url> --base <url> [--path /pricing/ ...]
  act      --head <url> --base <url> --path / (--click <selector> | --press <key>) [--viewport 390]
  probe    --head <url> [--base <url>] [--path /v2 ...]

Flags:
  SCREENS_DIR points at the screenshot and report directory.
  A --path may be a site path such as /pricing/ or a full URL.
  --head-base-path overrides the path the head site is served under, taken from --head by default.
  compare reports links and images that stay outside that path in linksOutsideHeadBase and imagesOutsideHeadBase.`;

const argv = process.argv.slice(2);

const [command, ...rest] = argv;

/** @param {string} name
 * @returns {string} */
const flag = (name) => {
  const at = rest.indexOf(`--${name}`);

  if (at === -1) {
    return "";
  }

  return rest[at + 1] ?? "";
};

/** @param {string} name
 * @returns {string[]} */
const flagAll = (name) => {
  const indexes = rest
    .map((value, index) => (value === `--${name}` ? index : -1))
    .filter((index) => index >= 0);

  /** @type {string[]} */
  const found = [];

  for (const index of indexes) {
    found.push(rest[index + 1] ?? "");
  }

  return found;
};

/** @returns {string[]} */
const paths = () => {
  const given = flagAll("path").filter((value) => value.length > 0);

  return given.length > 0 ? given : ["/"];
};

/** @param {string} name
 * @returns {string} */
const origin = (name) => flag(name).replace(/\/+$/u, "");

/** @param {string} value
 * @returns {string} */
const target = (value) =>
  /^https?:/iu.test(value) ? value : `${origin("head")}${value}`;

/** @param {string} value
 * @returns {string} */
const slug = (value) => value.replaceAll(SLUG, "-");

/** @returns {Promise<VerifierBrowser>} */
const launch = async () => {
  /** @type {unknown} */
  const imported = await import("playwright");
  /** @type {VerifierChromium} */
  const playwright = imported;

  return await playwright.chromium.launch();
};

/** @param {VerifierPage} page
 * @returns {Watch} */
const listen = (page) => {
  /** @type {string[]} */
  const consoleErrors = [];
  /** @type {string[]} */
  const failedRequests = [];
  /** @type {string[]} */
  const pageErrors = [];

  /** @type {(message: VerifierConsoleMessage) => void} */
  const onMessage = (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  };

  /** @type {(error: VerifierPageError) => void} */
  const onPageError = (error) => {
    pageErrors.push(error.message);
  };

  /** @type {(request: VerifierRequest) => void} */
  const onRequestFailed = (request) => {
    const failure = request.failure();

    failedRequests.push(
      `${request.method()} ${request.url()} ${failure?.errorText ?? ""}`
    );
  };

  page.on("console", onMessage);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);

  return { consoleErrors, failedRequests, pageErrors };
};

/** @param {VerifierBrowser} browser
 * @param {Viewport} viewport
 * @returns {Promise<Session>} */
const open = async (browser, viewport) => {
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    permissions: ["clipboard-read", "clipboard-write"],
    viewport,
  });
  const page = await context.newPage();
  const watched = listen(page);

  return { context, page, watched };
};

/** @param {VerifierPage} page
 * @returns {Promise<void>} */
const settle = async (page) => {
  await page.evaluate(`document.fonts.ready.then(() => "ready")`);
  await page.waitForTimeout(700);
};

/** @param {string} file
 * @param {string} text
 * @returns {Promise<void>} */
const writeText = async (file, text) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text, "utf-8");
};

/** @param {VerifierPage} page
 * @param {string} file
 * @param {boolean} fullPage
 * @returns {Promise<ShotSize>} */
const shoot = async (page, file, fullPage) => {
  await mkdir(path.dirname(file), { recursive: true });

  /** @type {Uint8Array} */
  const image = await page.screenshot({ fullPage, path: file });

  const view = new DataView(image.buffer, image.byteOffset, image.byteLength);

  return { height: view.getUint32(20), width: view.getUint32(16) };
};

/** @param {string} text
 * @returns {string[]} */
const linesOf = (text) =>
  text
    .split("\n")
    .map((line) => line.replaceAll(WHITESPACE, " ").trim())
    .filter((line) => line.length > 0);

/** @param {PageLink[] | undefined} links
 * @returns {string[]} */
const linkNames = (links) =>
  (links ?? []).map((link) => `${link.href} ${link.text}`.trim());

/** @param {string} value
 * @param {SiteParts} site
 * @returns {string} */
const comparable = (value, site) => {
  /** @type {URL} */
  let url;

  try {
    url = new URL(value);
  } catch {
    return value;
  }

  const root = `${url.protocol}//${url.host}`;
  const rest = `${url.pathname}${url.search}${url.hash}`;

  if (root !== site.root) {
    return `${root}${rest}`;
  }

  if (site.basePath.length === 0) {
    return rest;
  }

  const atBase =
    rest === site.basePath ||
    rest.startsWith(`${site.basePath}/`) ||
    rest.startsWith(`${site.basePath}?`);

  return atBase ? rest.slice(site.basePath.length) || "/" : rest;
};

/** @param {string} value
 * @param {SiteParts} site
 * @returns {boolean} */
const outsideBase = (value, site) => {
  if (site.basePath.length === 0) {
    return false;
  }

  /** @type {URL} */
  let url;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (`${url.protocol}//${url.host}` !== site.root) {
    return false;
  }

  return !(
    url.pathname === site.basePath ||
    url.pathname.startsWith(`${site.basePath}/`)
  );
};

/** @param {string} siteUrl
 * @returns {SiteParts} */
const siteParts = (siteUrl) => {
  /** @type {URL} */
  let site;

  try {
    site = new URL(siteUrl);
  } catch {
    return { basePath: "", root: "" };
  }

  const given = flag("head-base-path").replace(/\/+$/u, "");

  return {
    basePath: given.length > 0 ? given : site.pathname.replace(/\/+$/u, ""),
    root: `${site.protocol}//${site.host}`,
  };
};

/** @param {string[]} values
 * @param {string[]} against
 * @returns {string[]} */
const difference = (values, against) => {
  const known = new Set(against);

  return values.filter((value) => !known.has(value));
};

/** @param {PageImage[] | undefined} images
 * @param {SiteParts} site
 * @returns {string[]} */
const imageNames = (images, site) =>
  (images ?? []).map((image) =>
    `${comparable(image.resolved, site)} ${image.alt}`.trim()
  );

/** @type {HeadTags} */
const emptyHead = {
  canonical: "",
  description: "",
  ogTitle: "",
  robots: "",
  title: "",
};

/** @param {string | undefined} file
 * @returns {Promise<string[]>} */
const readText = async (file) => {
  if (file === undefined) {
    return [];
  }

  const loaded = await readFile(file, "utf-8");

  return [...new Set(linesOf(loaded))];
};

/** @param {VerifierPage} page
 * @param {string} url
 * @param {string} label
 * @param {Viewport} viewport
 * @param {Runtime} runtime
 * @returns {Promise<PageReport>} */
const readPage = async (page, url, label, viewport, runtime) => {
  const stem = `${label}-${viewport.name}`;
  /** @type {VerifierResponse | null} */
  let response = null;

  try {
    response = await page.goto(url, { timeout: TIMEOUT, waitUntil: "load" });
  } catch (error) {
    return {
      consoleErrors: runtime.watched.consoleErrors,
      error: String(error),
      failedRequests: runtime.watched.failedRequests,
      label,
      pageErrors: runtime.watched.pageErrors,
      url,
      viewport: viewport.name,
    };
  }

  await settle(page);
  /** @type {string} */
  const text = await page.evaluate(VISIBLE_TEXT);
  const title = await page.title();
  /** @type {HeadTags} */
  const head = await page.evaluate(HEAD_TAGS);
  /** @type {Heading[]} */
  const headings = await page.evaluate(HEADINGS);
  /** @type {PageLink[]} */
  const links = await page.evaluate(LINKS);
  /** @type {string[]} */
  const fonts = await page.evaluate(FONTS);
  /** @type {PageImage[]} */
  const images = await page.evaluate(IMAGES);
  const textFile = path.join(SCREENS, `${stem}-text.txt`);
  const viewportFile = path.join(SCREENS, `${stem}-viewport.png`);
  const fullFile = path.join(SCREENS, `${stem}-full.png`);
  await writeText(textFile, text);
  const viewportSize = await shoot(page, viewportFile, false);
  await shoot(page, fullFile, true);

  return {
    consoleErrors: runtime.watched.consoleErrors,
    failedRequests: runtime.watched.failedRequests,
    finalUrl: page.url(),
    fonts,
    head,
    headings,
    images,
    label,
    links,
    pageErrors: runtime.watched.pageErrors,
    robotsHeader: response?.headers()["x-robots-tag"] ?? "",
    screenshotFull: fullFile,
    screenshotViewport: viewportFile,
    status: response?.status() ?? 0,
    textFile,
    title,
    url,
    viewport: viewport.name,
    viewportSize,
    words: text.split(WHITESPACE).filter((word) => word.length > 0).length,
  };
};

/** @param {VerifierBrowser} browser
 * @param {string} url
 * @param {string} label
 * @param {Viewport} viewport
 * @returns {Promise<PageReport>} */
const visitOne = async (browser, url, label, viewport) => {
  const session = await open(browser, viewport);

  const report = await readPage(session.page, url, label, viewport, {
    watched: session.watched,
  });

  await session.context.close();

  return report;
};

/** @param {VerifierBrowser} browser
 * @param {string} base
 * @param {string} label
 * @param {string} routePath
 * @returns {Promise<PageReport[]>} */
const visit = (browser, base, label, routePath) => {
  const url = /^https?:/iu.test(routePath) ? routePath : `${base}${routePath}`;

  return Promise.all(
    VIEWPORTS.map(
      async (viewport) =>
        await visitOne(browser, url, `${label}${slug(routePath)}`, viewport)
    )
  );
};

/** @param {VerifierBrowser} browser
 * @param {string} base
 * @param {string} namePrefix
 * @returns {Promise<{ pages: PageReport[]; path: string }[]>} */
const visitAll = (browser, base, namePrefix) =>
  Promise.all(
    paths().map(async (routePath) => ({
      pages: await visit(browser, base, namePrefix, routePath),
      path: routePath,
    }))
  );

/** @param {VerifierBrowser} browser
 * @param {string} routePath
 * @returns {Promise<CompareReport>} */
const compareOne = async (browser, routePath) => {
  const headSession = await open(browser, VIEWPORTS[0]);
  const baseSession = await open(browser, VIEWPORTS[0]);

  const headReport = await readPage(
    headSession.page,
    target(routePath),
    `compare-head${slug(routePath)}`,
    VIEWPORTS[0],
    { watched: headSession.watched }
  );

  const baseReport = await readPage(
    baseSession.page,
    `${origin("base")}${routePath}`,
    `compare-base${slug(routePath)}`,
    VIEWPORTS[0],
    { watched: baseSession.watched }
  );

  await headSession.context.close();
  await baseSession.context.close();
  const headSite = siteParts(origin("head"));
  const baseSite = siteParts(origin("base"));
  const headLines = await readText(headReport.textFile);
  const baseLines = await readText(baseReport.textFile);
  const headLinks = linkNames(headReport.links);
  const baseLinks = linkNames(baseReport.links);
  const headImageNames = imageNames(headReport.images, headSite);
  const baseImageNames = imageNames(baseReport.images, baseSite);

  return {
    addedImagesInHead: difference(headImageNames, baseImageNames),
    addedInHead: difference(headLines, baseLines),
    addedLinksInHead: difference(headLinks, baseLinks),
    baseHead: baseReport.head ?? emptyHead,
    baseStatus: baseReport.status ?? 0,
    headHead: headReport.head ?? emptyHead,
    headStatus: headReport.status ?? 0,
    imagesOutsideHeadBase: (headReport.images ?? []).flatMap((image) =>
      outsideBase(image.resolved, headSite) ? [image.src] : []
    ),
    linksOutsideHeadBase: (headReport.links ?? []).flatMap((link) =>
      outsideBase(link.resolved, headSite)
        ? [`${link.href} ${link.text}`.trim()]
        : []
    ),
    missingFromHead: difference(baseLines, headLines),
    missingImagesInHead: difference(baseImageNames, headImageNames),
    missingLinksFromHead: difference(baseLinks, headLinks),
    path: routePath,
  };
};

/** @param {VerifierBrowser} browser
 * @returns {Promise<CompareReport[]>} */
const compareAll = (browser) =>
  Promise.all(
    paths().map(async (routePath) => await compareOne(browser, routePath))
  );

/** @param {VerifierPage} page
 * @param {string} originUrl
 * @param {string} stem
 * @returns {Promise<SideState>} */
const actOnSide = async (page, originUrl, stem) => {
  const response = await page.goto(originUrl, {
    timeout: TIMEOUT,
    waitUntil: "load",
  });

  await settle(page);

  const click = flag("click");

  const press = flag("press");

  if (click.length > 0) {
    await page.click(click, { timeout: TIMEOUT });
  }

  if (press.length > 0) {
    const navigated = page
      .waitForEvent("framenavigated", { timeout: 5_000 })
      .catch(() => undefined);

    await page.keyboard.press(press);

    await navigated;
  }

  await page
    .waitForLoadState("load", { timeout: 15_000 })
    .catch(() => undefined);

  await page.waitForTimeout(700);

  /** @type {string} */
  const text = await page.evaluate(VISIBLE_TEXT);

  /** @type {HeadTags} */
  const headTags = await page.evaluate(HEAD_TAGS);

  /** @type {string} */
  const clipboard = await page
    .evaluate("navigator.clipboard.readText().catch(() => '')")
    .catch(() => "");

  const textFile = path.join(SCREENS, `${stem}-text.txt`);

  const screenshot = path.join(SCREENS, `${stem}.png`);

  await writeText(textFile, text);

  await shoot(page, screenshot, false);

  return {
    clipboard,
    headTags,
    robotsHeader: response?.headers()["x-robots-tag"] ?? "",
    screenshot,
    status: response?.status() ?? 0,
    textLines: linesOf(text),
    title: await page.title(),
    url: page.url(),
  };
};

/** @param {VerifierBrowser} browser
 * @param {string} routePath
 * @returns {Promise<ActReport>} */
const actOne = async (browser, routePath) => {
  const name = slug(routePath);

  const click = flag("click");

  const press = flag("press");

  const action =
    click.length > 0
      ? `click ${click}`
      : `press ${press.length > 0 ? press : ""}`;

  const viewport =
    VIEWPORTS.find((candidate) => candidate.name === flag("viewport")) ??
    VIEWPORTS[0];

  const headSession = await open(browser, viewport);

  const baseSession = await open(browser, viewport);

  const stem = `${viewport.name}-${name}`;

  const head = await actOnSide(
    headSession.page,
    target(routePath),
    `act-head${stem}`
  );

  const base = await actOnSide(
    baseSession.page,
    `${origin("base")}${routePath}`,
    `act-base${stem}`
  );

  await headSession.context.close();

  await baseSession.context.close();

  const baseLines = new Set(base.textLines);

  const headLines = new Set(head.textLines);

  return {
    action: `${action} at ${viewport.name}`,
    addedInHead: head.textLines.filter((line) => !baseLines.has(line)),
    base,
    head,
    missingFromHead: base.textLines.filter((line) => !headLines.has(line)),
  };
};

/** @param {PageReport[]} headPages
 * @param {PageReport[]} basePages
 * @returns {string} */
const sheetHtml = (headPages, basePages) => {
  /** @param {PageReport} report
   * @returns {string} */
  const name = (report) => path.basename(report.screenshotViewport ?? "");

  /** @param {string} value
   * @returns {string} */
  const escape = (value) =>
    value.replaceAll("&", "&amp;").replaceAll("<", "&lt;");

  /** @param {PageReport} report
   * @param {string} label
   * @param {boolean} eager
   * @returns {string} */
  const figure = (report, label, eager) => {
    const size = report.viewportSize;
    const measured =
      size === undefined
        ? ""
        : ` width="${size.width}" height="${size.height}"`;
    const deferred = eager ? "" : ' loading="lazy" decoding="async"';

    return `<figure><img src="${name(report)}" alt="${escape(label)} at ${report.viewport} pixels wide"${measured}${deferred}><figcaption>${escape(label.toLowerCase())} ${report.status ?? 0}</figcaption></figure>`;
  };

  const baseByLabel = new Map(
    basePages.map((report) => [report.label, report])
  );

  const rows = headPages
    .map((headReport, index) => {
      const baseLabel = headReport.label.replace(/^head/u, "base");

      const baseReport = baseByLabel.get(baseLabel);

      const cells = [
        baseReport === undefined
          ? `<p>old side missing for ${escape(headReport.url)}</p>`
          : figure(baseReport, "Old site", index === 0),
        figure(headReport, "New site", index === 0),
      ];

      return `<section><h2>${escape(headReport.url)}</h2><div class="pair">${cells.join("")}</div></section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>hypertask.ai old and new side by side</title>
<style>
body { background: #000; color: #fff; font: 14px/1.5 system-ui, sans-serif; margin: 0; padding: 24px; }
h1 { font-size: 20px; }
h2 { font-size: 14px; font-weight: 400; color: #a1a1aa; margin: 32px 0 8px; }
.pair { display: grid; gap: 16px; grid-template-columns: 1fr; }
figure { margin: 0; }
img { border: 1px solid #222226; display: block; height: auto; max-width: 100%; }
figcaption { color: #a1a1aa; padding-top: 4px; }
@media (min-width: 900px) { .pair { grid-template-columns: 1fr 1fr; } }
</style>
</head>
<body>
<h1>hypertask.ai old and new side by side</h1>
<main>
${rows}
</main>
</body>
</html>
`;
};

/** @param {VerifierBrowser} browser
 * @returns {Promise<ActReport[]>} */
const actAll = (browser) =>
  Promise.all(
    paths().map(async (routePath) => await actOne(browser, routePath))
  );

/** @param {string} base
 * @param {string} routePath
 * @returns {Promise<Record<string, unknown>>} */
const probe = async (base, routePath) => {
  const { href } = new URL(routePath, `${base}/`);

  try {
    const response = await fetch(href, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT),
    });

    const body = await response.text();

    const headers = Object.fromEntries(
      HEADER_NAMES.map((name) => [name, response.headers.get(name) ?? ""])
    );

    return {
      bodyExcerpt: body.slice(0, 600),
      contentType: response.headers.get("content-type") ?? "",
      headers,
      location: response.headers.get("location") ?? "",
      status: response.status,
      url: href,
    };
  } catch (error) {
    return { error: String(error), url: href };
  }
};

/** @returns {Promise<Record<string, unknown>>} */
const probeAll = async () => {
  const head = origin("head");
  const base = origin("base");

  const headProbes = await Promise.all(
    paths().map(async (routePath) => await probe(head, routePath))
  );

  const baseProbes = await Promise.all(
    paths().map(async (routePath) =>
      base.length > 0
        ? await probe(base, routePath)
        : { skipped: "no base url" }
    )
  );

  return { base, baseProbes, head, headProbes };
};

/** @returns {Promise<void>} */
const run = async () => {
  if (command === undefined || command === "help" || command === "--help") {
    process.stdout.write(`${USAGE}\n`);

    return;
  }

  if (command === "probe") {
    const report = await probeAll();

    await writeText(
      path.join(SCREENS, "report-probe.json"),
      JSON.stringify(report, null, 2)
    );
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

    return;
  }

  const browser = await launch();

  try {
    if (command === "page") {
      const report = await visitAll(browser, origin("head"), "head");
      const base = origin("base");

      const baseReport =
        base.length > 0 ? await visitAll(browser, base, "base") : [];

      const sheetPath =
        baseReport.length > 0
          ? path.join(SCREENS, "side-by-side.html")
          : undefined;

      if (sheetPath !== undefined) {
        await writeText(
          sheetPath,
          sheetHtml(
            report.flatMap((entry) => entry.pages),
            baseReport.flatMap((entry) => entry.pages)
          )
        );
      }

      const payload = {
        base,
        baseReport,
        head: origin("head"),
        headReport: report,
        sheetPath,
      };

      await writeText(
        path.join(SCREENS, "report-page.json"),
        JSON.stringify(payload, null, 2)
      );
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);

      return;
    }

    if (command === "act") {
      const report = await actAll(browser);
      const payload = { base: origin("base"), head: origin("head"), report };

      await writeText(
        path.join(SCREENS, "report-act.json"),
        JSON.stringify(payload, null, 2)
      );
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);

      return;
    }

    if (command === "compare") {
      const report = await compareAll(browser);
      const payload = { base: origin("base"), head: origin("head"), report };

      await writeText(
        path.join(SCREENS, "report-compare.json"),
        JSON.stringify(payload, null, 2)
      );
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);

      return;
    }

    process.stderr.write(`unknown command ${command}\n${USAGE}\n`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
};

await run();
