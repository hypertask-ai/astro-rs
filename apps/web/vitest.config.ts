import { markdown } from "@foldkit/markdown/vite";
import { defineConfig } from "vitest/config";

import { stylexRenderingPlugin } from "./stylex.js";

export default defineConfig({
  plugins: [stylexRenderingPlugin(), markdown()],
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
