/* global console, process */

import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

import {
  crystalAssetPlan,
  ensureDirectory,
  imageGenCliPath,
  loadLocalEnv,
  toCandidateAbsolutePath,
  writeSelectionMap
} from "./crystalAssetWorkflow.mjs";

loadLocalEnv();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not available. Add it to .env.local or the shell env.");
}

const selectionMap = {};

for (const [index, entry] of crystalAssetPlan.entries()) {
  const outputPath = toCandidateAbsolutePath(entry.assetId);
  ensureDirectory(dirname(outputPath));
  console.log(`[job ${index + 1}/${crystalAssetPlan.length}] starting ${entry.assetId}`);

  const result = spawnSync(
    "python3",
    [
      imageGenCliPath,
      "generate",
      "--prompt",
      entry.prompt,
      "--size",
      "1024x1024",
      "--background",
      "transparent",
      "--output-format",
      "png",
      "--out",
      outputPath,
      "--force"
    ],
    {
      cwd: dirname(outputPath),
      env: process.env,
      stdio: "inherit"
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  selectionMap[entry.assetId] = `candidates/${entry.assetId}/variant-01.png`;
}

writeSelectionMap(selectionMap);
console.log(`Generated ${crystalAssetPlan.length} crystal asset candidate(s).`);
