import { constants } from "node:fs";
import { spawn, execFile } from "node:child_process";
import { access } from "node:fs/promises";
import process from "node:process";
import { promisify } from "node:util";
import { URL } from "node:url";

const execFileAsync = promisify(execFile);
const allowNonReleaseBranch = process.argv.includes("--allow-non-release");
const projectRoot = new URL("../../", import.meta.url);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const requiredChecks = [
  ["run", "ci"],
  ["run", "release:changelog:validate"],
  ["run", "test:browser:smoke"]
];

const ensurePathExists = async (targetPath) => {
  await access(targetPath, constants.F_OK);
};

const runCommand = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`Command failed: ${command} ${args.join(" ")} (exit ${code ?? "unknown"})`));
    });
  });

const { stdout: currentBranchOutput } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
  cwd: projectRoot
});
const currentBranch = currentBranchOutput.trim();

if (!allowNonReleaseBranch && currentBranch !== "release") {
  throw new Error(`Release readiness must be checked from the release branch. Current branch: ${currentBranch}`);
}

for (const checkArgs of requiredChecks) {
  await runCommand(npmCommand, checkArgs);
}

await ensurePathExists(new URL("../../dist", import.meta.url));

process.stdout.write(
  JSON.stringify(
    {
      artifact: "dist",
      branch: currentBranch,
      branchPolicy: allowNonReleaseBranch ? "advisory" : "release-only",
      requiredChecks: requiredChecks.map((checkArgs) => `${npmCommand} ${checkArgs.join(" ")}`)
    },
    null,
    2
  ) + "\n"
);
