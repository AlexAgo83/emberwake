/* global URL, console */

import { copyFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  ensureDirectory,
  loadSelectionMap,
  skillIconPlan,
  statExists,
  toRelativeFromRepo
} from "./skillIconWorkflow.mjs";

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

const downscaleSquare = ({ inputPath, outputPath, maxDim = 256 }) => {
  const resize = spawnSync("sips", ["-Z", String(maxDim), inputPath, "--out", outputPath], {
    stdio: "inherit"
  });

  if (resize.status !== 0) {
    throw new Error(`sips resize failed for ${inputPath}`);
  }
};

const selectionMap = loadSelectionMap();

for (const entry of skillIconPlan) {
  const selectedRelativePath = selectionMap[entry.assetId];

  if (!selectedRelativePath) {
    continue;
  }

  const selectedAbsolutePath = resolve(repoRoot, "output/imagegen/skill-icons", selectedRelativePath);

  if (!statExists(selectedAbsolutePath)) {
    throw new Error(`Selected candidate missing for ${entry.assetId}: ${selectedRelativePath}`);
  }

  const finalAbsolutePath = resolve(repoRoot, entry.finalPath);
  ensureDirectory(dirname(finalAbsolutePath));
  removeSiblingRuntimeAssets(finalAbsolutePath);
  const stagedPngPath = finalAbsolutePath.replace(/\.[^.]+$/u, ".staged.png");
  const transformedPngPath = finalAbsolutePath.replace(/\.[^.]+$/u, ".transformed.png");
  copyFileSync(selectedAbsolutePath, stagedPngPath);
  downscaleSquare({ inputPath: stagedPngPath, outputPath: transformedPngPath });
  convertToWebp({ inputPath: transformedPngPath, outputPath: finalAbsolutePath });
  rmSync(stagedPngPath, { force: true });
  rmSync(transformedPngPath, { force: true });
  console.log(`Promoted ${entry.assetId} -> ${toRelativeFromRepo(finalAbsolutePath)}`);
}
