/* global console, process */

import { dirname } from "node:path";
import { spawnSync } from "node:child_process";
import {
  ensureDirectory,
  imageGenCliPath,
  loadLocalEnv,
  promptBatchFilePath,
  toCandidateAbsolutePath,
  writePromptBatchFile
} from "./firstWaveAssetWorkflow.mjs";

const parseArgs = () => {
  const args = process.argv.slice(2);
  const assetIds = [];
  let variantIndex = 1;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--asset") {
      assetIds.push(args[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--variant") {
      variantIndex = Number(args[index + 1]);
      index += 1;
      continue;
    }

  }

  return { assetIds: assetIds.length > 0 ? assetIds : null, variantIndex };
};

loadLocalEnv();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not available. Add it to .env.local or the shell env.");
}

const { assetIds, variantIndex } = parseArgs();
const selectedAssets = writePromptBatchFile({ assetIds, variantIndex });

for (const [index, entry] of selectedAssets.entries()) {
  const outputPath = toCandidateAbsolutePath(entry.assetId, variantIndex);
  ensureDirectory(dirname(outputPath));
  console.log(`[job ${index + 1}/${selectedAssets.length}] starting ${entry.assetId}`);

  const result = spawnSync(
    "python3",
    [
      imageGenCliPath,
      "generate",
      "--prompt",
      entry.prompt,
      "--size",
      entry.size,
      "--background",
      entry.background,
      "--output-format",
      "png",
      "--out",
      outputPath,
      "--force"
    ],
    {
      cwd: dirname(promptBatchFilePath),
      env: process.env,
      stdio: "inherit"
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Generated ${selectedAssets.length} first-wave asset candidate(s).`);
