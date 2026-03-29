/* global URL, process */

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);

const categoryPromptFragments = {
  active:
    "Use a cold cyan energy accent, sharp combat geometry, and an aggressive player-skill posture.",
  fusion:
    "Use a magenta ember-violet fusion accent, heightened intensity, and a rarer evolved-tech posture.",
  passive:
    "Use a warm amber accent, steadier support-system posture, and cleaner utility-oriented symbolism."
};

const createPrompt = ({ category, label, motif }) =>
  [
    "Create a transparent-background square UI skill icon for a techno-shinobi survival game.",
    "The icon must already include a dark obsidian rounded-square plate with subtle techno grid details, a centered emblem, high contrast, crisp silhouette, and clean readable composition at very small HUD size.",
    categoryPromptFragments[category],
    `Subject: ${label}.`,
    `Motif: ${motif}.`,
    "Stylized, graphic, game-ready, medium detail, no text, no watermark, no extra frame, no environment, no character portrait, no photorealism."
  ].join(" ");

export const skillIconPlan = [
  { id: "ash-lash", category: "active", label: "Ash Lash", motif: "a sweeping ember lash arc with ribbon-like slash energy" },
  { id: "boomerang-arc", category: "active", label: "Boomerang Arc", motif: "a returning crescent blade with a forward and return lane arc" },
  { id: "burning-trail", category: "active", label: "Burning Trail", motif: "three staggered burning route markers forming a motion trail" },
  { id: "chain-lightning", category: "active", label: "Chain Lightning", motif: "forked lightning zigzags chaining across multiple linked targets" },
  { id: "guided-senbon", category: "active", label: "Guided Senbon", motif: "a precision needle projectile with a guided lock-on arrow cue" },
  { id: "halo-burst", category: "active", label: "Halo Burst", motif: "a radiant circular burst with cardinal flare marks" },
  { id: "frost-nova", category: "active", label: "Frost Nova", motif: "a crystalline frost nova cross with ice spokes and frozen bloom" },
  { id: "shade-kunai", category: "active", label: "Shade Kunai", motif: "a shadowy kunai fan burst with layered stealth blades" },
  { id: "cinder-arc", category: "active", label: "Cinder Arc", motif: "a lobbed cinder strike with a curved ember impact arc" },
  { id: "orbiting-blades", category: "active", label: "Orbiting Blades", motif: "paired orbiting blades circling a protected core" },
  { id: "orbit-sutra", category: "active", label: "Orbit Sutra", motif: "a scripture-like orbit ring with ceremonial techno arcs" },
  { id: "null-canister", category: "active", label: "Null Canister", motif: "a sealed hush canister marked by crossed null lines" },
  { id: "vacuum-pulse", category: "active", label: "Vacuum Pulse", motif: "an inward pull pulse with opposing vacuum currents converging on center" },
  { id: "boss-hunter", category: "passive", label: "Boss Hunter", motif: "a disciplined elite-slayer sigil with apex mark and hunt chevrons" },
  { id: "duplex-relay", category: "passive", label: "Duplex Relay", motif: "paired relay arrows and a duplicate-cast conduit core" },
  { id: "emergency-aegis", category: "passive", label: "Emergency Aegis", motif: "a last-chance guard shield with a vertical emergency core line" },
  { id: "echo-thread", category: "passive", label: "Echo Thread", motif: "layered echo strands weaving through repeated wave marks" },
  { id: "execution-sigil", category: "passive", label: "Execution Sigil", motif: "a square execution glyph with measured terminal bars" },
  { id: "greed-engine", category: "passive", label: "Greed Engine", motif: "a compact economy engine with gold flow conduit and pressure loop" },
  { id: "hardlight-sheath", category: "passive", label: "Hardlight Sheath", motif: "a hardlight blade sheath framing a focused impact wedge" },
  { id: "overclock-seal", category: "passive", label: "Overclock Seal", motif: "an overclock seal with fast pulse ticks and a central tuned core" },
  { id: "thorn-mail", category: "passive", label: "Thorn Mail", motif: "a retaliatory thorned armor sigil with defensive triangular body" },
  { id: "vacuum-tabi", category: "passive", label: "Vacuum Tabi", motif: "a mobility tabi emblem with pickup flow arc and lifted foot cue" },
  { id: "wideband-coil", category: "passive", label: "Wideband Coil", motif: "stacked widening coils projecting broader control bands" },
  { id: "afterimage-pyre", category: "fusion", label: "Afterimage Pyre", motif: "an evolved cinder arc leaving afterimage pyre echoes and heat folds" },
  { id: "blackfile-volley", category: "fusion", label: "Blackfile Volley", motif: "a dense blackfile blade volley with piercing multi-blade spread" },
  { id: "choir-of-pins", category: "fusion", label: "Choir of Pins", motif: "a guided pin chorus of three synchronized radiant needles" },
  { id: "event-horizon", category: "fusion", label: "Event Horizon", motif: "a collapsed gravity hush ring pulling inward toward a black core" },
  { id: "redline-ribbon", category: "fusion", label: "Redline Ribbon", motif: "fast chained lash ribbons streaking in parallel redline slashes" },
  { id: "temple-circuit", category: "fusion", label: "Temple Circuit", motif: "a ritual orbit circuit blending shrine geometry with control loops" }
].map((entry) => ({
  ...entry,
  assetId: `shell.skill.${entry.id}.runtime`,
  finalPath: `src/assets/shell/runtime/shell.skill.${entry.id}.runtime.webp`,
  prompt: createPrompt(entry),
  size: "1024x1024"
}));

export const skillIconGenerationRoot = resolve(repoRoot, "output/imagegen/skill-icons");
export const skillIconCandidatesRoot = resolve(skillIconGenerationRoot, "candidates");
export const skillIconSelectionFilePath = resolve(skillIconGenerationRoot, "selection.json");
export const skillIconGalleryFilePath = resolve(skillIconGenerationRoot, "gallery.html");
export const skillIconPromptBatchFilePath = resolve(repoRoot, "tmp/imagegen/skill-icons-prompts.jsonl");
export const imageGenCliPath = resolve(
  process.env.HOME ?? "~",
  ".codex/skills/.system/imagegen/scripts/image_gen.py"
);

const dotenvLinePattern = /^([A-Z0-9_]+)=(.*)$/;

export const ensureDirectory = (path) => {
  mkdirSync(path, { recursive: true });
};

export const loadLocalEnv = () => {
  for (const fileName of [".env.local", ".env.production"]) {
    const filePath = resolve(repoRoot, fileName);

    try {
      const contents = readFileSync(filePath, "utf8");

      for (const rawLine of contents.split(/\r?\n/u)) {
        const line = rawLine.trim();

        if (!line || line.startsWith("#")) {
          continue;
        }

        const match = dotenvLinePattern.exec(line);

        if (!match) {
          continue;
        }

        const [, key, value] = match;

        if (!(key in process.env)) {
          process.env[key] = value.replace(/^['"]|['"]$/gu, "");
        }
      }
    } catch {
      // Optional env files.
    }
  }
};

export const toCandidateRelativePath = (assetId, variantIndex = 1) =>
  `candidates/${assetId}/variant-${String(variantIndex).padStart(2, "0")}.png`;

export const toCandidateAbsolutePath = (assetId, variantIndex = 1) =>
  resolve(skillIconGenerationRoot, toCandidateRelativePath(assetId, variantIndex));

export const writePromptBatchFile = ({ iconIds = null, variantIndex = 1 } = {}) => {
  ensureDirectory(dirname(skillIconPromptBatchFilePath));
  const selectedIcons = skillIconPlan.filter(
    (entry) => !iconIds || iconIds.includes(entry.id) || iconIds.includes(entry.assetId)
  );
  const lines = selectedIcons.map((entry) =>
    JSON.stringify({
      prompt: entry.prompt,
      size: entry.size,
      background: "transparent",
      output_format: "png",
      out: toCandidateRelativePath(entry.assetId, variantIndex)
    })
  );

  writeFileSync(skillIconPromptBatchFilePath, `${lines.join("\n")}\n`, "utf8");
  return selectedIcons;
};

export const loadSelectionMap = () => {
  try {
    return JSON.parse(readFileSync(skillIconSelectionFilePath, "utf8"));
  } catch {
    return Object.fromEntries(
      skillIconPlan.map((entry) => [entry.assetId, toCandidateRelativePath(entry.assetId, 1)])
    );
  }
};

export const writeSelectionMap = (selectionMap) => {
  ensureDirectory(dirname(skillIconSelectionFilePath));
  writeFileSync(skillIconSelectionFilePath, `${JSON.stringify(selectionMap, null, 2)}\n`, "utf8");
};

export const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const statExists = (path) => {
  try {
    return statSync(path);
  } catch {
    return null;
  }
};

export const listCandidateFiles = () => {
  const files = [];

  const walk = (directoryPath) => {
    for (const entry of readdirSync(directoryPath)) {
      const entryPath = join(directoryPath, entry);
      const entryStats = statSync(entryPath);

      if (entryStats.isDirectory()) {
        walk(entryPath);
        continue;
      }

      files.push(entryPath);
    }
  };

  if (statExists(skillIconCandidatesRoot)) {
    walk(skillIconCandidatesRoot);
  }

  return files.sort();
};

export const toRelativeFromRepo = (absolutePath) => absolutePath.replace(`${repoRoot}/`, "");
export const getStem = (filePath) => basename(filePath).replace(/\.[^.]+$/u, "");
