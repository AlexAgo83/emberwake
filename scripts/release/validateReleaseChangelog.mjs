import { existsSync, readFileSync } from "node:fs";
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

const expectedFilename = `CHANGELOGS_${version.replaceAll(".", "_")}.md`;
const changelogPath = path.join(projectRoot, "changelogs", expectedFilename);

if (!existsSync(changelogPath)) {
  process.stderr.write(`Missing release changelog: ${changelogPath}\n`);
  process.exit(1);
}

const changelogContents = readFileSync(changelogPath, "utf8").trim();

if (changelogContents.length === 0) {
  process.stderr.write(`Release changelog is empty: ${changelogPath}\n`);
  process.exit(1);
}

const expectedHeading = `# Emberwake ${version}`;

if (!changelogContents.startsWith(expectedHeading)) {
  process.stderr.write(
    `Release changelog must start with "${expectedHeading}" to match package.json version\n`
  );
  process.exit(1);
}

process.stdout.write(`Validated release changelog: ${changelogPath}\n`);
