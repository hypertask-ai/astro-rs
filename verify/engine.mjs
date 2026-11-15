import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";

const ENGINE_ORDER = ["deepseek", "codex", "claude"];

const SETTING_VALUES = ["yes", "no"];

const VERDICT_PATTERN =
  /^pstack-verifier: (?<verdict>PASS|PASS\+NOTES|FAIL) @ (?<sha>[0-9a-f]{40})$/u;

const LOGIN_PATTERN =
  /\b(?:401|403)\b|unauthori[sz]ed|invalid[\s_-]*api[\s_-]*key|incorrect api key|no api key|missing (?:api key|credentials)|api key (?:is )?(?:invalid|missing|not set|required|rejected)|not logged in|log ?in required|authentication (?:failed|error|required)|auth(?:entication)? error/iu;

const LIMIT_PATTERN =
  /\b(?:402|429)\b|rate[\s_-]*limit|too many requests|quota|usage limit|(?:limit|credits?|balance) (?:reached|exceeded)|out of (?:tokens|credits|credit)|insufficient (?:credits?|balance|funds|quota|tokens)|payment required|billing/iu;

const USAGE =
  "usage: node verify/engine.mjs pick --deepseek <yes|no> --codex <yes|no> --claude <yes|no>\nusage: node verify/engine.mjs check --sha <sha> --exit <code> --file <verdict file> --diagnostics <error log>\nusage: node verify/engine.mjs log --file <log> [--lines <count>]";

const TOKEN_PATTERN = /[A-Za-z0-9_+.-]{20,}/gu;

/**
 * @param {Readonly<Record<string, string>>} settings
 * @returns {string}
 */
export const pickEngine = (settings) => {
  for (const engine of ENGINE_ORDER) {
    const value = settings[engine];

    if (!SETTING_VALUES.includes(value ?? "")) {
      throw new Error(
        `The setting for ${engine} is ${String(value)}. The engine order needs yes or no for every engine. Fix: pass --${engine} yes or --${engine} no.`
      );
    }
  }

  for (const engine of ENGINE_ORDER) {
    if (settings[engine] === "yes") {
      return engine;
    }
  }

  return "none";
};

/**
 * @param {string} text
 * @returns {{ verdict: string, sha: string } | undefined}
 */
export const readVerdict = (text) => {
  const first = text.split("\n")[0] ?? "";

  const match = VERDICT_PATTERN.exec(first.trimEnd());

  const verdict = match?.groups?.verdict;
  const sha = match?.groups?.sha;

  if (verdict === undefined || sha === undefined) {
    return undefined;
  }

  return { sha, verdict };
};

/**
 * @param {{ exitCode: number, verdict: { verdict: string, sha: string } | undefined, sha: string, diagnostics: string }} run
 * @returns {"ok"|"stale"|"login"|"limit"|"hard"}
 */
export const classifyRun = ({ exitCode, verdict, sha, diagnostics }) => {
  if (exitCode === 0 && verdict?.sha === sha) {
    return "ok";
  }

  if (LOGIN_PATTERN.test(diagnostics)) {
    return "login";
  }

  if (LIMIT_PATTERN.test(diagnostics)) {
    return "limit";
  }

  if (verdict?.sha === sha) {
    return "hard";
  }

  if (verdict !== undefined) {
    return "stale";
  }

  return "hard";
};

/**
 * @param {string} text
 * @returns {string}
 */
export const redactLog = (text) => text.replace(TOKEN_PATTERN, "[redacted]");

/**
 * @param {string} file
 * @returns {string}
 */
const readText = (file) =>
  existsSync(file) ? readFileSync(file, "utf-8") : "";

/**
 * @param {string[]} args
 * @returns {Map<string, string>}
 */
const readFlags = (args) => {
  const flags = new Map();

  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];

    if (
      name === undefined ||
      value === undefined ||
      !name.startsWith("--") ||
      value.startsWith("--")
    ) {
      throw new Error(
        `The engine arguments are not pairs of a flag and a value. The engine step cannot read them. Fix: pass every flag with a value, as in the usage below.\n${USAGE}`
      );
    }

    flags.set(name.slice(2), value);
  }

  return flags;
};

/**
 * @param {Map<string, string>} flags
 * @param {string} name
 * @returns {string}
 */
const readFlag = (flags, name) => {
  const value = flags.get(name);

  if (value === undefined) {
    throw new Error(
      `--${name} is missing. The engine step needs it to decide what to do. Fix: pass --${name} <value>.\n${USAGE}`
    );
  }

  return value;
};

/**
 * @returns {void}
 */
const main = () => {
  const [command, ...rest] = process.argv.slice(2);

  try {
    const flags = readFlags(rest);

    if (command === "pick") {
      console.log(
        pickEngine({
          claude: readFlag(flags, "claude"),
          codex: readFlag(flags, "codex"),
          deepseek: readFlag(flags, "deepseek"),
        })
      );

      return;
    }

    if (command === "check") {
      const sha = readFlag(flags, "sha");
      const exitCode = Number(readFlag(flags, "exit"));
      const verdict = readVerdict(readText(readFlag(flags, "file")));
      const diagnostics = readText(readFlag(flags, "diagnostics"));

      if (!Number.isInteger(exitCode)) {
        throw new Error(
          `--exit is ${readFlag(flags, "exit")} rather than a whole number. The engine step cannot tell a clean run from a failed one. Fix: pass the exit code as a number.`
        );
      }

      console.log(classifyRun({ diagnostics, exitCode, sha, verdict }));

      return;
    }

    if (command === "log") {
      const lines = Number(flags.get("lines") ?? 20);
      const text = readText(readFlag(flags, "file"));

      if (text === "") {
        return;
      }

      const tail = text
        .split("\n")
        .slice(Number.isInteger(lines) ? -lines : -20);

      console.log(redactLog(tail.join("\n")));

      return;
    }

    console.error(
      `The engine command is ${String(command)} rather than pick, check or log. The workflow calls one of those three. Fix: run pick, check or log.\n${USAGE}`
    );

    process.exitCode = 2;
  } catch (error) {
    console.error(String(error));

    process.exitCode = 2;
  }
};

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
