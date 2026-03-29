/* global URL, console */

import { copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  copyRightFacingBaseAssets,
  directionalEntityGenerationRoot,
  directionalEntityPlan,
  ensureDirectory,
  loadSelectionMap,
  statExists,
  toRelativeFromRepo
} from "./directionalEntityWorkflow.mjs";

copyRightFacingBaseAssets();

const selectionMap = loadSelectionMap();

for (const entry of directionalEntityPlan) {
  for (const facing of entry.generatedFacings) {
    const selectedRelativePath = selectionMap[`${entry.assetId}.${facing}`];

    if (!selectedRelativePath) {
      continue;
    }

    const selectedAbsolutePath = resolve(directionalEntityGenerationRoot, selectedRelativePath);

    if (!statExists(selectedAbsolutePath)) {
      throw new Error(`Selected directional candidate missing for ${entry.assetId}.${facing}`);
    }

    const finalAbsolutePath = resolve(new URL("../..", import.meta.url).pathname, entry.finalPaths[facing]);
    ensureDirectory(dirname(finalAbsolutePath));
    copyFileSync(selectedAbsolutePath, finalAbsolutePath);
    console.log(`Promoted ${entry.assetId}.${facing} -> ${toRelativeFromRepo(finalAbsolutePath)}`);
  }
}
