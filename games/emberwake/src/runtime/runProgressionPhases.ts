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
    hostileContactDamageMultiplier: 0.92,
    hostileMaxHealthMultiplier: 1.08,
    id: "ember-watch",
    label: "Ember Watch",
    localPopulationCapBonus: -4,
    shellLine: "The field opens with a lighter perimeter so the first build pieces can breathe.",
    spawnCooldownMultiplier: 1.32,
    startsAtTick: 0,
    tone: "cold"
  },
  {
    hostileContactDamageMultiplier: 1.12,
    hostileMaxHealthMultiplier: 1.62,
    id: "veil-break",
    label: "Veil Break",
    localPopulationCapBonus: 2,
    shellLine: "The veil closes and the run enters its first credible press.",
    spawnCooldownMultiplier: 0.9,
    startsAtTick: secondsToTicks(35),
    tone: "warm"
  },
  {
    hostileContactDamageMultiplier: 1.3,
    hostileMaxHealthMultiplier: 2.28,
    id: "black-rain",
    label: "Black Rain",
    localPopulationCapBonus: 8,
    shellLine: "Population opens wider and heavier forms start owning more of the field.",
    spawnCooldownMultiplier: 0.58,
    startsAtTick: secondsToTicks(75),
    tone: "warm"
  },
  {
    hostileContactDamageMultiplier: 1.52,
    hostileMaxHealthMultiplier: 3.05,
    id: "kill-grid",
    label: "Kill Grid",
    localPopulationCapBonus: 15,
    shellLine: "The grid unlocks full late-run density and keeps elite pressure on the player.",
    spawnCooldownMultiplier: 0.34,
    startsAtTick: secondsToTicks(110),
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
