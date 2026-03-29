/* global console, process */

import { dirname } from "node:path";
import { spawnSync } from "node:child_process";
import {
  ensureDirectory,
  imageGenCliPath,
  loadLocalEnv,
  skillIconPromptBatchFilePath,
  toCandidateAbsolutePath,
  writePromptBatchFile
} from "./skillIconWorkflow.mjs";

const parseArgs = () => {
  const args = process.argv.slice(2);
  const iconIds = [];
  let variantIndex = 1;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--icon") {
      iconIds.push(args[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--variant") {
      variantIndex = Number(args[index + 1]);
      index += 1;
      continue;
    }
  }

  return { iconIds: iconIds.length > 0 ? iconIds : null, variantIndex };
};

loadLocalEnv();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not available. Add it to .env.local or the shell env.");
}

const { iconIds, variantIndex } = parseArgs();
const selectedIcons = writePromptBatchFile({ iconIds, variantIndex });

for (const [index, entry] of selectedIcons.entries()) {
  const outputPath = toCandidateAbsolutePath(entry.assetId, variantIndex);
  ensureDirectory(dirname(outputPath));
  console.log(`[job ${index + 1}/${selectedIcons.length}] starting ${entry.assetId}`);

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
      "transparent",
      "--output-format",
      "png",
      "--out",
      outputPath,
      "--force"
    ],
    {
      cwd: dirname(skillIconPromptBatchFilePath),
      env: process.env,
      stdio: "inherit"
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Generated ${selectedIcons.length} skill icon candidate(s).`);
