/* global URL, process */

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);

export const directionalEntityPlan = [
  {
    assetId: "entity.player.primary.runtime",
    familyLabel: "Player core avatar",
    generatedFacings: [],
    rightSourcePath: "src/assets/entities/runtime/entity.player.primary.runtime.png",
    finalPaths: {
      right: "src/assets/entities/runtime/entity.player.primary.runtime.right.png"
    },
    prompts: {}
  },
  {
    assetId: "entity.hostile.anchor.runtime",
    familyLabel: "Anchor hostile",
    generatedFacings: [],
    rightSourcePath: "src/assets/entities/runtime/entity.hostile.anchor.runtime.png",
    finalPaths: {
      right: "src/assets/entities/runtime/entity.hostile.anchor.runtime.right.png"
    },
    prompts: {}
  },
  {
    assetId: "entity.hostile.drifter.runtime",
    familyLabel: "Drifter hostile",
    generatedFacings: [],
    rightSourcePath: "src/assets/entities/runtime/entity.hostile.drifter.runtime.png",
    finalPaths: {
      right: "src/assets/entities/runtime/entity.hostile.drifter.runtime.right.png"
    },
    prompts: {}
  },
  {
    assetId: "entity.hostile.rammer.runtime",
    familyLabel: "Rammer hostile",
    generatedFacings: [],
    rightSourcePath: "src/assets/entities/runtime/entity.hostile.rammer.runtime.png",
    finalPaths: {
      right: "src/assets/entities/runtime/entity.hostile.rammer.runtime.right.png"
    },
    prompts: {}
  },
  {
    assetId: "entity.hostile.sentinel.runtime",
    familyLabel: "Sentinel hostile",
    generatedFacings: [],
    rightSourcePath: "src/assets/entities/runtime/entity.hostile.sentinel.runtime.png",
    finalPaths: {
      right: "src/assets/entities/runtime/entity.hostile.sentinel.runtime.right.png"
    },
    prompts: {}
  },
  {
    assetId: "entity.hostile.watcher.runtime",
    familyLabel: "Watcher hostile",
    generatedFacings: [],
    rightSourcePath: "src/assets/entities/runtime/entity.hostile.watcher.runtime.png",
    finalPaths: {
      right: "src/assets/entities/runtime/entity.hostile.watcher.runtime.right.png"
    },
    prompts: {}
  }
];

export const directionalEntityGenerationRoot = resolve(repoRoot, "output/imagegen/directional-entities");
export const directionalCandidatesRoot = resolve(directionalEntityGenerationRoot, "candidates");
export const directionalSelectionFilePath = resolve(
  directionalEntityGenerationRoot,
  "selection.json"
);
export const directionalGalleryFilePath = resolve(directionalEntityGenerationRoot, "gallery.html");
export const directionalPromptBatchFilePath = resolve(
  repoRoot,
  "tmp/imagegen/directional-entities-prompts.jsonl"
);
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

export const toCandidateRelativePath = (assetId, facing, variantIndex = 1) =>
  `candidates/${assetId}/${facing}/variant-${String(variantIndex).padStart(2, "0")}.png`;

export const toCandidateAbsolutePath = (assetId, facing, variantIndex = 1) =>
  resolve(directionalEntityGenerationRoot, toCandidateRelativePath(assetId, facing, variantIndex));

export const writePromptBatchFile = ({ variantIndex = 1 } = {}) => {
  ensureDirectory(dirname(directionalPromptBatchFilePath));
  const lines = directionalEntityPlan.flatMap((entry) =>
    entry.generatedFacings.map((facing) =>
      JSON.stringify({
        prompt: entry.prompts[facing],
        size: "1024x1024",
        background: "transparent",
        output_format: "png",
        out: toCandidateRelativePath(entry.assetId, facing, variantIndex)
      })
    )
  );

  writeFileSync(directionalPromptBatchFilePath, `${lines.join("\n")}\n`, "utf8");
};

export const loadSelectionMap = () => {
  try {
    return JSON.parse(readFileSync(directionalSelectionFilePath, "utf8"));
  } catch {
    return Object.fromEntries(
      directionalEntityPlan.flatMap((entry) =>
        entry.generatedFacings.map((facing) => [
          `${entry.assetId}.${facing}`,
          toCandidateRelativePath(entry.assetId, facing, 1)
        ])
      )
    );
  }
};

export const writeSelectionMap = (selectionMap) => {
  ensureDirectory(dirname(directionalSelectionFilePath));
  writeFileSync(directionalSelectionFilePath, `${JSON.stringify(selectionMap, null, 2)}\n`, "utf8");
};

export const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

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

  if (statExists(directionalCandidatesRoot)) {
    walk(directionalCandidatesRoot);
  }

  return files.sort();
};

export const copyRightFacingBaseAssets = () => {
  for (const entry of directionalEntityPlan) {
    const sourcePath = resolve(repoRoot, entry.rightSourcePath);
    const destinationPath = resolve(repoRoot, entry.finalPaths.right);
    ensureDirectory(dirname(destinationPath));
    copyFileSync(sourcePath, destinationPath);
  }
};

export const toRelativeFromRepo = (absolutePath) => absolutePath.replace(`${repoRoot}/`, "");
export const getStem = (filePath) => basename(filePath).replace(/\.[^.]+$/u, "");
