/* global URL, console */

import { copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  crystalAssetGenerationRoot,
  crystalAssetPlan,
  ensureDirectory,
  loadSelectionMap,
  statExists
} from "./crystalAssetWorkflow.mjs";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const selectionMap = loadSelectionMap();

for (const entry of crystalAssetPlan) {
  const selectedRelativePath = selectionMap[entry.assetId];

  if (!selectedRelativePath) {
    continue;
  }

  const selectedAbsolutePath = resolve(crystalAssetGenerationRoot, selectedRelativePath);

  if (!statExists(selectedAbsolutePath)) {
    throw new Error(`Selected candidate missing for ${entry.assetId}: ${selectedRelativePath}`);
  }

  const finalAbsolutePath = resolve(repoRoot, entry.finalPath);
  ensureDirectory(dirname(finalAbsolutePath));
  copyFileSync(selectedAbsolutePath, finalAbsolutePath);
  console.log(`Promoted ${entry.assetId} -> ${entry.finalPath}`);
}
