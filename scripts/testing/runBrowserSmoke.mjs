import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";
import { URL } from "node:url";

import { chromium } from "playwright";
import runtimePerformanceBudget from "../../src/shared/config/runtimePerformanceBudget.json" with { type: "json" };

const previewHost = "127.0.0.1";
const outputDirectory = new URL("../../output/playwright/", import.meta.url);
const externalSmokeUrl = process.env.BROWSER_SMOKE_URL;

const waitForPreview = async () => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 15000) {
    try {
      const response = await globalThis.fetch(previewUrl);

      if (response.ok) {
        return;
      }
    } catch {
      await sleep(250);
      continue;
    }

    await sleep(250);
  }

  throw new Error(`Preview server did not start within 15s: ${previewUrl}`);
};

const resolveFreePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();

    server.unref();
    server.on("error", reject);
    server.listen(0, previewHost, () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        server.close(() => {
          reject(new Error("Could not resolve a free preview port for browser smoke."));
        });
        return;
      }

      const { port } = address;

      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(port);
      });
    });
  });

const parseWorldPosition = (value) => {
  const [x, y] = value.split(",").map((part) => Number(part.trim()));

  if (Number.isNaN(x) || Number.isNaN(y)) {
    throw new Error(`Could not parse world position from: ${value}`);
  }

  return { x, y };
};

const previewPort = externalSmokeUrl ? null : await resolveFreePort();
const previewUrl = externalSmokeUrl ?? `http://${previewHost}:${previewPort}`;

const previewServer =
  externalSmokeUrl === undefined
    ? spawn(
        "npm",
        ["run", "preview", "--", "--host", previewHost, "--port", String(previewPort), "--strictPort"],
        {
          cwd: new URL("../../", import.meta.url),
          env: {
            ...process.env,
            CI: "1",
            VITE_APP_ENV: process.env.VITE_APP_ENV ?? "preview"
          },
          stdio: "inherit"
        }
      )
    : null;

let browser;

try {
  if (externalSmokeUrl === undefined) {
    await waitForPreview();
  }
  await mkdir(outputDirectory, {
    recursive: true
  });

  browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    viewport: {
      width: 1280,
      height: 800
    }
  });

  await page.goto(previewUrl, {
    waitUntil: "networkidle"
  });

  await page.locator('.app-shell[data-renderer-status="ready"]').waitFor({
    timeout: runtimePerformanceBudget.runtimeActivation.maxMenuInteractiveMs
  });

  const readinessMetrics = await page.evaluate(() => globalThis.window.__EMBERWAKE_RUNTIME_METRICS__);

  if (
    typeof readinessMetrics?.rendererReadyMs !== "number" ||
    readinessMetrics.rendererReadyMs > runtimePerformanceBudget.runtimeActivation.maxRendererReadyMs
  ) {
    throw new Error(
      `Renderer readiness exceeded budget. Actual: ${readinessMetrics?.rendererReadyMs ?? "missing"}ms, budget: ${runtimePerformanceBudget.runtimeActivation.maxRendererReadyMs}ms`
    );
  }

  await page.getByRole("button", {
    name: "Menu"
  }).click();
  await page.getByRole("button", {
    name: /Inspecteur/i
  }).click();

  const inspectionPanel = page.getByTestId("entity-inspection");
  const worldPosition = inspectionPanel.getByTestId("entity-world");

  const initialPosition = parseWorldPosition((await worldPosition.textContent()) ?? "");

  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(400);
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(150);

  const nextPosition = parseWorldPosition((await worldPosition.textContent()) ?? "");

  if (nextPosition.x <= initialPosition.x) {
    throw new Error(
      `Expected entity to move to the right. Initial: ${initialPosition.x}, next: ${nextPosition.x}`
    );
  }

  const runtimeMetrics = await page.evaluate(() => globalThis.window.__EMBERWAKE_RUNTIME_METRICS__);
  const frameLoopMetrics = runtimeMetrics?.frameLoop;

  if (frameLoopMetrics?.schedulerMode !== "pixi-ticker-master") {
    throw new Error(
      `Expected unified live frame loop to be driven by Pixi ticker. Actual: ${frameLoopMetrics?.schedulerMode ?? "missing"}`
    );
  }

  if (
    typeof frameLoopMetrics.recentFramesTracked !== "number" ||
    frameLoopMetrics.recentFramesTracked < runtimePerformanceBudget.framePacing.minTrackedVisualFrames
  ) {
    throw new Error(
      `Frame pacing sample window too small. Actual: ${frameLoopMetrics?.recentFramesTracked ?? "missing"}, minimum: ${runtimePerformanceBudget.framePacing.minTrackedVisualFrames}`
    );
  }

  if (
    typeof frameLoopMetrics.recentMaxSimulationStepsLastFrame !== "number" ||
    frameLoopMetrics.recentMaxSimulationStepsLastFrame >
      runtimePerformanceBudget.framePacing.maxSimulationStepsPerVisualFrame
  ) {
    throw new Error(
      `Simulation step burst exceeded frame pacing budget. Actual: ${frameLoopMetrics?.recentMaxSimulationStepsLastFrame ?? "missing"}, budget: ${runtimePerformanceBudget.framePacing.maxSimulationStepsPerVisualFrame}`
    );
  }

  if (
    typeof frameLoopMetrics.recentCatchUpFramesRatio !== "number" ||
    frameLoopMetrics.recentCatchUpFramesRatio > runtimePerformanceBudget.framePacing.maxCatchUpFramesRatio
  ) {
    throw new Error(
      `Catch-up frame ratio exceeded budget. Actual: ${frameLoopMetrics?.recentCatchUpFramesRatio ?? "missing"}, budget: ${runtimePerformanceBudget.framePacing.maxCatchUpFramesRatio}`
    );
  }

  await page.screenshot({
    path: new URL("browser-smoke.png", outputDirectory).pathname
  });
  await writeFile(
    new URL("browser-smoke-metrics.json", outputDirectory),
    JSON.stringify(
      {
        budgets: runtimePerformanceBudget,
        runtimeMetrics
      },
      null,
      2
    )
  );
} finally {
  await browser?.close();

  if (previewServer && !previewServer.killed) {
    previewServer.kill("SIGTERM");
  }
}
