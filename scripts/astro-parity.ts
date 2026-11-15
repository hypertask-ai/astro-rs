// @effect-diagnostics nodeBuiltinImport:off -- This Node CLI reads a sitemap and writes screenshots, pixel diffs, byte diffs, and reports directly to disk.
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { chromium } from "playwright";
import type { BrowserContext, Page } from "playwright";
import { PNG } from "pngjs";

interface ByteDiff {
  readonly firstDifference: number | null;
  readonly newLength: number;
  readonly oldLength: number;
}

interface Capture {
  readonly bytes: Buffer;
  readonly contentType: string;
  readonly imagePath: string;
  readonly screenshot: Buffer;
  readonly status: number;
  readonly text: string;
  readonly title: string;
}

interface DiffResult {
  readonly diffImage: Buffer | null;
  readonly percent: number;
}

interface Job {
  readonly pagePath: string;
  readonly viewport: Viewport;
}

interface JobResult {
  readonly byteNote: string | null;
  readonly bytesMatch: boolean | null;
  readonly diffImagePath: string | null;
  readonly failure: string | null;
  readonly newImagePath: string | null;
  readonly newStatus: number | null;
  readonly newTitle: string | null;
  readonly oldImagePath: string | null;
  readonly oldStatus: number | null;
  readonly oldTitle: string | null;
  readonly pagePath: string;
  readonly percent: number | null;
  readonly textDiffPath: string | null;
  readonly textMatches: boolean | null;
  readonly viewport: string;
}

interface Viewport {
  readonly height: number;
  readonly name: string;
  readonly width: number;
}

const ASSET_PATHS: readonly string[] = [
  "/install",
  "/install.ps1",
  "/install.sh",
  "/llms.txt",
  "/robots.txt",
  "/rss.xml",
];

const CONCURRENCY = 4;

const DEFAULT_OLD_BASE = "https://hypertask.ai";

const DEFAULT_OUT = "parity-out";

const DEFAULT_PAGE_LIMIT = "0";

const DEFAULT_THRESHOLD = "0.1";

const LOC_PATTERN = /<loc>(?<loc>[^<]+)<\/loc>/gu;

const NAVIGATION_TIMEOUT_MS = 90_000;

const TAG_HREF_PATTERN = /href="(?<path>\/blog\/tags\/[^"#?]+)"/gu;

const VIEWPORTS: readonly Viewport[] = [
  { height: 900, name: "desktop", width: 1440 },
  { height: 844, name: "mobile", width: 390 },
];

const pageUrlIn = (base: string, pagePath: string): string => {
  const baseUrl = new URL(base);
  const prefix = baseUrl.pathname.replaceAll(/\/+$/gu, "");

  return new URL(`${prefix}${pagePath}`, baseUrl.origin).href;
};

const { values } = parseArgs({
  options: {
    "new-base": { default: "", type: "string" },
    "old-base": { default: DEFAULT_OLD_BASE, type: "string" },
    out: { default: DEFAULT_OUT, type: "string" },
    "page-limit": { default: DEFAULT_PAGE_LIMIT, type: "string" },
    threshold: { default: DEFAULT_THRESHOLD, type: "string" },
  },
});

const oldBase = values["old-base"] ?? DEFAULT_OLD_BASE;

const newBase = values["new-base"] ?? "";

const outDir = values.out ?? DEFAULT_OUT;

const pageLimit = Math.trunc(
  Number(values["page-limit"] ?? DEFAULT_PAGE_LIMIT)
);

const threshold = Number(values.threshold ?? DEFAULT_THRESHOLD);

const baselineMode = newBase.length === 0;

const imagesDir = path.join(outDir, "images");

const textsDir = path.join(outDir, "texts");

// @effect-diagnostics-next-line asyncFunction:off -- This Node CLI loads the sitemap and the blog index with native Promise I/O outside an Effect runtime.
const fetchText = async (url: string): Promise<string | null> => {
  // @effect-diagnostics-next-line globalFetch:off -- This Node CLI fetches a public sitemap outside an Effect runtime, as rat-stack's other Node tools do.
  const response = await fetch(url);
  const body = response.ok ? await response.text() : null;

  return body;
};

const locsIn = (sitemapText: string): string[] =>
  [...sitemapText.matchAll(LOC_PATTERN)].flatMap((match) => {
    const loc = match.groups?.loc ?? "";

    return loc.length === 0 ? [] : [loc];
  });

// @effect-diagnostics-next-line asyncFunction:off -- This Node CLI follows a sitemap index with native Promise I/O outside an Effect runtime.
const readSitemaps = async (base: string): Promise<string[]> => {
  const indexDocument = await fetchText(pageUrlIn(base, "/sitemap-index.xml"));

  if (indexDocument === null) {
    const plainDocument = await fetchText(pageUrlIn(base, "/sitemap.xml"));

    return plainDocument === null ? [] : locsIn(plainDocument);
  }

  const indexLocs = locsIn(indexDocument);
  const childLocs = indexLocs.filter((loc) => loc.endsWith(".xml"));

  if (childLocs.length === 0) {
    return indexLocs;
  }

  const childDocuments = await Promise.all(childLocs.map(fetchText));

  const pageLocs = childDocuments.flatMap((childDocument) =>
    childDocument === null ? [] : locsIn(childDocument)
  );

  return pageLocs.length > 0 ? pageLocs : indexLocs;
};

const tagPathsIn = (blogIndexHtml: string): string[] =>
  [...blogIndexHtml.matchAll(TAG_HREF_PATTERN)].flatMap((match) => {
    const pagePath = match.groups?.path ?? "";

    return pagePath.length === 0 ? [] : [pagePath];
  });

const uniquePaths = (pagePaths: readonly string[]): string[] => [
  ...new Set(pagePaths),
];

const fileNameFor = (pagePath: string): string => {
  const slug = pagePath
    .replaceAll(/[^0-9A-Za-z]+/gu, "-")
    .replaceAll(/^-+/gu, "")
    .replaceAll(/-+$/gu, "");

  return slug.length === 0 ? "index" : slug;
};

const isHtml = (contentType: string): boolean =>
  contentType.toLowerCase().includes("html");

// @effect-diagnostics-next-line asyncFunction:off -- Playwright reads page text through Promises outside an Effect runtime.
const visibleText = async (page: Page): Promise<string> => {
  const main = page.locator("main").first();
  const mainCount = await main.count();

  const raw =
    mainCount > 0
      ? await main.textContent()
      : await page.locator("body").textContent();

  return (raw ?? "").replaceAll(/\s+/gu, " ").trim();
};

// @effect-diagnostics-next-line asyncFunction:off -- Playwright is Promise based and this Node CLI drives it outside an Effect runtime.
const capture = async (
  page: Page,
  url: string,
  imagePath: string
): Promise<Capture> => {
  const response = await page.goto(url, {
    timeout: NAVIGATION_TIMEOUT_MS,
    waitUntil: "load",
  });

  if (response === null) {
    throw new Error(`No response from ${url}`);
  }

  await page.evaluate("document.fonts.ready");

  const buffer = await page.screenshot({
    animations: "disabled",
    caret: "hide",
  });

  const title = await page.title();
  const text = await visibleText(page);
  const bytes = await response.body();
  const contentType = response.headers()["content-type"] ?? "";

  writeFileSync(imagePath, buffer);

  return {
    bytes,
    contentType,
    imagePath,
    screenshot: buffer,
    status: response.status(),
    text,
    title,
  };
};

const comparePixels = (before: Buffer, after: Buffer): DiffResult => {
  const first = PNG.sync.read(before);
  const mask = PNG.sync.read(after);

  if (first.width !== mask.width || first.height !== mask.height) {
    return { diffImage: null, percent: 100 };
  }

  const pixels = first.width * first.height;
  let changed = 0;

  for (let index = 0; index < pixels; index += 1) {
    const offset = index * 4;

    const differs =
      first.data[offset] !== mask.data[offset] ||
      first.data[offset + 1] !== mask.data[offset + 1] ||
      first.data[offset + 2] !== mask.data[offset + 2];

    if (differs) {
      changed += 1;

      mask.data[offset] = 255;
      mask.data[offset + 1] = 0;
      mask.data[offset + 2] = 0;
      mask.data[offset + 3] = 255;
    } else {
      mask.data[offset + 3] = 0;
    }
  }

  return {
    diffImage: PNG.sync.write(mask),
    percent: pixels === 0 ? 0 : (changed / pixels) * 100,
  };
};

const compareBytes = (before: Buffer, after: Buffer): ByteDiff => {
  const shared = Math.min(before.length, after.length);

  let firstDifference: number | null = null;

  for (let index = 0; index < shared; index += 1) {
    if (before[index] !== after[index]) {
      firstDifference = index;
      break;
    }
  }

  const trailing = firstDifference === null && before.length !== after.length;

  return {
    firstDifference: trailing ? shared : firstDifference,
    newLength: after.length,
    oldLength: before.length,
  };
};

const describeBytes = (diff: ByteDiff): string =>
  diff.firstDifference === null
    ? `same bytes, ${diff.oldLength} bytes`
    : `bytes differ at ${diff.firstDifference}, old ${diff.oldLength}, new ${diff.newLength}`;

const emptyResult = (job: Job): JobResult => ({
  byteNote: null,
  bytesMatch: null,
  diffImagePath: null,
  failure: null,
  newImagePath: null,
  newStatus: null,
  newTitle: null,
  oldImagePath: null,
  oldStatus: null,
  oldTitle: null,
  pagePath: job.pagePath,
  percent: null,
  textDiffPath: null,
  textMatches: null,
  viewport: job.viewport.name,
});

const writeDiffImage = (
  diff: DiffResult,
  targetPath: string
): string | null => {
  if (diff.diffImage === null) {
    return null;
  }

  writeFileSync(targetPath, diff.diffImage);

  return targetPath;
};

const writeTextPair = (job: Job, oldText: string, newText: string): string => {
  const targetPath = path.join(
    textsDir,
    `${fileNameFor(job.pagePath)}-${job.viewport.name}.txt`
  );

  writeFileSync(targetPath, `OLD\n${oldText}\n\nNEW\n${newText}\n`);

  return targetPath;
};

// @effect-diagnostics-next-line asyncFunction:off -- Playwright is Promise based and this Node CLI drives it outside an Effect runtime.
const runJob = async (
  browserContext: BrowserContext,
  job: Job
): Promise<JobResult> => {
  const { height, name, width } = job.viewport;
  const pageName = fileNameFor(job.pagePath);
  const oldUrl = pageUrlIn(oldBase, job.pagePath);

  const newUrl = newBase.length > 0 ? pageUrlIn(newBase, job.pagePath) : null;

  const page = await browserContext.newPage();

  await page.setViewportSize({ height, width });

  try {
    const oldCapture = await capture(
      page,
      oldUrl,
      path.join(imagesDir, "old", name, `${pageName}.png`)
    );

    if (newUrl === null) {
      return {
        ...emptyResult(job),
        oldImagePath: oldCapture.imagePath,
        oldStatus: oldCapture.status,
        oldTitle: oldCapture.title,
      };
    }

    const newCapture = await capture(
      page,
      newUrl,
      path.join(imagesDir, "new", name, `${pageName}.png`)
    );

    const diff = comparePixels(oldCapture.screenshot, newCapture.screenshot);
    const textMatches = oldCapture.text === newCapture.text;

    const byteDiff =
      isHtml(oldCapture.contentType) && isHtml(newCapture.contentType)
        ? null
        : compareBytes(oldCapture.bytes, newCapture.bytes);

    return {
      ...emptyResult(job),
      byteNote: byteDiff === null ? null : describeBytes(byteDiff),
      bytesMatch: byteDiff === null ? null : byteDiff.firstDifference === null,
      diffImagePath: writeDiffImage(
        diff,
        path.join(imagesDir, "diff", name, `${pageName}.png`)
      ),
      newImagePath: newCapture.imagePath,
      newStatus: newCapture.status,
      newTitle: newCapture.title,
      oldImagePath: oldCapture.imagePath,
      oldStatus: oldCapture.status,
      oldTitle: oldCapture.title,
      percent: diff.percent,
      textDiffPath: textMatches
        ? null
        : writeTextPair(job, oldCapture.text, newCapture.text),
      textMatches,
    };
  } catch (error) {
    return {
      ...emptyResult(job),
      failure: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await page.close();
  }
};

const violationsIn = (row: JobResult, baselineOnly: boolean): string[] => {
  const reasons: string[] = [];

  if (row.failure !== null) {
    reasons.push(row.failure);
  }

  if (baselineOnly) {
    if (row.oldStatus === null || row.oldStatus >= 400) {
      reasons.push(`old page answered ${row.oldStatus ?? "nothing"}`);
    }

    return reasons;
  }

  if (row.oldStatus !== row.newStatus) {
    reasons.push(
      `status ${row.oldStatus ?? "none"} became ${row.newStatus ?? "none"}`
    );
  }

  if (row.oldTitle !== row.newTitle) {
    reasons.push("title differs");
  }

  if (row.textMatches === false) {
    reasons.push("text differs");
  }

  if ((row.percent ?? 0) > threshold) {
    reasons.push(`pixels differ ${row.percent?.toFixed(2) ?? "?"} percent`);
  }

  if (row.bytesMatch === false) {
    reasons.push(row.byteNote ?? "bytes differ");
  }

  return reasons;
};

const formatPercent = (percent: number | null): string =>
  percent === null ? "n/a" : `${percent.toFixed(2)}%`;

const formatStatus = (row: JobResult): string =>
  `${row.oldStatus ?? "none"} to ${row.newStatus ?? "none"}`;

const textCell = (rows: readonly JobResult[]): string => {
  if (baselineMode) {
    return "baseline";
  }

  if (rows.some((row) => row.textMatches === false)) {
    return "differs";
  }

  return rows.every((row) => row.textMatches === true) ? "same" : "missing";
};

const titleCell = (rows: readonly JobResult[]): string => {
  if (baselineMode) {
    return "baseline";
  }

  return rows.every(
    (row) => row.newTitle !== null && row.oldTitle === row.newTitle
  )
    ? "same"
    : "differs";
};

const bytesCell = (rows: readonly JobResult[]): string => {
  if (baselineMode) {
    return "baseline";
  }

  if (rows.some((row) => row.bytesMatch === false)) {
    return "differs";
  }

  return rows.every((row) => row.bytesMatch === true) ? "same" : "html";
};

const pageRow = (pagePath: string, rows: readonly JobResult[]): string => {
  const reasons = rows.flatMap((row) =>
    violationsIn(row, baselineMode).map(
      (reason) => `${row.viewport}: ${reason}`
    )
  );

  const statuses = rows
    .map((row) => `${row.viewport} ${formatStatus(row)}`)
    .join(", ");

  const pixels = rows
    .map((row) => `${row.viewport} ${formatPercent(row.percent)}`)
    .join(", ");

  const verdict = reasons.length === 0 ? "pass" : reasons.join("; ");
  const target = pageUrlIn(oldBase, pagePath);

  return `| [${pagePath}](${target}) | ${statuses} | ${titleCell(rows)} | ${textCell(rows)} | ${pixels} | ${bytesCell(rows)} | ${verdict} |`;
};

const sitemapLocations = await readSitemaps(oldBase);

const sitemapPaths = uniquePaths(
  sitemapLocations.map((location) => new URL(location, oldBase).pathname)
);

const blogIndexHtml = await fetchText(pageUrlIn(oldBase, "/blog/"));

const tagPaths = blogIndexHtml === null ? [] : tagPathsIn(blogIndexHtml);

const allPaths = uniquePaths([...sitemapPaths, ...tagPaths, ...ASSET_PATHS]);

const pagePaths = pageLimit > 0 ? allPaths.slice(0, pageLimit) : allPaths;

if (pagePaths.length === 0) {
  process.stderr.write(`No pages found in the sitemap at ${oldBase}\n`);
  process.exit(1);
}

const jobs = pagePaths.flatMap((pagePath) =>
  VIEWPORTS.map((viewport) => ({ pagePath, viewport }))
);

for (const directory of [imagesDir, textsDir]) {
  mkdirSync(directory, { recursive: true });
}

for (const viewport of VIEWPORTS) {
  for (const side of ["old", "new", "diff"]) {
    mkdirSync(path.join(imagesDir, side, viewport.name), { recursive: true });
  }
}

const results: JobResult[] = [];

const queue = [...jobs];

// @effect-diagnostics-next-line asyncFunction:off -- This Node CLI drains its capture queue with Playwright Promises outside an Effect runtime.
const drain = async (browserContext: BrowserContext): Promise<void> => {
  const job = queue.shift();

  if (job === undefined) {
    return;
  }

  results.push(await runJob(browserContext, job));

  if (results.length % 20 === 0) {
    process.stdout.write(
      `captured ${results.length} of ${jobs.length} page captures\n`
    );
  }

  await drain(browserContext);
};

const browser = await chromium.launch();

const context = await browser.newContext({
  colorScheme: "dark",
  reducedMotion: "reduce",
});

const workers = Math.min(CONCURRENCY, queue.length);

await Promise.all(Array.from({ length: workers }, () => drain(context)));

await browser.close();

const ordered = results.toSorted((left, right) => {
  const byPath = left.pagePath.localeCompare(right.pagePath);

  return byPath === 0 ? left.viewport.localeCompare(right.viewport) : byPath;
});

const groups = new Map<string, JobResult[]>();

for (const row of ordered) {
  const group = groups.get(row.pagePath);

  if (group === undefined) {
    groups.set(row.pagePath, [row]);
  } else {
    group.push(row);
  }
}

const tableRows = [...groups.entries()].map(([pagePath, rows]) =>
  pageRow(pagePath, rows)
);

const failureCount = ordered.filter(
  (row) => violationsIn(row, baselineMode).length > 0
).length;

const addresses = [
  pageLimit > 0
    ? `${pagePaths.length} of ${allPaths.length} addresses`
    : `${allPaths.length} addresses`,
  `${sitemapPaths.length} in the sitemap`,
  `${tagPaths.length} blog tag pages`,
  `${ASSET_PATHS.length} fixed files`,
].join(", ");

const summary = [
  baselineMode ? "Parity baseline capture" : "Parity comparison",
  "",
  `Old site: ${oldBase}`,
  `New site: ${newBase.length > 0 ? newBase : "none, baseline mode"}`,
  `Addresses: ${addresses}`,
  `Threshold: ${threshold} percent`,
  `Failing page captures: ${failureCount}`,
  "",
  "| Page | Status | Title | Text | Pixels | Bytes | Verdict |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  ...tableRows,
];

const summaryText = `${summary.join("\n")}\n`;

process.stdout.write(summaryText);

const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (summaryPath !== undefined) {
  appendFileSync(summaryPath, summaryText);
}

writeFileSync(
  path.join(outDir, "report.json"),
  `${JSON.stringify(
    {
      assets: ASSET_PATHS.length,
      baseline: baselineMode,
      failingPageCaptures: failureCount,
      newBase,
      oldBase,
      pageCaptures: results.length,
      pages: groups.size,
      rows: ordered,
      sitemapPages: sitemapPaths.length,
      tagPages: tagPaths.length,
      threshold,
    },
    null,
    2
  )}\n`
);

process.exitCode = failureCount > 0 ? 1 : 0;
