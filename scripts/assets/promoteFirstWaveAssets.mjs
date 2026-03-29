/* global URL, console */

import { copyFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  ensureDirectory,
  firstWaveAssetPlan,
  loadSelectionMap,
  statExists,
  toRelativeFromRepo
} from "./firstWaveAssetWorkflow.mjs";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);

const removeSiblingRuntimeAssets = (finalPath) => {
  const finalDirectory = dirname(finalPath);
  const finalStem = finalPath.replace(/\.[^.]+$/u, "").split("/").at(-1);

  for (const entry of readdirSync(finalDirectory)) {
    if (entry === ".gitkeep" || entry.endsWith(".meta.json")) {
      continue;
    }

    const entryStem = entry.replace(/\.[^.]+$/u, "");

    if (entryStem !== finalStem) {
      continue;
    }

    rmSync(join(finalDirectory, entry), { force: true });
  }
};

const convertToWebp = ({ inputPath, outputPath, quality = 88 }) => {
  const conversion = spawnSync("cwebp", ["-q", String(quality), inputPath, "-o", outputPath], {
    stdio: "inherit"
  });

  if (conversion.status !== 0) {
    throw new Error(`cwebp failed for ${inputPath}`);
  }
};

const cropShellBanner = ({ inputPath, outputPath }) => {
  const crop = spawnSync("sips", ["-c", "512", "1536", inputPath, "--out", outputPath], {
    stdio: "inherit"
  });

  if (crop.status !== 0) {
    throw new Error(`sips crop failed for ${inputPath}`);
  }
};

const downscaleSquare = ({ inputPath, outputPath, maxDim = 512 }) => {
  const resize = spawnSync("sips", ["-Z", String(maxDim), inputPath, "--out", outputPath], {
    stdio: "inherit"
  });

  if (resize.status !== 0) {
    throw new Error(`sips resize failed for ${inputPath}`);
  }
};

const selectionMap = loadSelectionMap();

for (const entry of firstWaveAssetPlan) {
  const selectedRelativePath = selectionMap[entry.assetId];

  if (!selectedRelativePath) {
    continue;
  }

  const selectedAbsolutePath = resolve(repoRoot, "output/imagegen/first-wave", selectedRelativePath);

  if (!statExists(selectedAbsolutePath)) {
    throw new Error(`Selected candidate missing for ${entry.assetId}: ${selectedRelativePath}`);
  }

  const finalAbsolutePath = resolve(repoRoot, entry.finalPath);
  const finalDirectory = dirname(finalAbsolutePath);
  ensureDirectory(finalDirectory);
  removeSiblingRuntimeAssets(finalAbsolutePath);

  if (entry.deliveryFormat === "png") {
    copyFileSync(selectedAbsolutePath, finalAbsolutePath);
    console.log(`Promoted ${entry.assetId} -> ${toRelativeFromRepo(finalAbsolutePath)}`);
    continue;
  }

  const stagedPngPath = finalAbsolutePath.replace(/\.[^.]+$/u, ".staged.png");
  const transformedPngPath = finalAbsolutePath.replace(/\.[^.]+$/u, ".transformed.png");
  copyFileSync(selectedAbsolutePath, stagedPngPath);

  if (entry.assetId.startsWith("shell.scene.codex.header")) {
    cropShellBanner({ inputPath: stagedPngPath, outputPath: transformedPngPath });
  } else {
    downscaleSquare({ inputPath: stagedPngPath, outputPath: transformedPngPath });
  }

  convertToWebp({ inputPath: transformedPngPath, outputPath: finalAbsolutePath });
  rmSync(stagedPngPath, { force: true });
  rmSync(transformedPngPath, { force: true });
  console.log(`Promoted ${entry.assetId} -> ${toRelativeFromRepo(finalAbsolutePath)}`);
}
