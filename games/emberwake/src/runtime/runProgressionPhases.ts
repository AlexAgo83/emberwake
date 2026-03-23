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
    hostileContactDamageMultiplier: 1,
    hostileMaxHealthMultiplier: 1,
    id: "ember-watch",
    label: "Ember Watch",
    localPopulationCapBonus: 0,
    shellLine: "Baseline pressure. Read the field and establish the first rhythm.",
    spawnCooldownMultiplier: 1,
    startsAtTick: 0,
    tone: "cold"
  },
  {
    hostileContactDamageMultiplier: 1.1,
    hostileMaxHealthMultiplier: 1.15,
    id: "veil-break",
    label: "Veil Break",
    localPopulationCapBonus: 1,
    shellLine: "The veil breaks and the field starts pressing harder.",
    spawnCooldownMultiplier: 0.85,
    startsAtTick: secondsToTicks(45),
    tone: "warm"
  },
  {
    hostileContactDamageMultiplier: 1.22,
    hostileMaxHealthMultiplier: 1.32,
    id: "black-rain",
    label: "Black Rain",
    localPopulationCapBonus: 2,
    shellLine: "Sustained pressure and denser hostile claims tighten the map.",
    spawnCooldownMultiplier: 0.72,
    startsAtTick: secondsToTicks(90),
    tone: "warm"
  },
  {
    hostileContactDamageMultiplier: 1.35,
    hostileMaxHealthMultiplier: 1.55,
    id: "kill-grid",
    label: "Kill Grid",
    localPopulationCapBonus: 3,
    shellLine: "The run enters a hard final press where every lapse compounds.",
    spawnCooldownMultiplier: 0.58,
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
