import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@app": path.resolve(rootDir, "src/app"),
      "@assets": path.resolve(rootDir, "src/assets"),
      "@engine": path.resolve(rootDir, "packages/engine-core/src"),
      "@engine-pixi": path.resolve(rootDir, "packages/engine-pixi/src"),
      "@game": path.resolve(rootDir, "games/emberwake/src"),
      "@shared": path.resolve(rootDir, "src/shared"),
      "@src": path.resolve(rootDir, "src")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    css: true
  }
});
