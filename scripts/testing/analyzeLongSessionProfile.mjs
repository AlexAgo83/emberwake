import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

const rootDir = fileURLToPath(new URL("../../", import.meta.url));
const defaultArtifactPath = path.join(rootDir, "output/playwright/long-session/latest.json");
const defaultLimit = 20;

const parseArgs = (argv) => {
  const parsedArgs = {
    artifactPath: defaultArtifactPath,
    compareArtifactPath: null,
    limit: defaultLimit,
    outputPath: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const nextArgument = argv[index + 1];

    if ((argument === "--artifact" || argument === "-a") && nextArgument) {
      parsedArgs.artifactPath = path.resolve(rootDir, nextArgument);
      index += 1;
      continue;
    }

    if ((argument === "--compare" || argument === "-c") && nextArgument) {
      parsedArgs.compareArtifactPath = path.resolve(rootDir, nextArgument);
      index += 1;
      continue;
    }

    if ((argument === "--limit" || argument === "-n") && nextArgument) {
      parsedArgs.limit = Number.parseInt(nextArgument, 10);
      index += 1;
      continue;
    }

    if ((argument === "--output" || argument === "-o") && nextArgument) {
      parsedArgs.outputPath = path.resolve(rootDir, nextArgument);
      index += 1;
    }
  }

  if (!Number.isFinite(parsedArgs.limit) || parsedArgs.limit <= 0) {
    throw new Error(`Invalid --limit value: ${parsedArgs.limit}`);
  }

  return parsedArgs;
};

const readJson = async (filePath) => JSON.parse(await readFile(filePath, "utf8"));

const toAbsolutePath = (candidatePath, relativeToFile) =>
  path.isAbsolute(candidatePath)
    ? candidatePath
    : path.resolve(path.dirname(relativeToFile), candidatePath);

const classifyConstructorFamily = (constructorKey) => {
  if (
    constructorKey.startsWith("object:Object") ||
    constructorKey.startsWith("object:Array") ||
    constructorKey.startsWith("array:")
  ) {
    return "plain-js-data";
  }

  if (constructorKey.startsWith("number:")) {
    return "numbers";
  }

  if (
    constructorKey.startsWith("object:") ||
    constructorKey.startsWith("closure:") ||
    constructorKey.startsWith("concatenated string:")
  ) {
    return "runtime-objects";
  }

  if (
    constructorKey.startsWith("code:") ||
    constructorKey.startsWith("hidden:") ||
    constructorKey.startsWith("native:")
  ) {
    return "engine-internals";
  }

  return "other";
};

const summarizeHeapSnapshot = async (heapSnapshotPath) => {
  const snapshot = await readJson(heapSnapshotPath);
  const nodeFields = snapshot.snapshot.meta.node_fields;
  const nodeTypes = snapshot.snapshot.meta.node_types[0];
  const nodeFieldCount = nodeFields.length;
  const typeIndex = nodeFields.indexOf("type");
  const nameIndex = nodeFields.indexOf("name");
  const selfSizeIndex = nodeFields.indexOf("self_size");
  const countsByConstructor = new Map();
  const totalsByFamily = new Map();

  for (let index = 0; index < snapshot.nodes.length; index += nodeFieldCount) {
    const constructorType = nodeTypes[snapshot.nodes[index + typeIndex]];
    const constructorName = snapshot.strings[snapshot.nodes[index + nameIndex]];
    const selfSize = snapshot.nodes[index + selfSizeIndex];
    const constructorKey = `${constructorType}:${constructorName}`;
    const constructorEntry = countsByConstructor.get(constructorKey) ?? { count: 0, selfSize: 0 };
    const family = classifyConstructorFamily(constructorKey);
    const familyEntry = totalsByFamily.get(family) ?? { count: 0, selfSize: 0 };

    constructorEntry.count += 1;
    constructorEntry.selfSize += selfSize;
    familyEntry.count += 1;
    familyEntry.selfSize += selfSize;

    countsByConstructor.set(constructorKey, constructorEntry);
    totalsByFamily.set(family, familyEntry);
  }

  return {
    constructorTotals: countsByConstructor,
    families: Object.fromEntries(
      [...totalsByFamily.entries()].map(([family, value]) => [
        family,
        {
          count: value.count,
          selfSize: value.selfSize
        }
      ])
    ),
    topConstructors: [...countsByConstructor.entries()]
      .sort((leftEntry, rightEntry) => rightEntry[1].selfSize - leftEntry[1].selfSize)
      .slice(0, defaultLimit)
      .map(([constructorKey, value]) => ({
        constructorKey,
        count: value.count,
        family: classifyConstructorFamily(constructorKey),
        selfSize: value.selfSize
      }))
  };
};

const compareConstructorTotals = (startTotals, endTotals, limit) => {
  const constructorKeys = new Set([...startTotals.keys(), ...endTotals.keys()]);

  return [...constructorKeys]
    .map((constructorKey) => {
      const startEntry = startTotals.get(constructorKey) ?? { count: 0, selfSize: 0 };
      const endEntry = endTotals.get(constructorKey) ?? { count: 0, selfSize: 0 };

      return {
        constructorKey,
        countDelta: endEntry.count - startEntry.count,
        family: classifyConstructorFamily(constructorKey),
        selfSizeDelta: endEntry.selfSize - startEntry.selfSize,
        endSelfSize: endEntry.selfSize,
        startSelfSize: startEntry.selfSize
      };
    })
    .filter((entry) => entry.selfSizeDelta > 0)
    .sort((leftEntry, rightEntry) => rightEntry.selfSizeDelta - leftEntry.selfSizeDelta)
    .slice(0, limit);
};

const buildArtifactSummary = async (artifactPath, limit) => {
  const artifact = await readJson(artifactPath);
  const heapSnapshots = artifact.heapSnapshots ?? [];
  const heapSnapshotSummaries = [];

  for (const heapSnapshot of heapSnapshots) {
    const heapSnapshotPath = toAbsolutePath(heapSnapshot.path, artifactPath);
    const heapSnapshotSummary = await summarizeHeapSnapshot(heapSnapshotPath);

    heapSnapshotSummaries.push({
      ...heapSnapshot,
      path: heapSnapshotPath,
      summary: {
        families: heapSnapshotSummary.families,
        topConstructors: heapSnapshotSummary.topConstructors.slice(0, limit)
      },
      totals: heapSnapshotSummary.constructorTotals
    });
  }

  const startSnapshot = heapSnapshotSummaries.find((heapSnapshot) => heapSnapshot.label === "start");
  const endSnapshot = heapSnapshotSummaries.find((heapSnapshot) => heapSnapshot.label === "end");
  const constructorGrowth =
    startSnapshot && endSnapshot
      ? compareConstructorTotals(startSnapshot.totals, endSnapshot.totals, limit)
      : [];
  const runtimeSummary = artifact.runtimeSummary ?? null;

  return {
    artifactPath,
    durationMs: artifact.durationMs,
    endedAtIso: artifact.endedAtIso,
    heapGrowthByConstructor: constructorGrowth,
    sampleCount: artifact.sampleCount ?? artifact.samples?.length ?? 0,
    scenario: artifact.scenario ?? null,
    startedAtIso: artifact.startedAtIso,
    runtimeSummary,
    heapSnapshots: heapSnapshotSummaries.map((heapSnapshot) => ({
      label: heapSnapshot.label,
      path: heapSnapshot.path,
      summary: heapSnapshot.summary
    })),
    ownershipHypotheses: constructorGrowth.slice(0, Math.min(8, limit)).map((entry) => ({
      constructorKey: entry.constructorKey,
      family: entry.family,
      hypothesis:
        entry.family === "plain-js-data"
          ? "Likely repeated view-model, array, or plain-object reshaping on the JS hot path."
          : entry.family === "runtime-objects"
            ? "Likely runtime-owned objects retained across repeated simulation or overlay presentation updates."
            : entry.family === "engine-internals"
              ? "Likely browser, bundle, or runtime-engine internals; verify before widening application changes."
              : "Needs manual ownership review."
    }))
  };
};

const buildComparison = (baselineSummary, candidateSummary, limit) => {
  const baselineHeapDelta = baselineSummary.runtimeSummary?.heapUsedBytes?.delta ?? null;
  const candidateHeapDelta = candidateSummary.runtimeSummary?.heapUsedBytes?.delta ?? null;
  const baselineStalls = baselineSummary.runtimeSummary?.runtimeTick?.stalledSampleCount ?? null;
  const candidateStalls = candidateSummary.runtimeSummary?.runtimeTick?.stalledSampleCount ?? null;
  const baselineConstructors = new Map(
    baselineSummary.heapGrowthByConstructor.map((entry) => [entry.constructorKey, entry])
  );
  const candidateConstructors = new Map(
    candidateSummary.heapGrowthByConstructor.map((entry) => [entry.constructorKey, entry])
  );
  const constructorKeys = new Set([...baselineConstructors.keys(), ...candidateConstructors.keys()]);

  const constructorDelta = [...constructorKeys]
    .map((constructorKey) => {
      const baselineEntry = baselineConstructors.get(constructorKey) ?? {
        selfSizeDelta: 0
      };
      const candidateEntry = candidateConstructors.get(constructorKey) ?? {
        selfSizeDelta: 0
      };

      return {
        constructorKey,
        family: classifyConstructorFamily(constructorKey),
        selfSizeDeltaChange: candidateEntry.selfSizeDelta - baselineEntry.selfSizeDelta,
        baselineSelfSizeDelta: baselineEntry.selfSizeDelta,
        candidateSelfSizeDelta: candidateEntry.selfSizeDelta
      };
    })
    .sort((leftEntry, rightEntry) => rightEntry.selfSizeDeltaChange - leftEntry.selfSizeDeltaChange)
    .slice(0, limit);

  return {
    baselineArtifactPath: baselineSummary.artifactPath,
    candidateArtifactPath: candidateSummary.artifactPath,
    heapDeltaBytes: {
      baseline: baselineHeapDelta,
      candidate: candidateHeapDelta,
      change:
        typeof baselineHeapDelta === "number" && typeof candidateHeapDelta === "number"
          ? candidateHeapDelta - baselineHeapDelta
          : null
    },
    stalledSamples: {
      baseline: baselineStalls,
      candidate: candidateStalls,
      change:
        typeof baselineStalls === "number" && typeof candidateStalls === "number"
          ? candidateStalls - baselineStalls
          : null
    },
    constructorDelta
  };
};

const main = async () => {
  const cliOptions = parseArgs(process.argv.slice(2));
  const artifactSummary = await buildArtifactSummary(cliOptions.artifactPath, cliOptions.limit);
  const comparison = cliOptions.compareArtifactPath
    ? buildComparison(
        await buildArtifactSummary(cliOptions.compareArtifactPath, cliOptions.limit),
        artifactSummary,
        cliOptions.limit
      )
    : null;
  const report = {
    artifact: artifactSummary,
    comparison
  };

  const output = JSON.stringify(report, null, 2);

  if (cliOptions.outputPath) {
    await writeFile(cliOptions.outputPath, output);
  }

  process.stdout.write(`${output}\n`);
};

await main();
