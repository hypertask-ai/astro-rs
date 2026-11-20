// @effect-diagnostics nodeBuiltinImport:off -- This publish check walks the built site on the filesystem in a GitHub-hosted job.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  noindexHeaderLine,
  noindexRobotsMeta,
} from "../apps/web/src/preview-marks.ts";
import {
  basePathViolationMessage,
  escapingUrls,
  normalizeSiteBasePath,
} from "../apps/web/src/site-base-path.ts";

const log = (line: string): void => {
  process.stdout.write(`${line}\n`);
};

const fail = (line: string): void => {
  process.stderr.write(`${line}\n`);
};

const directory = process.argv[2] ?? "apps/web/dist/client";

const basePath = normalizeSiteBasePath(process.env.SITE_BASE_PATH);

const walk = (current: string): readonly string[] =>
  readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(current, entry.name);

    return entry.isDirectory() ? walk(location) : [location];
  });

const relative = (root: string, file: string): string =>
  path.relative(root, file).split(path.sep).join("/");

const fileViolations = (
  root: string,
  file: string,
  content: string
): readonly string[] =>
  escapingUrls(basePath, relative(root, file), content).map((url) =>
    basePathViolationMessage(basePath, relative(root, file), url)
  );

const noindexViolations = (
  root: string,
  file: string,
  content: string
): readonly string[] => {
  const name = relative(root, file);

  if (name.endsWith("_headers")) {
    return content.includes(noindexHeaderLine)
      ? []
      : [
          `${name} answers without the ${noindexHeaderLine} header. The site is served at ${basePath} as a preview, so search engines must skip it. Fix: write the header from \`headersFile\` in \`apps/web/src/hypertask/site-rules.ts\`.`,
        ];
  }

  if (!name.endsWith(".html")) {
    return [];
  }

  return content.includes(noindexRobotsMeta)
    ? []
    : [
        `${name} answers without the robots noindex meta tag. The site is served at ${basePath} as a preview, so search engines must skip it. Fix: render the head through \`buildHead\` in \`apps/web/src/features/head/build-head.ts\`.`,
      ];
};

const empty =
  !existsSync(directory) ||
  !readdirSync(directory, { withFileTypes: true }).length;

if (empty) {
  fail(
    `${directory} is empty. The base path check reads the built site, so the build must run first. Fix: run \`pnpm --filter @hypertask-site/web build\` before this check.`
  );
  process.exitCode = 1;
} else {
  const files = walk(directory);

  const violations = files.flatMap((file) => {
    const content = readFileSync(file, "utf-8");

    return [
      ...fileViolations(directory, file, content),
      ...(basePath === "" ? [] : noindexViolations(directory, file, content)),
    ];
  });

  for (const violation of violations) {
    fail(violation);
  }

  if (violations.length > 0) {
    process.exitCode = 1;
  } else {
    log(
      `Checked ${files.length} built files: every same-site URL stays under ${basePath === "" ? "the origin root" : basePath}.`
    );
  }
}
