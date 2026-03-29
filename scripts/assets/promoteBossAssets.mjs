/* global URL, console */

import { copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  bossAssetGenerationRoot,
  bossAssetPlan,
  ensureDirectory,
  loadSelectionMap,
  statExists,
  toRelativeFromRepo
} from "./bossAssetWorkflow.mjs";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const selectionMap = loadSelectionMap();

for (const entry of bossAssetPlan) {
  const selectedRelativePath = selectionMap[entry.assetId];

  if (!selectedRelativePath) {
    continue;
  }

  const selectedAbsolutePath = resolve(bossAssetGenerationRoot, selectedRelativePath);

  if (!statExists(selectedAbsolutePath)) {
    throw new Error(`Selected candidate missing for ${entry.assetId}: ${selectedRelativePath}`);
  }

  const finalBaseAbsolutePath = resolve(repoRoot, entry.finalPath);
  const finalRightAbsolutePath = resolve(repoRoot, entry.finalRightPath);
  ensureDirectory(dirname(finalBaseAbsolutePath));
  ensureDirectory(dirname(finalRightAbsolutePath));
  copyFileSync(selectedAbsolutePath, finalBaseAbsolutePath);
  copyFileSync(selectedAbsolutePath, finalRightAbsolutePath);
  console.log(`Promoted ${entry.assetId} -> ${toRelativeFromRepo(finalBaseAbsolutePath)}`);
}
