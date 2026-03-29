import { assetPipeline } from "@src/shared/config/assetPipeline";
import { assetCatalog, getAssetCatalogEntry, isAssetId, type AssetId } from "./assetCatalog";

const runtimeAssetModules = import.meta.glob(
  [
    "./entities/runtime/*.{png,svg,webp}",
    "./entities/placeholders/*.{png,svg,webp}",
    "./map/runtime/*.{png,svg,webp}",
    "./map/placeholders/*.{png,svg,webp}",
    "./overlays/runtime/*.{png,svg,webp}",
    "./overlays/placeholders/*.{png,svg,webp}",
    "./shell/runtime/*.{png,svg,webp}",
    "./shell/placeholders/*.{png,svg,webp}"
  ],
  {
    eager: true,
    import: "default"
  }
) as Record<string, string>;

const assetUrlRegistry = new Map<string, string>();

for (const [modulePath, assetUrl] of Object.entries(runtimeAssetModules)) {
  const fileName = modulePath.split("/").at(-1);

  if (!fileName) {
    continue;
  }

  const extensionSeparatorIndex = fileName.lastIndexOf(".");

  if (extensionSeparatorIndex <= 0) {
    continue;
  }

  const assetStem = fileName.slice(0, extensionSeparatorIndex);
  assetUrlRegistry.set(assetStem, assetUrl);
}

const lifecycleDelimiter = `${assetPipeline.naming.delimiter}`;

const replaceAssetLifecycle = (
  assetId: string,
  nextLifecycle: "placeholder" | "runtime"
) => {
  const segments = assetId.split(lifecycleDelimiter);
  const lastSegment = segments.at(-1);

  if (!lastSegment || (lastSegment !== "placeholder" && lastSegment !== "runtime")) {
    return null;
  }

  return [...segments.slice(0, -1), nextLifecycle].join(lifecycleDelimiter);
};

export const derivePlaceholderAssetId = (assetId: string) =>
  replaceAssetLifecycle(assetId, "placeholder");

export const resolveAssetCandidateIds = (assetId: string) => {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const pushCandidate = (candidate: string | null) => {
    if (!candidate || seen.has(candidate)) {
      return;
    }

    seen.add(candidate);
    candidates.push(candidate);
  };

  pushCandidate(assetId);

  if (isAssetId(assetId)) {
    const assetEntry = getAssetCatalogEntry(assetId as AssetId);
    const fallbackAssetId =
      "fallbackAssetId" in assetEntry ? assetEntry.fallbackAssetId : undefined;
    pushCandidate(fallbackAssetId ?? null);
  }

  pushCandidate(derivePlaceholderAssetId(assetId));

  return candidates;
};

export const resolveAssetUrl = (assetId: string) => {
  for (const candidate of resolveAssetCandidateIds(assetId)) {
    const resolvedUrl = assetUrlRegistry.get(candidate);

    if (resolvedUrl) {
      return resolvedUrl;
    }
  }

  return null;
};

export const listRegisteredAssetIds = () => Array.from(assetUrlRegistry.keys()).sort();

export const listKnownAssetIds = () =>
  [
    ...Object.keys(assetCatalog.entities),
    ...Object.keys(assetCatalog.map),
    ...Object.keys(assetCatalog.overlays),
    ...Object.keys(assetCatalog.shell)
  ].sort();
