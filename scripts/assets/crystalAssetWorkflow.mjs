/* global URL, process */

import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);

const createPrompt = ({ label, motif }) =>
  [
    "Create a transparent-background runtime pickup asset for a techno-shinobi survival game.",
    "The subject is an XP crystal pickup viewed from a readable top-down or slight isometric gameplay angle, centered, crisp silhouette, stylized, game-ready, readable at small scale.",
    "Keep all three crystal tiers in the same family: obsidian-metal clasp fragments around a luminous crystal core, clean contrast, no text, no floor, no environment, no photorealism.",
    `Subject: ${label}.`,
    `Tier motif: ${motif}.`
  ].join(" ");

export const crystalAssetPlan = [
  {
    assetId: "entity.pickup.crystal.low.runtime",
    finalPath: "src/assets/entities/runtime/entity.pickup.crystal.low.runtime.png",
    prompt: createPrompt({
      label: "Scattered Crystal",
      motif:
        "small cyan shard with the cleanest silhouette, one core prism, light glow, minimal side facets"
    })
  },
  {
    assetId: "entity.pickup.crystal.mid.runtime",
    finalPath: "src/assets/entities/runtime/entity.pickup.crystal.mid.runtime.png",
    prompt: createPrompt({
      label: "Bound Crystal",
      motif:
        "medium green crystal cluster with two to three linked facets, stronger glow, slightly wider body"
    })
  },
  {
    assetId: "entity.pickup.crystal.high.runtime",
    finalPath: "src/assets/entities/runtime/entity.pickup.crystal.high.runtime.png",
    prompt: createPrompt({
      label: "Crown Crystal",
      motif:
        "large crimson crystal crown with multiple fused spikes, hottest glow, premium silhouette, clearly strongest tier"
    })
  }
];

export const crystalAssetGenerationRoot = resolve(repoRoot, "output/imagegen/crystal-assets");
export const crystalAssetSelectionFilePath = resolve(crystalAssetGenerationRoot, "selection.json");
export const imageGenCliPath = resolve(
  process.env.HOME ?? "~",
  ".codex/skills/.system/imagegen/scripts/image_gen.py"
);

const dotenvLinePattern = /^([A-Z0-9_]+)=(.*)$/;

export const ensureDirectory = (path) => {
  mkdirSync(path, { recursive: true });
};

export const loadLocalEnv = () => {
  for (const fileName of [".env.local", ".env.production"]) {
    const filePath = resolve(repoRoot, fileName);

    try {
      const contents = readFileSync(filePath, "utf8");

      for (const rawLine of contents.split(/\r?\n/u)) {
        const line = rawLine.trim();

        if (!line || line.startsWith("#")) {
          continue;
        }

        const match = dotenvLinePattern.exec(line);

        if (!match) {
          continue;
        }

        const [, key, value] = match;

        if (!(key in process.env)) {
          process.env[key] = value.replace(/^['"]|['"]$/gu, "");
        }
      }
    } catch {
      // Optional env files.
    }
  }
};

export const toCandidateRelativePath = (assetId) => `candidates/${assetId}/variant-01.png`;
export const toCandidateAbsolutePath = (assetId) =>
  resolve(crystalAssetGenerationRoot, toCandidateRelativePath(assetId));

export const loadSelectionMap = () => {
  try {
    return JSON.parse(readFileSync(crystalAssetSelectionFilePath, "utf8"));
  } catch {
    return Object.fromEntries(
      crystalAssetPlan.map((entry) => [entry.assetId, toCandidateRelativePath(entry.assetId)])
    );
  }
};

export const writeSelectionMap = (selectionMap) => {
  ensureDirectory(dirname(crystalAssetSelectionFilePath));
  writeFileSync(crystalAssetSelectionFilePath, `${JSON.stringify(selectionMap, null, 2)}\n`, "utf8");
};

export const statExists = (path) => {
  try {
    return statSync(path);
  } catch {
    return null;
  }
};
