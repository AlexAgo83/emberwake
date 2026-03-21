type ReleaseChangelogEntry = {
  content: string;
  slug: string;
  version: string;
};

const rawChangelogModules = import.meta.glob("../../../changelogs/CHANGELOGS_*.md", {
  eager: true,
  import: "default",
  query: "?raw"
}) as Record<string, string>;

const parseVersionTuple = (version: string) => version.split(".").map((segment) => Number(segment) || 0);

const compareVersionsDescending = (left: string, right: string) => {
  const leftTuple = parseVersionTuple(left);
  const rightTuple = parseVersionTuple(right);
  const segmentCount = Math.max(leftTuple.length, rightTuple.length);

  for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
    const delta = (rightTuple[segmentIndex] ?? 0) - (leftTuple[segmentIndex] ?? 0);

    if (delta !== 0) {
      return delta;
    }
  }

  return 0;
};

export const releaseChangelogEntries: ReleaseChangelogEntry[] = Object.entries(rawChangelogModules)
  .map(([modulePath, content]) => {
    const slug = modulePath.split("/").at(-1)?.replace(".md", "") ?? "CHANGELOGS_0_0_0";
    const version = slug.replace("CHANGELOGS_", "").split("_").join(".");

    return {
      content: content.trim(),
      slug,
      version
    };
  })
  .sort((left, right) => compareVersionsDescending(left.version, right.version));
