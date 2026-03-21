import { readdir, stat } from "node:fs/promises";
import process from "node:process";
import { fileURLToPath } from "node:url";

import runtimePerformanceBudget from "../../src/shared/config/runtimePerformanceBudget.json" with { type: "json" };

const projectRoot = fileURLToPath(new globalThis.URL("../../", import.meta.url));
const distAssetsDirectory = new globalThis.URL("../../dist/assets/", import.meta.url);

const readAssetFiles = async () => {
  const assetEntries = await readdir(distAssetsDirectory);

  const readSize = async (fileName) => {
    const fileStats = await stat(new globalThis.URL(fileName, distAssetsDirectory));

    return {
      bytes: fileStats.size,
      fileName
    };
  };

  return Promise.all(assetEntries.map(readSize));
};

const sumBytes = (files) => files.reduce((total, file) => total + file.bytes, 0);

const formatKb = (bytes) => (bytes / 1024).toFixed(2);

const matchSingle = (files, pattern, label) => {
  const matchedFile = files.find(({ fileName }) => pattern.test(fileName));

  if (!matchedFile) {
    throw new Error(`Could not locate ${label} in dist/assets.`);
  }

  return matchedFile;
};

const assetFiles = await readAssetFiles();

const initialShellJsFiles = [
  matchSingle(assetFiles, /^index-.*\.js$/, "initial shell entry chunk"),
  matchSingle(assetFiles, /^vendor-react-.*\.js$/, "React vendor chunk"),
  matchSingle(assetFiles, /^vendor-runtime-.*\.js$/, "runtime vendor chunk")
];
const initialShellCssFiles = [
  matchSingle(assetFiles, /^index-.*\.css$/, "initial shell CSS chunk")
];
const lazyRuntimeJsFiles = [
  matchSingle(assetFiles, /^RuntimeSurface-.*\.js$/, "lazy runtime surface chunk"),
  matchSingle(assetFiles, /^vendor-pixi-.*\.js$/, "lazy Pixi vendor chunk")
];

const initialShellJsBytes = sumBytes(initialShellJsFiles);
const initialShellCssBytes = sumBytes(initialShellCssFiles);
const initialRequestCount = initialShellJsFiles.length + initialShellCssFiles.length;
const lazyRuntimeJsBytes = sumBytes(lazyRuntimeJsFiles);

const assertions = [
  {
    actual: initialShellJsBytes,
    budget: runtimePerformanceBudget.shellStartup.maxInitialJsKb * 1024,
    label: "initial shell JS"
  },
  {
    actual: initialShellCssBytes,
    budget: runtimePerformanceBudget.shellStartup.maxInitialCssKb * 1024,
    label: "initial shell CSS"
  },
  {
    actual: initialRequestCount,
    budget: runtimePerformanceBudget.shellStartup.maxInitialRequestCount,
    label: "initial shell request count"
  },
  {
    actual: lazyRuntimeJsBytes,
    budget: runtimePerformanceBudget.runtimeActivation.maxLazyRuntimeJsKb * 1024,
    label: "lazy runtime JS"
  }
];

const failures = assertions.filter(({ actual, budget }) => actual > budget);

const metrics = {
  budgets: runtimePerformanceBudget,
  initialShell: {
    cssKb: Number(formatKb(initialShellCssBytes)),
    files: initialShellCssFiles.map(({ bytes, fileName }) => ({
      fileName,
      kb: Number(formatKb(bytes))
    })),
    jsKb: Number(formatKb(initialShellJsBytes)),
    requestCount: initialRequestCount
  },
  lazyRuntime: {
    files: lazyRuntimeJsFiles.map(({ bytes, fileName }) => ({
      fileName,
      kb: Number(formatKb(bytes))
    })),
    jsKb: Number(formatKb(lazyRuntimeJsBytes))
  },
  projectRoot
};

process.stdout.write(`${JSON.stringify(metrics, null, 2)}\n`);

if (failures.length > 0) {
  const failureMessage = failures
    .map(
      ({ actual, budget, label }) =>
        `${label} exceeded budget: actual ${actual}, budget ${budget}`
    )
    .join("\n");

  throw new Error(`Runtime performance budget validation failed.\n${failureMessage}`);
}
