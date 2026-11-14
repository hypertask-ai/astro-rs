import { Effect, FileSystem } from "effect";

const installScripts = [
  { paths: ["/install", "/install.sh"], source: "install.sh" },
  { paths: ["/install.ps1"], source: "install.ps1" },
];

export const installScriptHeaders = installScripts
  .flatMap((script) => script.paths)
  .map((path) => `${path}\n  Content-Type: text/plain; charset=utf-8\n`)
  .join("");

export const copyInstallScripts = Effect.fn("reader.copyInstallScripts")(
  function* copyInstallScripts(
    sourceDirectory: string,
    clientDirectory: string
  ) {
    const fs = yield* FileSystem.FileSystem;

    yield* Effect.forEach(installScripts, (script) =>
      Effect.forEach((path: string) =>
        fs.copyFile(
          `${sourceDirectory}/${script.source}`,
          `${clientDirectory}${path}`
        )
      )(script.paths)
    );
  }
);
