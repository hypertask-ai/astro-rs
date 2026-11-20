#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REFERENCE_URL = process.env.REFERENCE_URL ?? "https://hypertask.ai/";

const PREVIEW_URL = process.env.PREVIEW_URL ?? "https://hypertask.ai/ratstack/";

const PREVIEW_BASE_PATH = process.env.PREVIEW_BASE_PATH ?? "/ratstack";

const REPO = process.env.VERIFY_REPO ?? "hypertask-ai/astro-rs";

const PUBLISH_WORKFLOW = process.env.PUBLISH_WORKFLOW ?? "publish-ratstack.yml";

const PUBLISH_BRANCH = process.env.PUBLISH_BRANCH ?? "site";

const LIVE_TITLE = "The fastest project board — Hypertask";

const TIMEOUT_MS = 30_000;

const ASSET = /\bsrc="(?<src>[^"]+\.(?:js|css))"/gu;

/** @typedef {{ detail: string; name: string; ok: boolean }} Check */
/** @typedef {{ body: string; robotsHeader: string; status: number; url: string }} Answer */
/** @typedef {{ assets: string[]; answer: Answer; noindex: boolean }} Preview */

/** @param {string} command
 * @param {string[]} args
 * @returns {string} */
const run = (command, args) => {
  const result = spawnSync(command, args, {
    encoding: "utf-8",
    maxBuffer: 16_777_216,
  });

  if (result.error !== undefined) {
    throw new Error(`${command} did not run: ${String(result.error)}`);
  }

  if (result.status !== 0) {
    throw new Error(
      `${command} exited ${String(result.status)}: ${result.stderr.trim()}`
    );
  }

  return result.stdout;
};

/** @param {string} url
 * @returns {Promise<Answer>} */
const get = async (url) => {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const body = await response.text();

  return {
    body,
    robotsHeader: response.headers.get("x-robots-tag") ?? "",
    status: response.status,
    url: response.url,
  };
};

/** @param {string} body
 * @returns {string} */
const robotsMeta = (body) => {
  const found = /<meta[^>]+name="robots"[^>]*>/u.exec(body)?.[0] ?? "";

  return /content="(?<content>[^"]*)"/u.exec(found)?.groups?.content ?? "";
};

/** @param {string} body
 * @returns {string[]} */
const assetSources = (body) =>
  [...body.matchAll(ASSET)]
    .map((match) => match.groups?.src ?? "")
    .filter((source) => source.length > 0);

/** @param {string[]} sources
 * @returns {string[]} */
const previewAssets = (sources) =>
  sources.filter((source) => source.startsWith(`${PREVIEW_BASE_PATH}/assets/`));

/** @param {string} source
 * @returns {Promise<number>} */
const assetStatus = async (source) => {
  try {
    const response = await fetch(new URL(source, PREVIEW_URL), {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    return response.status;
  } catch {
    return 0;
  }
};

/** @param {{ body: string; robotsHeader: string }} answer
 * @returns {boolean} */
const carriesNoindex = (answer) =>
  answer.robotsHeader.toLowerCase().includes("noindex") ||
  robotsMeta(answer.body).toLowerCase().includes("noindex");

/** @returns {{ conclusion: string, databaseId: number, headSha: string, status: string }[]} */
const publishRuns = () => {
  const result = spawnSync(
    "gh",
    [
      "run",
      "list",
      "--repo",
      REPO,
      "--workflow",
      PUBLISH_WORKFLOW,
      "--branch",
      PUBLISH_BRANCH,
      "--limit",
      "20",
      "--json",
      "conclusion,databaseId,headSha,status",
    ],
    { encoding: "utf-8", maxBuffer: 16_777_216 }
  );

  if (result.error !== undefined) {
    throw new Error(`gh did not run: ${String(result.error)}`);
  }

  if (result.status !== 0) {
    if (
      result.stderr.includes("could not find any workflows") ||
      result.stderr.includes("HTTP 404")
    ) {
      return [];
    }

    throw new Error(
      `gh exited ${String(result.status)}: ${result.stderr.trim()}`
    );
  }

  return JSON.parse(result.stdout);
};

/** @returns {{ detail: string; headSha: string } | undefined} */
const lastPublish = () => {
  const passed = publishRuns().find(
    (candidate) => candidate.conclusion === "success"
  );

  if (passed === undefined) {
    return undefined;
  }

  return {
    detail: `${PUBLISH_WORKFLOW} run ${String(passed.databaseId)} on ${PUBLISH_BRANCH} passed at ${passed.headSha}`,
    headSha: passed.headSha,
  };
};

/** @returns {string} */
const siteTip = () =>
  run("git", ["ls-remote", "origin", `refs/heads/${PUBLISH_BRANCH}`]).split(
    /\s+/u
  )[0] ?? "";

/** @returns {Promise<Preview>} */
const readPreview = async () => {
  const answer = await get(PREVIEW_URL);
  const sources = assetSources(answer.body);

  return {
    answer,
    assets: previewAssets(sources),
    noindex: carriesNoindex(answer),
  };
};

/** @param {Check[]} checks
 * @returns {number} */
const report = (checks) => {
  for (const check of checks) {
    const mark = check.ok ? "ok" : "FAIL";

    process.stdout.write(`${mark} ${check.name}: ${check.detail}\n`);
  }

  const failed = checks.filter((check) => !check.ok);

  process.stdout.write(
    `${failed.length === 0 ? "doctor: ready" : `doctor: ${String(failed.length)} check(s) failed`}\n`
  );

  return failed.length === 0 ? 0 : 1;
};

/** @returns {Promise<number>} */
const main = async () => {
  /** @type {Check[]} */
  const checks = [];
  /** @type {Preview | undefined} */
  let preview;

  try {
    const reference = await get(REFERENCE_URL);
    const title =
      /<title>(?<title>[^<]*)<\/title>/u.exec(reference.body)?.groups?.title ??
      "";

    checks.push({
      detail: `${REFERENCE_URL} answered ${String(reference.status)} with title ${JSON.stringify(title)}`,
      name: "reference host answers",
      ok: reference.status === 200 && title === LIVE_TITLE,
    });
  } catch (error) {
    checks.push({
      detail: `${REFERENCE_URL} did not answer: ${String(error)}`,
      name: "reference host answers",
      ok: false,
    });
  }

  try {
    preview = await readPreview();

    checks.push({
      detail: `${PREVIEW_URL} answered ${String(preview.answer.status)} at ${preview.answer.url}`,
      name: "preview host answers",
      ok: preview.answer.status === 200,
    });
    checks.push({
      detail:
        preview.answer.robotsHeader.length > 0
          ? `X-Robots-Tag: ${preview.answer.robotsHeader}`
          : `robots meta ${JSON.stringify(robotsMeta(preview.answer.body))}`,
      name: "preview carries noindex",
      ok: preview.noindex,
    });
    checks.push({
      detail:
        preview.assets.length > 0
          ? `assets ${preview.assets.join(" ")}`
          : `no ${PREVIEW_BASE_PATH}/assets/ script or style in the preview, so it is not this build`,
      name: "preview is the rebuilt site",
      ok: preview.assets.length > 0,
    });

    const [firstAsset] = preview.assets;

    const status = firstAsset === undefined ? 0 : await assetStatus(firstAsset);

    checks.push({
      detail:
        firstAsset === undefined
          ? `nothing under ${PREVIEW_BASE_PATH}/assets/ to fetch`
          : `${firstAsset} answered ${String(status)}`,
      name: "preview serves its own build files",
      ok: status === 200,
    });
  } catch (error) {
    checks.push({
      detail: `${PREVIEW_URL} did not answer: ${String(error)}`,
      name: "preview host answers",
      ok: false,
    });
  }

  try {
    const publish = lastPublish();
    const tip = siteTip();

    checks.push({
      detail:
        publish === undefined
          ? `no successful ${PUBLISH_WORKFLOW} run on ${PUBLISH_BRANCH}, so nothing has published the preview`
          : `${publish.detail}, ${PUBLISH_BRANCH} tip ${tip}`,
      name: "preview matches the latest publish",
      ok: publish !== undefined && tip.length > 0 && publish.headSha === tip,
    });
  } catch (error) {
    checks.push({
      detail: `could not read the publish runs or the branch tip: ${String(error)}`,
      name: "preview matches the latest publish",
      ok: false,
    });
  }

  process.stdout.write(
    `${JSON.stringify({ checks, previewUrl: PREVIEW_URL, referenceUrl: REFERENCE_URL }, null, 2)}\n`
  );

  return report(checks);
};

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  process.exitCode = await main();
}
