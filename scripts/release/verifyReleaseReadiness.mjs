import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { execFile } from "node:child_process";
import process from "node:process";
import { promisify } from "node:util";
import { URL } from "node:url";

const execFileAsync = promisify(execFile);
const allowNonReleaseBranch = process.argv.includes("--allow-non-release");

const ensurePathExists = async (targetPath) => {
  await access(targetPath, constants.F_OK);
};

const { stdout: currentBranchOutput } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
  cwd: new URL("../../", import.meta.url)
});
const currentBranch = currentBranchOutput.trim();

if (!allowNonReleaseBranch && currentBranch !== "release") {
  throw new Error(`Release readiness must be checked from the release branch. Current branch: ${currentBranch}`);
}

await ensurePathExists(new URL("../../dist", import.meta.url));

process.stdout.write(
  JSON.stringify(
    {
      artifact: "dist",
      branch: currentBranch,
      branchPolicy: allowNonReleaseBranch ? "advisory" : "release-only",
      requiredChecks: ["npm run ci", "npm run release:changelog:validate", "npm run test:browser:smoke"]
    },
    null,
    2
  ) + "\n"
);
