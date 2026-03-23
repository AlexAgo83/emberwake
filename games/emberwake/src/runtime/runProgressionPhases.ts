export type RunProgressionPhaseId =
  | "ember-watch"
  | "veil-break"
  | "black-rain"
  | "kill-grid";

export type RunProgressionPhase = {
  hostileContactDamageMultiplier: number;
  hostileMaxHealthMultiplier: number;
  id: RunProgressionPhaseId;
  label: string;
  localPopulationCapBonus: number;
  shellLine: string;
  spawnCooldownMultiplier: number;
  startsAtTick: number;
  tone: "alert" | "cold" | "warm";
};

const secondsToTicks = (seconds: number) => Math.round(seconds * 60);

export const runProgressionPhases: readonly RunProgressionPhase[] = [
  {
    hostileContactDamageMultiplier: 0.9,
    hostileMaxHealthMultiplier: 0.94,
    id: "ember-watch",
    label: "Ember Watch",
    localPopulationCapBonus: -4,
    shellLine: "The field opens with a lighter perimeter so the first build pieces can breathe.",
    spawnCooldownMultiplier: 1.4,
    startsAtTick: 0,
    tone: "cold"
  },
  {
    hostileContactDamageMultiplier: 1.02,
    hostileMaxHealthMultiplier: 1.08,
    id: "veil-break",
    label: "Veil Break",
    localPopulationCapBonus: 0,
    shellLine: "The veil closes and the run enters its first credible press.",
    spawnCooldownMultiplier: 1.02,
    startsAtTick: secondsToTicks(45),
    tone: "warm"
  },
  {
    hostileContactDamageMultiplier: 1.16,
    hostileMaxHealthMultiplier: 1.24,
    id: "black-rain",
    label: "Black Rain",
    localPopulationCapBonus: 6,
    shellLine: "Population opens wider and heavier forms start owning more of the field.",
    spawnCooldownMultiplier: 0.72,
    startsAtTick: secondsToTicks(90),
    tone: "warm"
  },
  {
    hostileContactDamageMultiplier: 1.32,
    hostileMaxHealthMultiplier: 1.46,
    id: "kill-grid",
    label: "Kill Grid",
    localPopulationCapBonus: 12,
    shellLine: "The grid unlocks full late-run density and keeps elite pressure on the player.",
    spawnCooldownMultiplier: 0.44,
    startsAtTick: secondsToTicks(135),
    tone: "alert"
  }
];

export const initialRunProgressionPhaseId = runProgressionPhases[0].id;

export const resolveRunProgressionPhase = (runtimeTicksSurvived: number) => {
  let resolvedPhase = runProgressionPhases[0];

  for (const phase of runProgressionPhases) {
    if (runtimeTicksSurvived >= phase.startsAtTick) {
      resolvedPhase = phase;
    }
  }

  return resolvedPhase;
};

export const resolveNextRunProgressionPhase = (runtimeTicksSurvived: number) => {
  const currentPhase = resolveRunProgressionPhase(runtimeTicksSurvived);

  return (
    runProgressionPhases.find((phase) => phase.startsAtTick > currentPhase.startsAtTick) ?? null
  );
};
