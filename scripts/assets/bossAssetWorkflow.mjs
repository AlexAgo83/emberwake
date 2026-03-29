/* global URL, process */

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);

export const bossAssetPlan = [
  {
    assetId: "entity.boss.watchglass-prime.runtime",
    codexId: "watchglass-prime",
    finalPath: "src/assets/entities/runtime/entity.boss.watchglass-prime.runtime.png",
    finalRightPath: "src/assets/entities/runtime/entity.boss.watchglass-prime.runtime.right.png",
    prompt:
      "Create a transparent-background runtime boss asset for a techno-shinobi survival game. Subject: Watchglass Prime, a premium mini-boss derived from the watcher family but clearly unique. Right-facing. Tall, imperial survey-hunter silhouette with a cyclopean observatory head, layered shrine-tech armor, larger beam-emitter limbs, and a gold-red command core. Stylized, game-ready, readable at small scale, medium detail, crisp silhouette, no text, no floor, no environment, no cinematic background."
  },
  {
    assetId: "entity.boss.sentinel-tyrant.runtime",
    codexId: "mission-boss-sentinel",
    finalPath: "src/assets/entities/runtime/entity.boss.sentinel-tyrant.runtime.png",
    finalRightPath: "src/assets/entities/runtime/entity.boss.sentinel-tyrant.runtime.right.png",
    prompt:
      "Create a transparent-background runtime boss asset for a techno-shinobi survival game. Subject: Sentinel Tyrant, a mission boss evolved from the sentinel husk line. Right-facing. Heavy plated tyrant silhouette with massive ward-shield shoulders, furnace chest, brutal forward crest, and elite pursuit posture. It must feel distinct from the standard sentinel, not just recolored. Stylized, game-ready, medium detail, clean silhouette, readable at small scale, no text, no floor, no environment, no photorealism."
  },
  {
    assetId: "entity.boss.abyss-watchglass.runtime",
    codexId: "mission-boss-watchglass",
    finalPath: "src/assets/entities/runtime/entity.boss.abyss-watchglass.runtime.png",
    finalRightPath: "src/assets/entities/runtime/entity.boss.abyss-watchglass.runtime.right.png",
    prompt:
      "Create a transparent-background runtime boss asset for a techno-shinobi survival game. Subject: Abyss Watchglass, a mission boss beam director. Right-facing. Distinct from Watchglass Prime: broader ritual lens crown, segmented abyssal fins, a red beam focus chamber, and a cathedral-tech silhouette that suggests lane control and laser authority. Stylized, game-ready, medium detail, readable at small scale, no text, no floor, no environment, no cinematic background."
  },
  {
    assetId: "entity.boss.ruin-ram.runtime",
    codexId: "mission-boss-rammer",
    finalPath: "src/assets/entities/runtime/entity.boss.ruin-ram.runtime.png",
    finalRightPath: "src/assets/entities/runtime/entity.boss.ruin-ram.runtime.right.png",
    prompt:
      "Create a transparent-background runtime boss asset for a techno-shinobi survival game. Subject: Ruin Ram, a mission boss charge brute. Right-facing. Distinct from the normal rammer: wider siege-brute stance, battering horn assembly, overbuilt shoulder armor, and a ruin-engine reactor in the torso. Stylized, game-ready, medium detail, highly readable silhouette, no text, no floor, no environment, no photorealism."
  }
];

export const bossAssetGenerationRoot = resolve(repoRoot, "output/imagegen/boss-assets");
export const bossAssetCandidatesRoot = resolve(bossAssetGenerationRoot, "candidates");
export const bossAssetSelectionFilePath = resolve(bossAssetGenerationRoot, "selection.json");
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

export const toCandidateRelativePath = (assetId, variantIndex = 1) =>
  `candidates/${assetId}/variant-${String(variantIndex).padStart(2, "0")}.png`;

export const toCandidateAbsolutePath = (assetId, variantIndex = 1) =>
  resolve(bossAssetGenerationRoot, toCandidateRelativePath(assetId, variantIndex));

export const loadSelectionMap = () => {
  try {
    return JSON.parse(readFileSync(bossAssetSelectionFilePath, "utf8"));
  } catch {
    return Object.fromEntries(
      bossAssetPlan.map((entry) => [entry.assetId, toCandidateRelativePath(entry.assetId, 1)])
    );
  }
};

export const writeSelectionMap = (selectionMap) => {
  ensureDirectory(dirname(bossAssetSelectionFilePath));
  writeFileSync(bossAssetSelectionFilePath, `${JSON.stringify(selectionMap, null, 2)}\n`, "utf8");
};

export const statExists = (path) => {
  try {
    return statSync(path);
  } catch {
    return null;
  }
};

export const listCandidateFiles = () => {
  const files = [];

  const walk = (directoryPath) => {
    for (const entry of readdirSync(directoryPath)) {
      const entryPath = join(directoryPath, entry);
      const entryStats = statSync(entryPath);

      if (entryStats.isDirectory()) {
        walk(entryPath);
        continue;
      }

      files.push(entryPath);
    }
  };

  if (statExists(bossAssetCandidatesRoot)) {
    walk(bossAssetCandidatesRoot);
  }

  return files.sort();
};

export const toRelativeFromRepo = (absolutePath) => absolutePath.replace(`${repoRoot}/`, "");
export const getStem = (filePath) => basename(filePath).replace(/\.[^.]+$/u, "");
