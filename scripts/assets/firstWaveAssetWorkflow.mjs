/* global URL, process */

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);

export const firstWaveAssetPlan = [
  {
    assetId: "entity.player.primary.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.player.primary.runtime.png",
    prompt:
      "Create a single-subject runtime game asset for a techno-shinobi action game: the player core avatar, centered on a transparent background, east-facing, crisp readable silhouette, compact ember reactor body with shard-like fins and controlled luminous accents, graphic and stylized rather than photoreal, medium detail, strong interior separation, readable at small scale, no text, no frame, no environment, no floor, no cast shadow, no perspective distortion."
  },
  {
    assetId: "entity.hostile.anchor.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.hostile.anchor.runtime.png",
    prompt:
      "Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a heavy anchor hostile, centered, east-facing, broad armored silhouette with stable weight and industrial shrine-tech geometry, medium detail, readable at small scale, strong outer shape, graphic stylization, no text, no background, no ground plane, no cinematic perspective, no clutter."
  },
  {
    assetId: "entity.hostile.drifter.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.hostile.drifter.runtime.png",
    prompt:
      "Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a drifter hostile, centered, east-facing, agile asymmetrical silhouette with scavenger-tech shards and flowing body mass, stylized and readable, medium detail, clean silhouette first, no environment, no text, no cinematic blur, no perspective distortion."
  },
  {
    assetId: "entity.hostile.needle.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.hostile.needle.runtime.png",
    prompt:
      "Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a needle hostile, centered, east-facing, narrow spear-like silhouette with shard-tech fins and a sharp forward attack profile, highly readable at small scale, stylized, medium detail, no text, no background, no floor, no cinematic effects."
  },
  {
    assetId: "entity.hostile.rammer.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.hostile.rammer.runtime.png",
    prompt:
      "Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a rammer hostile, centered, east-facing, wedge-like armored silhouette with charge-brute posture and impact-focused front geometry, stylized, readable at small scale, medium detail, no environment, no text, no cinematic effects."
  },
  {
    assetId: "entity.hostile.sentinel.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.hostile.sentinel.runtime.png",
    prompt:
      "Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a sentinel hostile, centered, east-facing, shield-like armored silhouette with disciplined pursuit posture and husk-like frame design, stylized and clean, medium detail, readable at small size, no text, no background, no cinematic camera."
  },
  {
    assetId: "entity.hostile.watcher.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.hostile.watcher.runtime.png",
    prompt:
      "Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a watcher hostile, centered, survey-drone silhouette with eye-like radial framing and a controlled emissive core, stylized not realistic, readable at small scale, medium detail, no text, no background, no lens flare, no horror gore."
  },
  {
    assetId: "entity.pickup.cache.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.pickup.cache.runtime.png",
    prompt:
      "Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a compact cache pickup, centered, slightly top-down, shrine-tech storage case silhouette, stylized, readable at small scale, medium detail, no text, no background, no floor, no cinematic lighting."
  },
  {
    assetId: "entity.pickup.crystal.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.pickup.crystal.runtime.png",
    prompt:
      "Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a single energy crystal pickup, centered, stylized shard silhouette with clean facets, readable at small scale, medium detail, no text, no background, no floor, no cinematic effects."
  },
  {
    assetId: "entity.pickup.gold.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.pickup.gold.runtime.png",
    prompt:
      "Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a gold pickup token, centered, compact coin-like silhouette with subtle techno engraving cues, stylized, readable at small scale, no text, no background, no pile of coins, no cinematic lighting."
  },
  {
    assetId: "entity.pickup.healing-kit.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.pickup.healing-kit.runtime.png",
    prompt:
      "Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a compact healing kit pickup, centered, readable med-kit silhouette with subtle futuristic field-tech cues, stylized, medium detail, no gore, no text, no background, no floor."
  },
  {
    assetId: "entity.pickup.hourglass.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.pickup.hourglass.runtime.png",
    prompt:
      "Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a time-stop hourglass pickup, centered, symmetrical and highly readable silhouette with shrine-tech styling, stylized, medium detail, no text, no background, no floor, no cinematic particle cloud."
  },
  {
    assetId: "entity.pickup.magnet.runtime",
    deliveryFormat: "png",
    size: "1024x1024",
    background: "transparent",
    finalPath: "src/assets/entities/runtime/entity.pickup.magnet.runtime.png",
    prompt:
      "Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a magnet pickup, centered, compact and unmistakable magnet silhouette with subtle futuristic relic styling, stylized, readable at small scale, no text, no background, no floor, no particle swarm."
  },
  {
    assetId: "map.terrain.ashfield.runtime",
    deliveryFormat: "webp",
    size: "1024x1024",
    background: "opaque",
    finalPath: "src/assets/map/runtime/map.terrain.ashfield.runtime.webp",
    prompt:
      "Create a square terrain texture panel for a techno-shinobi survival game: ashfield biome, 1024 by 1024, seamless or near seamless, dark industrial ash-charcoal surface with restrained warm ember accents, stylized graphic texture, low noise, no horizon, no props, no text, no perspective camera."
  },
  {
    assetId: "map.terrain.emberplain.runtime",
    deliveryFormat: "webp",
    size: "1024x1024",
    background: "opaque",
    finalPath: "src/assets/map/runtime/map.terrain.emberplain.runtime.webp",
    prompt:
      "Create a square terrain texture panel for a techno-shinobi survival game: emberplain biome, 1024 by 1024, seamless or near seamless, warm fractured field surface with ember energy lines and dark volcanic undertones, stylized and readable, low clutter, no props, no horizon, no text, no perspective."
  },
  {
    assetId: "map.terrain.glowfen.runtime",
    deliveryFormat: "webp",
    size: "1024x1024",
    background: "opaque",
    finalPath: "src/assets/map/runtime/map.terrain.glowfen.runtime.webp",
    prompt:
      "Create a square terrain texture panel for a techno-shinobi survival game: glowfen biome, 1024 by 1024, seamless or near seamless, cool luminous wetland-tech surface with cyan energy traces and dark teal base, stylized, controlled noise, no props, no horizon, no text, no perspective."
  },
  {
    assetId: "map.terrain.obsidian.runtime",
    deliveryFormat: "webp",
    size: "1024x1024",
    background: "opaque",
    finalPath: "src/assets/map/runtime/map.terrain.obsidian.runtime.webp",
    prompt:
      "Create a square terrain texture panel for a techno-shinobi survival game: obsidian biome, 1024 by 1024, seamless or near seamless, dark crystalline surface with restrained violet fracture accents, stylized and readable, low clutter, no props, no horizon, no text, no perspective."
  }
];

export const imageGenerationRoot = resolve(repoRoot, "output/imagegen/first-wave");
export const candidatesRoot = resolve(imageGenerationRoot, "candidates");
export const selectionFilePath = resolve(imageGenerationRoot, "selection.json");
export const galleryFilePath = resolve(imageGenerationRoot, "gallery.html");
export const promptBatchFilePath = resolve(repoRoot, "tmp/imagegen/first-wave-prompts.jsonl");
export const imageGenCliPath = resolve(
  process.env.HOME ?? "~",
  ".codex/skills/.system/imagegen/scripts/image_gen.py"
);

export const ensureDirectory = (path) => {
  mkdirSync(path, { recursive: true });
};

const dotenvLinePattern = /^([A-Z0-9_]+)=(.*)$/;

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
  resolve(imageGenerationRoot, toCandidateRelativePath(assetId, variantIndex));

export const writePromptBatchFile = ({ assetIds = null, variantIndex = 1 } = {}) => {
  ensureDirectory(dirname(promptBatchFilePath));
  const selectedAssets = firstWaveAssetPlan.filter(
    (entry) => !assetIds || assetIds.includes(entry.assetId)
  );

  const lines = selectedAssets.map((entry) =>
    JSON.stringify({
      prompt: entry.prompt,
      size: entry.size,
      background: entry.background,
      output_format: "png",
      out: toCandidateRelativePath(entry.assetId, variantIndex)
    })
  );

  writeFileSync(promptBatchFilePath, `${lines.join("\n")}\n`, "utf8");
  return selectedAssets;
};

export const loadSelectionMap = () => {
  try {
    return JSON.parse(readFileSync(selectionFilePath, "utf8"));
  } catch {
    return Object.fromEntries(
      firstWaveAssetPlan.map((entry) => [entry.assetId, toCandidateRelativePath(entry.assetId, 1)])
    );
  }
};

export const writeSelectionMap = (selectionMap) => {
  ensureDirectory(dirname(selectionFilePath));
  writeFileSync(selectionFilePath, `${JSON.stringify(selectionMap, null, 2)}\n`, "utf8");
};

export const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

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

  if (statExists(candidatesRoot)) {
    walk(candidatesRoot);
  }

  return files.sort();
};

export const statExists = (path) => {
  try {
    return statSync(path);
  } catch {
    return null;
  }
};

export const toRelativeFromRepo = (absolutePath) => absolutePath.replace(`${repoRoot}/`, "");
export const getStem = (filePath) => basename(filePath).replace(/\.[^.]+$/u, "");
