import { foldkit } from "@foldkit/vite-plugin";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

import { stylexPlugin } from "./stylex.js";

const outputLayout = (): Plugin => ({
  apply: "build",
  config: (config, environment) => {
    const clientOutDir = config.build?.outDir ?? "dist/client";

    return environment.isSsrBuild === true
      ? {}
      : {
          environments: {
            client: { build: { outDir: clientOutDir } },
            ssr: {
              build: {
                outDir:
                  clientOutDir === "dist/client"
                    ? "dist/server"
                    : `${clientOutDir}/server`,
              },
            },
          },
        };
  },
  name: "site-output-layout",
});

export default defineConfig({
  build: {
    rolldownOptions: { external: [/^cloudflare:/u] },
  },
  plugins: [
    stylexPlugin(),
    foldkit({
      ssr: {
        build: { prerender: true },
        clientEntry: "/src/client/entry.ts",
        serverEntry: "/src/entry.server.ts",
      },
    }),
    outputLayout(),
  ],
});
