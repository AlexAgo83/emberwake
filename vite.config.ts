import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

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
  server: {
    port: 5073
  },
  preview: {
    port: 4073
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Emberwake",
        short_name: "Emberwake",
        description: "Fullscreen-first top-down survival action shell for Emberwake.",
        theme_color: "#ff7b3f",
        background_color: "#09070f",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        navigateFallback: "/index.html",
        sourcemap: true
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("@pixi/") || id.includes("pixi.js")) {
            return "vendor-pixi";
          }

          if (
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("scheduler")
          ) {
            return "vendor-react";
          }

          return "vendor-runtime";
        }
      }
    }
  }
});
