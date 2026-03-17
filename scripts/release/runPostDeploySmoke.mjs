import { spawn } from "node:child_process";
import process from "node:process";
import { URL } from "node:url";

const releaseSmokeUrl = process.env.RELEASE_SMOKE_URL;

if (!releaseSmokeUrl) {
  throw new Error("RELEASE_SMOKE_URL is required to run post-deployment smoke.");
}

const smokeProcess = spawn("node", ["scripts/testing/runBrowserSmoke.mjs"], {
  cwd: new URL("../../", import.meta.url),
  env: {
    ...process.env,
    BROWSER_SMOKE_URL: releaseSmokeUrl
  },
  stdio: "inherit"
});

await new Promise((resolve, reject) => {
  smokeProcess.on("exit", (code) => {
    if (code === 0) {
      resolve(undefined);
      return;
    }

    reject(new Error(`Post-deployment smoke failed with exit code ${code ?? "unknown"}.`));
  });
  smokeProcess.on("error", reject);
});
