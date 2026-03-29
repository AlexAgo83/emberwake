/* global console */

import { spawnSync } from "node:child_process";

import {
  directionalEntityPlan,
  imageGenCliPath,
  loadLocalEnv,
  toCandidateAbsolutePath
} from "./directionalEntityWorkflow.mjs";

loadLocalEnv();

if (directionalEntityPlan.every((entry) => entry.generatedFacings.length === 0)) {
  console.log("Directional generation skipped: the current posture is lateral-only with runtime mirroring.");
}

for (const entry of directionalEntityPlan) {
  for (const facing of entry.generatedFacings) {
    const outputPath = toCandidateAbsolutePath(entry.assetId, facing, 1);
    const prompt = entry.prompts[facing];
    const generation = spawnSync(
      "python3",
      [
        imageGenCliPath,
        "generate",
        "--prompt",
        prompt,
        "--size",
        "1024x1024",
        "--background",
        "transparent",
        "--out",
        outputPath,
        "--force"
      ],
      {
        stdio: "inherit"
      }
    );

    if (generation.status !== 0) {
      throw new Error(`Image generation failed for ${entry.assetId}.${facing}`);
    }

    console.log(`Generated ${entry.assetId}.${facing}`);
  }
}
