import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { classifyRun, pickEngine, readVerdict, redactLog } from "./engine.mjs";

const ENGINE_SCRIPT = fileURLToPath(new URL("./engine.mjs", import.meta.url));

const SHA = "0a1b2c3d4e5f60718293a4b5c6d7e8f901234567";

const OTHER_SHA = "1111111111111111111111111111111111111111";

await test("picks the DeepSeek plan first, then Codex, then Claude", () => {
  assert.equal(
    pickEngine({ claude: "yes", codex: "yes", deepseek: "yes" }),
    "deepseek"
  );
  assert.equal(
    pickEngine({ claude: "yes", codex: "yes", deepseek: "no" }),
    "codex"
  );
  assert.equal(
    pickEngine({ claude: "yes", codex: "no", deepseek: "no" }),
    "claude"
  );
  assert.equal(
    pickEngine({ claude: "no", codex: "no", deepseek: "yes" }),
    "deepseek"
  );
  assert.equal(
    pickEngine({ claude: "no", codex: "no", deepseek: "no" }),
    "none"
  );
});

await test("refuses an engine setting that is neither yes nor no", () => {
  assert.throws(
    () => pickEngine({ claude: "yes", codex: "yes", deepseek: "set" }),
    /The setting for deepseek is set\./u
  );
});

await test("reads a verdict from the first line only", () => {
  assert.deepEqual(readVerdict(`pstack-verifier: PASS @ ${SHA}\n`), {
    sha: SHA,
    verdict: "PASS",
  });
  assert.deepEqual(readVerdict(`pstack-verifier: PASS+NOTES @ ${SHA}\n`), {
    sha: SHA,
    verdict: "PASS+NOTES",
  });
  assert.deepEqual(readVerdict(`pstack-verifier: FAIL @ ${SHA}\r\n`), {
    sha: SHA,
    verdict: "FAIL",
  });
  assert.deepEqual(readVerdict(`pstack-verifier: PASS @ ${SHA}   \nmore`), {
    sha: SHA,
    verdict: "PASS",
  });
});

await test("rejects a verdict that is not the first line or not a full commit", () => {
  assert.equal(readVerdict(`\npstack-verifier: PASS @ ${SHA}\n`), undefined);
  assert.equal(
    readVerdict(`My verdict:\npstack-verifier: PASS @ ${SHA}\n`),
    undefined
  );
  assert.equal(readVerdict("pstack-verifier: PASS @ 0a1b2c3\n"), undefined);
  assert.equal(readVerdict(`pstack-verifier: PASS @ ${SHA}0\n`), undefined);
  assert.equal(
    readVerdict(`pstack-verifier: PASS @ ${SHA.toUpperCase()}\n`),
    undefined
  );
  assert.equal(readVerdict(`pstack-verifier: MAYBE @ ${SHA}\n`), undefined);
  assert.equal(readVerdict(""), undefined);
});

await test("a printed log hides a token but keeps the words around it", () => {
  assert.equal(
    redactLog(
      "login failed with sk-abc123def456ghi789jkl for the opencode-go provider"
    ),
    "login failed with [redacted] for the opencode-go provider"
  );
  assert.equal(redactLog("401 Unauthorized"), "401 Unauthorized");
});

await test("a verdict for the head is used even when it is a FAIL", () => {
  assert.equal(
    classifyRun({
      diagnostics: "warning: rate limit is close",
      exitCode: 0,
      sha: SHA,
      verdict: { sha: SHA, verdict: "FAIL" },
    }),
    "ok"
  );
});

await test("a stale verdict is a hard stop rather than a reason to try another engine", () => {
  assert.equal(
    classifyRun({
      diagnostics: "",
      exitCode: 0,
      sha: SHA,
      verdict: { sha: OTHER_SHA, verdict: "PASS" },
    }),
    "stale"
  );
});

await test("a run that names a limit stands aside", () => {
  for (const diagnostics of [
    "provider answered 429 Too Many Requests",
    "HTTP 429",
    "rate limit reached for this plan",
    "quota exceeded",
    "insufficient credit balance",
    "402 Payment Required",
  ]) {
    assert.equal(
      classifyRun({ diagnostics, exitCode: 1, sha: SHA, verdict: undefined }),
      "limit"
    );
  }
});

await test("a run that fails to log in stands aside", () => {
  for (const diagnostics of [
    "401 Unauthorized",
    "403 Forbidden",
    "Invalid API key provided",
    "invalid_api_key",
    "no api key set for opencode-go",
    "missing credentials",
    "Authentication failed",
    "not logged in",
  ]) {
    assert.equal(
      classifyRun({ diagnostics, exitCode: 1, sha: SHA, verdict: undefined }),
      "login"
    );
  }
});

await test("any other failure stops the run instead of trying another engine", () => {
  assert.equal(
    classifyRun({
      diagnostics: "the process was killed",
      exitCode: 137,
      sha: SHA,
      verdict: undefined,
    }),
    "hard"
  );
  assert.equal(
    classifyRun({
      diagnostics: "",
      exitCode: 0,
      sha: SHA,
      verdict: undefined,
    }),
    "hard"
  );
  assert.equal(
    classifyRun({
      diagnostics: "",
      exitCode: 1,
      sha: SHA,
      verdict: { sha: SHA, verdict: "PASS" },
    }),
    "hard"
  );
});

await test("the command line prints the engine and the run result", () => {
  assert.equal(
    execFileSync(
      process.execPath,
      [
        ENGINE_SCRIPT,
        "pick",
        "--deepseek",
        "yes",
        "--codex",
        "no",
        "--claude",
        "yes",
      ],
      { encoding: "utf-8" }
    ).trim(),
    "deepseek"
  );

  const directory = mkdtempSync(path.join(tmpdir(), "verifier-engine-"));

  try {
    const verdictFile = path.join(directory, "verdict.md");
    const diagnosticsFile = path.join(directory, "stderr.log");

    writeFileSync(verdictFile, `pstack-verifier: PASS+NOTES @ ${SHA}\nbody\n`);
    writeFileSync(diagnosticsFile, "");

    assert.equal(
      execFileSync(
        process.execPath,
        [
          ENGINE_SCRIPT,
          "check",
          "--sha",
          SHA,
          "--exit",
          "0",
          "--file",
          verdictFile,
          "--diagnostics",
          diagnosticsFile,
        ],
        { encoding: "utf-8" }
      ).trim(),
      "ok"
    );

    writeFileSync(verdictFile, "");
    writeFileSync(diagnosticsFile, "provider answered 429 Too Many Requests");

    assert.equal(
      execFileSync(
        process.execPath,
        [
          ENGINE_SCRIPT,
          "check",
          "--sha",
          SHA,
          "--exit",
          "1",
          "--file",
          verdictFile,
          "--diagnostics",
          diagnosticsFile,
        ],
        { encoding: "utf-8" }
      ).trim(),
      "limit"
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
