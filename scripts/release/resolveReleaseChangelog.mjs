import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");
const packageJsonPath = path.join(projectRoot, "package.json");

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

if (!version || typeof version !== "string") {
  process.stderr.write("Missing semantic version in package.json\n");
  process.exit(1);
}

const releaseChangelogPath = path.join(
  projectRoot,
  "changelogs",
  `CHANGELOGS_${version.replaceAll(".", "_")}.md`
);

process.stdout.write(`${releaseChangelogPath}\n`);
