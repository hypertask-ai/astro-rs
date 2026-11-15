// @effect-diagnostics nodeBuiltinImport:off -- The publish smoke check fetches live addresses in a GitHub-hosted job.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { Schema } from "effect";

const origin = "https://hypertask.ai";

const previewBasePath = "/ratstack";

const attempts = 12;

const waitMilliseconds = 5000;

const log = (line: string): void => {
  process.stdout.write(`${line}\n`);
};

const fail = (line: string): void => {
  process.stderr.write(`${line}\n`);
};

const AnswerSchema = Schema.Struct({
  robots: Schema.NullOr(Schema.String),
  status: Schema.Int,
  title: Schema.String,
});

type Answer = typeof AnswerSchema.Type;

const decodeAnswer = Schema.decodeUnknownSync(
  Schema.fromJsonString(AnswerSchema)
);

const noindex = (answer: Answer): boolean =>
  (answer.robots ?? "").includes("noindex");

const settled = (answer: Answer): boolean =>
  answer.status === 200 && noindex(answer);

// @effect-diagnostics-next-line asyncFunction:off -- This script awaits live HTTP answers outside any Effect runtime.
const get = async (address: string): Promise<Answer> => {
  // @effect-diagnostics-next-line globalFetch:off -- This publish check fetches live addresses outside an Effect runtime, as rat-stack's other Node tools do.
  const response = await fetch(address, { redirect: "follow" });
  const body = await response.text();
  const title = body.match(/<title>(?<title>[^<]*)<\/title>/u)?.groups?.title;

  return {
    robots: response.headers.get("x-robots-tag"),
    status: response.status,
    title: title ?? "",
  };
};

// @effect-diagnostics-next-line asyncFunction:off -- This script awaits live HTTP answers outside any Effect runtime.
const probe = async (address: string, remaining: number): Promise<Answer> => {
  const answer = await get(address);

  if (settled(answer) || remaining <= 1) {
    return answer;
  }

  await delay(waitMilliseconds);

  return probe(address, remaining - 1);
};

const walk = (current: string): readonly string[] =>
  readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(current, entry.name);

    return entry.isDirectory() ? walk(location) : [location];
  });

const publishedAddress = (root: string, file: string): string =>
  `${previewBasePath}/${path.relative(root, file).split(path.sep).join("/")}`;

const publishedFiles = (directory: string): readonly string[] =>
  walk(directory)
    .map((file) => publishedAddress(directory, file))
    .filter(
      (address) =>
        !address.endsWith("/index.html") &&
        !address.endsWith("/_headers") &&
        !address.endsWith("/_redirects")
    )
    .toSorted((left, right) => left.localeCompare(right));

const extraAddresses = (directory: string): readonly string[] => {
  const files = publishedFiles(directory);

  const kinds: readonly (readonly string[])[] = [
    [".xml", ".txt"],
    [".css"],
    [".js"],
  ];

  const picked = kinds.flatMap((extensions) => {
    const found = files.find((address) =>
      extensions.some((extension) => address.endsWith(extension))
    );

    return found === undefined ? [] : [found];
  });

  return [...new Set([...picked, ...files])].slice(0, 3);
};

const reportPublished = (
  address: string,
  answer: Answer
): readonly string[] => {
  if (answer.status !== 200) {
    return [`${address} answered ${answer.status} instead of 200.`];
  }

  if (noindex(answer)) {
    log(`${address} answered 200 with the noindex header.`);

    return [];
  }

  return [
    `${address} answered without the X-Robots-Tag noindex header, so the preview would compete with the live site in search.`,
  ];
};

const [mode, ...arguments_] = process.argv.slice(2);

if (mode === "record") {
  const out = arguments_[0] ?? ".rat/publish/baseline.json";
  const answer = await get(`${origin}/`);

  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(answer, null, 2));

  log(
    `Recorded ${origin}/ before the deploy: status ${answer.status}, title ${JSON.stringify(answer.title)}.`
  );
} else if (mode === "check") {
  const baselinePath = arguments_[0] ?? ".rat/publish/baseline.json";
  const directory = arguments_[1] ?? "apps/web/dist/client";
  const expectedTitle = arguments_[2] ?? "";

  const baseline = decodeAnswer(readFileSync(baselinePath, "utf-8"));
  const failures: string[] = [];

  const preview = `${origin}${previewBasePath}`;
  const live = await probe(preview, attempts);

  failures.push(...reportPublished(preview, live));

  if (live.title !== expectedTitle) {
    failures.push(
      `${preview} answered the title ${JSON.stringify(live.title)} instead of ${JSON.stringify(expectedTitle)}.`
    );
  }

  const extra = extraAddresses(directory);

  if (extra.length < 3) {
    failures.push(
      `${directory} holds fewer than three published files, so three addresses under ${previewBasePath} cannot be checked. Fix: build the site before this check.`
    );
  }

  const answers = await Promise.all(
    extra.map((address) => get(`${origin}${address}`))
  );

  for (const [index, address] of extra.entries()) {
    const answer = answers[index];

    if (answer !== undefined) {
      failures.push(...reportPublished(`${origin}${address}`, answer));
    }
  }

  const old = await get(`${origin}/`);

  if (old.status !== baseline.status) {
    failures.push(
      `${origin}/ answered ${old.status} instead of the ${baseline.status} it answered before the deploy.`
    );
  }

  if (old.title !== baseline.title) {
    failures.push(
      `${origin}/ answered the title ${JSON.stringify(old.title)} instead of the ${JSON.stringify(baseline.title)} it answered before the deploy.`
    );
  }

  if (failures.length === 0) {
    log(
      `${origin}/ still answers ${old.status} with the title it answered before the deploy.`
    );
    log("The publish smoke check passed.");
  } else {
    for (const failure of failures) {
      fail(failure);
    }

    process.exitCode = 1;
  }
} else {
  fail(
    "Usage: node scripts/publish-smoke.ts record <baseline-file> | check <baseline-file> <client-directory> <expected-title>. Fix: run the publish workflow step that matches the mode you need."
  );
  process.exitCode = 1;
}
