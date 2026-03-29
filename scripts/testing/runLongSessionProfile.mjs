import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";
import { URL } from "node:url";

import { chromium, devices } from "playwright";
import runtimePerformanceBudget from "../../src/shared/config/runtimePerformanceBudget.json" with { type: "json" };

const previewHost = "127.0.0.1";
const outputDirectory = new URL("../../output/playwright/long-session/", import.meta.url);
const externalSmokeUrl = process.env.BROWSER_SMOKE_URL;

const parseArgs = (argv) => {
  const parsedArgs = {
    durationMs: 120_000,
    headed: false,
    invincible: undefined,
    loop: undefined,
    mobile: false,
    sampleIntervalMs: 1_000,
    scenarioId: "traversal-baseline",
    spawnMode: undefined
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const nextArgument = argv[index + 1];

    if (argument === "--scenario" && nextArgument) {
      parsedArgs.scenarioId = nextArgument;
      index += 1;
      continue;
    }

    if (argument === "--duration" && nextArgument) {
      parsedArgs.durationMs = parseDuration(nextArgument);
      index += 1;
      continue;
    }

    if (argument === "--sample-interval" && nextArgument) {
      parsedArgs.sampleIntervalMs = Number(nextArgument);
      index += 1;
      continue;
    }

    if (argument === "--spawn-mode" && nextArgument) {
      parsedArgs.spawnMode = nextArgument;
      index += 1;
      continue;
    }

    if (argument === "--invincible") {
      parsedArgs.invincible = true;
      continue;
    }

    if (argument === "--no-invincible") {
      parsedArgs.invincible = false;
      continue;
    }

    if (argument === "--loop") {
      parsedArgs.loop = true;
      continue;
    }

    if (argument === "--no-loop") {
      parsedArgs.loop = false;
      continue;
    }

    if (argument === "--headed") {
      parsedArgs.headed = true;
      continue;
    }

    if (argument === "--mobile") {
      parsedArgs.mobile = true;
    }
  }

  return parsedArgs;
};

const parseDuration = (value) => {
  const normalizedValue = value.trim().toLowerCase();
  const durationMatch = normalizedValue.match(/^(\d+)(ms|s|m)$/);

  if (!durationMatch) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const durationValue = Number(durationMatch[1]);
  const durationUnit = durationMatch[2];

  if (durationUnit === "ms") {
    return durationValue;
  }

  if (durationUnit === "s") {
    return durationValue * 1_000;
  }

  return durationValue * 60_000;
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
          reject(new Error("Could not resolve a free preview port for long-session profiling."));
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

const formatTimestampLabel = (date) => date.toISOString().replace(/[:.]/g, "-");

const waitForPreview = async (previewUrl) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 15_000) {
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

const readProfilingSnapshot = async (page) =>
  page.evaluate(() => {
    const runtimeMetrics = globalThis.window.__EMBERWAKE_RUNTIME_METRICS__ ?? null;
    const profilingBridge = globalThis.window.__EMBERWAKE_PROFILING__;
    const shellStatus = profilingBridge?.getShellStatus?.() ?? null;
    const runtimeStatus = profilingBridge?.getRuntimeStatus?.() ?? null;
    const simulationStatus = profilingBridge?.getSimulationStatus?.() ?? null;
    const memory = globalThis.performance?.memory
      ? {
          jsHeapSizeLimit: globalThis.performance.memory.jsHeapSizeLimit,
          totalJSHeapSize: globalThis.performance.memory.totalJSHeapSize,
          usedJSHeapSize: globalThis.performance.memory.usedJSHeapSize
        }
      : null;

    return {
      memory,
      runtimeMetrics,
      runtimeStatus,
      simulationStatus,
      shellStatus,
      timestampMs: globalThis.performance.now()
    };
  });

const recoverSimulationAfterSnapshot = async ({ page, previousTick }) => {
  if (typeof previousTick !== "number") {
    return null;
  }

  const startedAt = Date.now();

  while (Date.now() - startedAt < 3_000) {
    const status = await page.evaluate(() => {
      const runtimeMetrics = globalThis.window.__EMBERWAKE_RUNTIME_METRICS__ ?? null;
      const profilingBridge = globalThis.window.__EMBERWAKE_PROFILING__;
      const shellStatus = profilingBridge?.getShellStatus?.() ?? null;
      const simulationStatus = profilingBridge?.getSimulationStatus?.() ?? null;
      const runtimeTick = runtimeMetrics?.runtimeState?.tick ?? simulationStatus?.simulationTick ?? null;

      return {
        runtimeTick,
        shellStatus,
        simulationStatus
      };
    });

    if (typeof status.runtimeTick === "number" && status.runtimeTick > previousTick) {
      return status;
    }

    if (
      status.shellStatus?.activeScene === "runtime" &&
      status.shellStatus?.isMenuOpen === false &&
      status.simulationStatus?.levelUpVisible === true
    ) {
      await page.evaluate(() => globalThis.window.__EMBERWAKE_PROFILING__?.chooseBuildChoice?.(0));
      await page.waitForTimeout(100);
      continue;
    }

    if (
      status.shellStatus?.activeScene === "runtime" &&
      status.shellStatus?.isMenuOpen === false &&
      status.simulationStatus?.levelUpVisible === false &&
      status.simulationStatus?.simulationPaused === true
    ) {
      await page.evaluate(() => globalThis.window.__EMBERWAKE_PROFILING__?.resumeSimulation?.());
    }

    await page.waitForTimeout(100);
  }

  return null;
};

const captureHeapSnapshot = async ({ cdpSession, fileUrl, label, page }) => {
  await cdpSession.send("HeapProfiler.enable");

  try {
    await cdpSession.send("HeapProfiler.collectGarbage");
  } catch {
    // Best-effort garbage collection before snapshotting.
  }

  const outputStream = createWriteStream(fileUrl);
  const handleChunk = ({ chunk }) => {
    outputStream.write(chunk);
  };

  cdpSession.on("HeapProfiler.addHeapSnapshotChunk", handleChunk);

  try {
    await page.waitForTimeout(50);
    await cdpSession.send("HeapProfiler.takeHeapSnapshot", {
      reportProgress: false
    });
  } finally {
    cdpSession.off("HeapProfiler.addHeapSnapshotChunk", handleChunk);
    outputStream.end();
    await new Promise((resolve, reject) => {
      outputStream.on("finish", resolve);
      outputStream.on("error", reject);
    });
  }

  return {
    label,
    path: fileUrl.pathname
  };
};

const summarizeSamples = (samples) => {
  const safeMax = (values) => (values.length > 0 ? Math.max(...values) : null);
  const heapSamples = samples
    .map((sample) => sample.memory?.usedJSHeapSize ?? null)
    .filter((heapValue) => typeof heapValue === "number");
  const fpsSamples = samples
    .map((sample) => sample.runtimeMetrics?.frameLoop?.fps ?? null)
    .filter((fpsValue) => typeof fpsValue === "number");
  const entityCountSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.entityCount ?? null)
    .filter((entityCount) => typeof entityCount === "number");
  const pickupCountSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.pickupCount ?? null)
    .filter((pickupCount) => typeof pickupCount === "number");
  const crystalPickupSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.pickupKindCounts?.crystal ?? null)
    .filter((pickupCount) => typeof pickupCount === "number");
  const crystalPickupStackSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.pickupStackTotals?.crystal ?? null)
    .filter((pickupCount) => typeof pickupCount === "number");
  const goldPickupSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.pickupKindCounts?.gold ?? null)
    .filter((pickupCount) => typeof pickupCount === "number");
  const goldPickupStackSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.pickupStackTotals?.gold ?? null)
    .filter((pickupCount) => typeof pickupCount === "number");
  const cachePickupSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.pickupKindCounts?.cache ?? null)
    .filter((pickupCount) => typeof pickupCount === "number");
  const healingPickupSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.pickupKindCounts?.healingKit ?? null)
    .filter((pickupCount) => typeof pickupCount === "number");
  const floatingDamageNumberSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.floatingDamageNumberCount ?? null)
    .filter((count) => typeof count === "number");
  const levelUpChoiceSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.levelUpChoiceCount ?? null)
    .filter((count) => typeof count === "number");
  const combatSkillFeedbackSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.combatSkillFeedbackEventCount ?? null)
    .filter((count) => typeof count === "number");
  const trackedEntitySamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.trackedEntityCount ?? null)
    .filter((count) => typeof count === "number");
  const visibleEntitySamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.visibleEntityCount ?? null)
    .filter((count) => typeof count === "number");
  const ashDrifterSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.hostileProfileCounts?.ashDrifter ?? null)
    .filter((count) => typeof count === "number");
  const sentinelHuskSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.hostileProfileCounts?.sentinelHusk ?? null)
    .filter((count) => typeof count === "number");
  const watchglassSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.hostileProfileCounts?.watchglass ?? null)
    .filter((count) => typeof count === "number");
  const watchglassPrimeSamples = samples
    .map((sample) => sample.runtimeMetrics?.runtimeState?.hostileProfileCounts?.watchglassPrime ?? null)
    .filter((count) => typeof count === "number");
  let stalledSampleCount = 0;
  let longestStallSamples = 0;
  let currentStallSamples = 0;

  for (let sampleIndex = 1; sampleIndex < samples.length; sampleIndex += 1) {
    const previousTick = samples[sampleIndex - 1]?.runtimeMetrics?.runtimeState?.tick;
    const currentTick = samples[sampleIndex]?.runtimeMetrics?.runtimeState?.tick;

    if (
      typeof previousTick === "number" &&
      typeof currentTick === "number" &&
      currentTick === previousTick
    ) {
      stalledSampleCount += 1;
      currentStallSamples += 1;
      longestStallSamples = Math.max(longestStallSamples, currentStallSamples);
      continue;
    }

    currentStallSamples = 0;
  }

  return {
    combatSkillFeedbackEventCount: {
      final: combatSkillFeedbackSamples.at(-1) ?? null,
      max: safeMax(combatSkillFeedbackSamples)
    },
    entityCount: {
      final: entityCountSamples.at(-1) ?? null,
      max: safeMax(entityCountSamples)
    },
    fps: {
      average:
        fpsSamples.length > 0
          ? Number((fpsSamples.reduce((total, value) => total + value, 0) / fpsSamples.length).toFixed(2))
          : null,
      min: fpsSamples.length > 0 ? Math.min(...fpsSamples) : null
    },
    floatingDamageNumberCount: {
      final: floatingDamageNumberSamples.at(-1) ?? null,
      max: safeMax(floatingDamageNumberSamples)
    },
    levelUpChoiceCount: {
      final: levelUpChoiceSamples.at(-1) ?? null,
      max: safeMax(levelUpChoiceSamples)
    },
    heapUsedBytes: {
      delta:
        heapSamples.length > 1
          ? heapSamples.at(-1) - heapSamples[0]
          : null,
      max: safeMax(heapSamples),
      min: heapSamples.length > 0 ? Math.min(...heapSamples) : null
    },
    hostileProfileCounts: {
      ashDrifterMax: safeMax(ashDrifterSamples),
      sentinelHuskMax: safeMax(sentinelHuskSamples),
      watchglassMax: safeMax(watchglassSamples),
      watchglassPrimeMax: safeMax(watchglassPrimeSamples)
    },
    pickupCount: {
      final: pickupCountSamples.at(-1) ?? null,
      max: safeMax(pickupCountSamples)
    },
    pickupKinds: {
      cacheMax: safeMax(cachePickupSamples),
      crystalEntityMax: safeMax(crystalPickupSamples),
      crystalStackMax: safeMax(crystalPickupStackSamples),
      goldEntityMax: safeMax(goldPickupSamples),
      goldStackMax: safeMax(goldPickupStackSamples),
      healingKitMax: safeMax(healingPickupSamples)
    },
    trackedEntityCount: {
      final: trackedEntitySamples.at(-1) ?? null,
      max: safeMax(trackedEntitySamples)
    },
    runtimeTick: {
      final: samples.at(-1)?.runtimeMetrics?.runtimeState?.tick ?? null,
      longestStallSamples,
      stalledSampleCount
    },
    visibleEntityCount: {
      final: visibleEntitySamples.at(-1) ?? null,
      max: safeMax(visibleEntitySamples)
    }
  };
};

const cliOptions = parseArgs(process.argv.slice(2));
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
    await waitForPreview(previewUrl);
  }

  await mkdir(outputDirectory, {
    recursive: true
  });

  browser = await chromium.launch({
    args: ["--enable-precise-memory-info"],
    headless: !cliOptions.headed
  });

  const mobileDeviceProfile = devices["Pixel 7"];
  const context = await browser.newContext(
    cliOptions.mobile
      ? {
          ...mobileDeviceProfile
        }
      : {
          viewport: {
            width: 1280,
            height: 800
          }
        }
  );
  const page = await context.newPage();

  await page.goto(previewUrl, {
    waitUntil: "networkidle"
  });
  const cdpSession = await page.context().newCDPSession(page);
  await page.waitForFunction(() => Boolean(globalThis.window.__EMBERWAKE_PROFILING__?.setConfig));

  const scenarioCatalog = await page.evaluate(
    () => globalThis.window.__EMBERWAKE_PROFILING__?.listScenarios?.() ?? []
  );
  const scenarioDefinition = scenarioCatalog.find(
    (scenario) => scenario.id === cliOptions.scenarioId
  );

  if (!scenarioDefinition) {
    throw new Error(`Unknown profiling scenario: ${cliOptions.scenarioId}`);
  }

  const effectiveConfig = {
    ...scenarioDefinition.recommendedConfig,
    ...(cliOptions.invincible === undefined
      ? {}
      : {
          playerInvincible: cliOptions.invincible
        }),
    ...(cliOptions.spawnMode === undefined
      ? {}
      : {
          spawnMode: cliOptions.spawnMode
        })
  };

  await page.evaluate((nextConfig) => {
    globalThis.window.__EMBERWAKE_PROFILING__?.setConfig?.(nextConfig);
  }, effectiveConfig);

  await page.getByLabel(/Main menu|Emberwake/i).waitFor({
    timeout: runtimePerformanceBudget.runtimeActivation.maxMenuInteractiveMs
  });
  await page.getByRole("button", {
    name: /Start new game/i
  }).click();
  await page.getByRole("button", {
    name: /^Begin$/i
  }).click();

  await page.locator('.app-shell[data-renderer-status="ready"]').waitFor({
    timeout: runtimePerformanceBudget.runtimeActivation.maxMenuInteractiveMs
  });
  await page.waitForFunction(
    () => Boolean(globalThis.window.__EMBERWAKE_PROFILING__?.startScenario),
    undefined,
    {
      timeout: runtimePerformanceBudget.runtimeActivation.maxMenuInteractiveMs
    }
  );

  const rendererMetrics = await page.evaluate(() => globalThis.window.__EMBERWAKE_RUNTIME_METRICS__);

  if (
    typeof rendererMetrics?.rendererReadyMs !== "number" ||
    rendererMetrics.rendererReadyMs > runtimePerformanceBudget.runtimeActivation.maxRendererReadyMs
  ) {
    throw new Error(
      `Renderer readiness exceeded budget. Actual: ${rendererMetrics?.rendererReadyMs ?? "missing"}ms, budget: ${runtimePerformanceBudget.runtimeActivation.maxRendererReadyMs}ms`
    );
  }

  const runTimestamp = new Date();
  const timestampLabel = formatTimestampLabel(runTimestamp);
  const baseArtifactName = `${cliOptions.scenarioId}-${timestampLabel}`;

  await page.evaluate(
    ({ loop, scenarioId, speedMultiplier }) =>
      globalThis.window.__EMBERWAKE_PROFILING__?.startScenario?.({
        loop,
        scenarioId,
        speedMultiplier
      }),
    {
      loop: cliOptions.loop ?? scenarioDefinition.defaultLoop,
      scenarioId: cliOptions.scenarioId,
      speedMultiplier: 4
    }
  );

  const startedAt = Date.now();
  const samples = [];
  const heapSnapshots = [];

  heapSnapshots.push(
    await captureHeapSnapshot({
      cdpSession,
      fileUrl: new URL(`${baseArtifactName}-heap-start.heapsnapshot`, outputDirectory),
      label: "start",
      page
    })
  );
  let midpointSnapshotCaptured = false;

  while (Date.now() - startedAt < cliOptions.durationMs) {
    const sample = await readProfilingSnapshot(page);

    samples.push(sample);

    if (
      sample.shellStatus?.activeScene === "runtime" &&
      sample.shellStatus?.isMenuOpen === false &&
      sample.simulationStatus?.levelUpVisible === true
    ) {
      await page.evaluate(() => globalThis.window.__EMBERWAKE_PROFILING__?.chooseBuildChoice?.(0));
      await page.waitForTimeout(100);
      continue;
    }

    if (!midpointSnapshotCaptured && Date.now() - startedAt >= cliOptions.durationMs / 2) {
      midpointSnapshotCaptured = true;
      const tickBeforeMidpointSnapshot = samples.at(-1)?.runtimeMetrics?.runtimeState?.tick ?? null;
      heapSnapshots.push(
        await captureHeapSnapshot({
          cdpSession,
          fileUrl: new URL(`${baseArtifactName}-heap-mid.heapsnapshot`, outputDirectory),
          label: "mid",
          page
        })
      );
      await recoverSimulationAfterSnapshot({
        page,
        previousTick: tickBeforeMidpointSnapshot
      });
    }

    await page.waitForTimeout(cliOptions.sampleIntervalMs);
  }

  samples.push(await readProfilingSnapshot(page));
  heapSnapshots.push(
    await captureHeapSnapshot({
      cdpSession,
      fileUrl: new URL(`${baseArtifactName}-heap-end.heapsnapshot`, outputDirectory),
      label: "end",
      page
    })
  );
  await page.evaluate(() => {
    globalThis.window.__EMBERWAKE_PROFILING__?.stopScenario?.();
    globalThis.window.__EMBERWAKE_PROFILING__?.resetConfig?.();
  });

  const timestamp = new Date();
  const summary = summarizeSamples(samples);
  const artifact = {
    durationMs: cliOptions.durationMs,
    endedAtIso: timestamp.toISOString(),
    heapSnapshots,
    runtimeSummary: summary,
    sampleCount: samples.length,
    sampleIntervalMs: cliOptions.sampleIntervalMs,
    scenario: {
      ...scenarioDefinition,
      appliedConfig: effectiveConfig,
      appliedSpeedMultiplier: 4,
      loop: cliOptions.loop ?? scenarioDefinition.defaultLoop,
      mobile: cliOptions.mobile
    },
    samples,
    startedAtIso: new Date(timestamp.getTime() - cliOptions.durationMs).toISOString()
  };

  await page.screenshot({
    path: new URL(`${baseArtifactName}.png`, outputDirectory).pathname
  });
  await writeFile(
    new URL(`${baseArtifactName}.json`, outputDirectory),
    JSON.stringify(artifact, null, 2)
  );
  await writeFile(
    new URL("latest.json", outputDirectory),
    JSON.stringify(artifact, null, 2)
  );
} finally {
  await browser?.close();

  if (previewServer && !previewServer.killed) {
    previewServer.kill("SIGTERM");
  }
}
