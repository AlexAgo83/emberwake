import type { EntityVisualKind } from "./entityData";

export type CreatureCodexId =
  | "ash-drifter"
  | "needle-wisp"
  | "sentinel-husk"
  | "shock-ram"
  | "watchglass";

export type CreatureCodexEntry = {
  codexId: CreatureCodexId;
  label: string;
  roleLine: string;
  shellLine: string;
  visualKind: EntityVisualKind;
};

export const creatureCodexEntries = [
  {
    codexId: "sentinel-husk",
    label: "Sentinel Husk",
    roleLine: "Frontline pursuit frame",
    shellLine: "The standard husk that presses the player line and defines first-wave pressure.",
    visualKind: "debug-sentinel"
  },
  {
    codexId: "watchglass",
    label: "Watchglass",
    roleLine: "Survey drone shell",
    shellLine: "A higher-order watcher silhouette reserved for later pressure and archive expansion.",
    visualKind: "debug-watcher"
  },
  {
    codexId: "shock-ram",
    label: "Shock Ram",
    roleLine: "Telegraphed charge brute",
    shellLine: "A ram shell that brakes, shivers, then commits to a straight-line burst.",
    visualKind: "debug-rammer"
  },
  {
    codexId: "ash-drifter",
    label: "Ash Drifter",
    roleLine: "Loose drift-line scavenger",
    shellLine: "A lighter drifter body used as a hidden codex stub until it fully enters the run.",
    visualKind: "debug-drifter"
  },
  {
    codexId: "needle-wisp",
    label: "Needle Wisp",
    roleLine: "Fast skirmish shard",
    shellLine: "A reduced silhouette built to slip through pressure gaps and collapse distance quickly.",
    visualKind: "debug-needle"
  }
] as const satisfies readonly CreatureCodexEntry[];

export const creatureCodexIds = creatureCodexEntries.map((entry) => entry.codexId);

export const getCreatureCodexEntry = (creatureCodexId: CreatureCodexId) =>
  creatureCodexEntries.find((entry) => entry.codexId === creatureCodexId) ?? null;

export const resolveCreatureCodexIdFromVisualKind = (
  visualKind: EntityVisualKind
): CreatureCodexId | null =>
  creatureCodexEntries.find((entry) => entry.visualKind === visualKind)?.codexId ?? null;
