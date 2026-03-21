import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["coverage", "dist", "node_modules", "logics/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true
        }
      ]
    }
  },
  {
    files: ["packages/engine-core/src/**/*.{ts,tsx}", "packages/engine-pixi/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@game", "@game/*", "@src/game/*"],
              message:
                "Engine-owned modules must not depend on Emberwake game modules. Move the dependency behind an engine-to-game contract instead."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["games/emberwake/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@app", "@app/*", "@src/game", "@src/game/*"],
              message:
                "Game-owned modules must not depend on app-shell modules or legacy src/game adapters. Depend on @engine or local game modules instead."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["games/emberwake/src/content/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@app",
                "@app/*",
                "@engine-pixi",
                "@engine-pixi/*",
                "@game/runtime",
                "@game/runtime/*",
                "@src/game",
                "@src/game/*"
              ],
              message:
                "Game content modules must stay authoring-focused. Keep them free from app-shell, Pixi-adapter, runtime-orchestration, and legacy src/game dependencies."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["games/emberwake/src/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@app",
                "@app/*",
                "@engine-pixi",
                "@engine-pixi/*",
                "@src/game",
                "@src/game/*"
              ],
              message:
                "Game presentation contracts must stay descriptive. Let src/game/render own Pixi adapters and app-shell integration."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@engine-pixi", "@engine-pixi/*"],
              message:
                "App-shell modules must not depend on Pixi adapters directly. Route runtime rendering through src/game/render boundaries instead."
            },
            {
              group: ["@engine/*", "@game/*"],
              message:
                "App-shell modules should consume engine and game contracts through the public @engine and @game entrypoints when they cross package boundaries."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["src/game/render/**/*.{ts,tsx}", "src/game/world/render/**/*.{ts,tsx}", "src/game/entities/render/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@engine-pixi/*"],
              message:
                "Render-shell modules should consume Pixi adapter contracts through the public @engine-pixi entrypoint."
            }
          ]
        }
      ]
    }
  }
);
