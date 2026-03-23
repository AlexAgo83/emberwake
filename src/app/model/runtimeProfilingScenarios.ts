import type { RuntimeProfilingConfigDraft } from "./runtimeProfilingConfig";

export type RuntimeProfilingScenarioId =
  | "eastbound-drift"
  | "figure-eight"
  | "left-right-pendulum"
  | "square-loop"
  | "traversal-baseline";

export type RuntimeProfilingScenarioStep = {
  durationTicks: number;
  label: string;
  magnitude?: number;
  vector: {
    x: number;
    y: number;
  };
};

export type RuntimeProfilingScenario = {
  autoSelectBuildChoices?: boolean;
  defaultLoop: boolean;
  description: string;
  id: RuntimeProfilingScenarioId;
  recommendedConfig: RuntimeProfilingConfigDraft;
  speedMultiplier?: 0.5 | 1 | 2;
  steps: readonly RuntimeProfilingScenarioStep[];
};

export const runtimeProfilingScenarioCatalog: Record<
  RuntimeProfilingScenarioId,
  RuntimeProfilingScenario
> = {
  "eastbound-drift": {
    autoSelectBuildChoices: true,
    defaultLoop: true,
    description: "Drift continuously east to isolate traversal-only runtime pressure.",
    id: "eastbound-drift",
    recommendedConfig: {
      playerInvincible: true,
      spawnMode: "no-spawn"
    },
    speedMultiplier: 1,
    steps: [
      {
        durationTicks: 240,
        label: "eastbound drift",
        vector: { x: 1, y: 0 }
      }
    ]
  },
  "figure-eight": {
    autoSelectBuildChoices: true,
    defaultLoop: true,
    description: "Traverse a looping figure-eight path to stress turning, overlap churn, and return passes.",
    id: "figure-eight",
    recommendedConfig: {
      playerInvincible: true,
      spawnMode: "normal"
    },
    speedMultiplier: 1,
    steps: [
      { durationTicks: 90, label: "right-loop east", magnitude: 0.72, vector: { x: 1, y: 0 } },
      { durationTicks: 90, label: "right-loop southeast", magnitude: 0.72, vector: { x: 1, y: 1 } },
      { durationTicks: 90, label: "right-loop south", magnitude: 0.72, vector: { x: 0, y: 1 } },
      { durationTicks: 90, label: "right-loop southwest", magnitude: 0.72, vector: { x: -1, y: 1 } },
      { durationTicks: 90, label: "center crossover northwest", magnitude: 0.72, vector: { x: -1, y: -1 } },
      { durationTicks: 90, label: "left-loop west", magnitude: 0.72, vector: { x: -1, y: 0 } },
      { durationTicks: 90, label: "left-loop northwest", magnitude: 0.72, vector: { x: -1, y: -1 } },
      { durationTicks: 90, label: "left-loop north", magnitude: 0.72, vector: { x: 0, y: -1 } },
      { durationTicks: 90, label: "left-loop northeast", magnitude: 0.72, vector: { x: 1, y: -1 } },
      { durationTicks: 90, label: "center crossover southeast", magnitude: 0.72, vector: { x: 1, y: 1 } }
    ]
  },
  "left-right-pendulum": {
    autoSelectBuildChoices: true,
    defaultLoop: true,
    description: "Alternate five-second right and left drifts to stress repeated reversals and local spawn churn.",
    id: "left-right-pendulum",
    recommendedConfig: {
      playerInvincible: true,
      spawnMode: "normal"
    },
    speedMultiplier: 2,
    steps: [
      { durationTicks: 300, label: "right drift", magnitude: 0.8, vector: { x: 1, y: 0 } },
      { durationTicks: 300, label: "left drift", magnitude: 0.8, vector: { x: -1, y: 0 } }
    ]
  },
  "square-loop": {
    autoSelectBuildChoices: true,
    defaultLoop: true,
    description: "Traverse a square path to exercise chunk churn and camera-relative movement.",
    id: "square-loop",
    recommendedConfig: {
      playerInvincible: true,
      spawnMode: "normal"
    },
    speedMultiplier: 1,
    steps: [
      { durationTicks: 180, label: "east", vector: { x: 1, y: 0 } },
      { durationTicks: 180, label: "south", vector: { x: 0, y: 1 } },
      { durationTicks: 180, label: "west", vector: { x: -1, y: 0 } },
      { durationTicks: 180, label: "north", vector: { x: 0, y: -1 } }
    ]
  },
  "traversal-baseline": {
    autoSelectBuildChoices: true,
    defaultLoop: true,
    description: "Alternate straight traversal and diagonals under normal hostile pressure.",
    id: "traversal-baseline",
    recommendedConfig: {
      playerInvincible: true,
      spawnMode: "normal"
    },
    speedMultiplier: 1,
    steps: [
      { durationTicks: 150, label: "east", vector: { x: 1, y: 0 } },
      { durationTicks: 120, label: "southeast", vector: { x: 1, y: 1 } },
      { durationTicks: 150, label: "south", vector: { x: 0, y: 1 } },
      { durationTicks: 120, label: "southwest", vector: { x: -1, y: 1 } },
      { durationTicks: 150, label: "west", vector: { x: -1, y: 0 } },
      { durationTicks: 120, label: "northwest", vector: { x: -1, y: -1 } },
      { durationTicks: 150, label: "north", vector: { x: 0, y: -1 } },
      { durationTicks: 120, label: "northeast", vector: { x: 1, y: -1 } }
    ]
  }
};

export const listRuntimeProfilingScenarios = () =>
  Object.values(runtimeProfilingScenarioCatalog).map((scenario) => ({
    defaultLoop: scenario.defaultLoop,
    description: scenario.description,
    id: scenario.id,
    autoSelectBuildChoices: scenario.autoSelectBuildChoices ?? false,
    recommendedConfig: scenario.recommendedConfig,
    speedMultiplier: scenario.speedMultiplier ?? 1,
    stepCount: scenario.steps.length,
    totalDurationTicks: scenario.steps.reduce((total, step) => total + step.durationTicks, 0)
  }));

export const resolveRuntimeProfilingScenario = (
  scenarioId: string
): RuntimeProfilingScenario | null => runtimeProfilingScenarioCatalog[scenarioId as RuntimeProfilingScenarioId] ?? null;

export const resolveRuntimeProfilingScenarioMovement = ({
  currentTick,
  loop,
  scenario,
  startTick
}: {
  currentTick: number;
  loop: boolean;
  scenario: RuntimeProfilingScenario;
  startTick: number;
}): {
  activeStepIndex: number;
  completedLoops: number;
  elapsedTicks: number;
  isActive: boolean;
  magnitude: number;
  stepLabel: string | null;
  vector: {
    x: number;
    y: number;
  };
} => {
  const totalDurationTicks = scenario.steps.reduce(
    (total, step) => total + step.durationTicks,
    0
  );
  const elapsedTicks = Math.max(0, currentTick - startTick);

  if (scenario.steps.length === 0 || totalDurationTicks <= 0) {
    return {
      activeStepIndex: -1,
      completedLoops: 0,
      elapsedTicks,
      isActive: false,
      magnitude: 0,
      stepLabel: null,
      vector: {
        x: 0,
        y: 0
      }
    };
  }

  if (!loop && elapsedTicks >= totalDurationTicks) {
    return {
      activeStepIndex: scenario.steps.length - 1,
      completedLoops: 0,
      elapsedTicks,
      isActive: false,
      magnitude: 0,
      stepLabel: null,
      vector: {
        x: 0,
        y: 0
      }
    };
  }

  const cycleTick = loop ? elapsedTicks % totalDurationTicks : elapsedTicks;
  let traversedTicks = 0;

  for (let stepIndex = 0; stepIndex < scenario.steps.length; stepIndex += 1) {
    const step = scenario.steps[stepIndex];
    const nextTraversedTicks = traversedTicks + step.durationTicks;

    if (cycleTick < nextTraversedTicks) {
      return {
        activeStepIndex: stepIndex,
        completedLoops: loop ? Math.floor(elapsedTicks / totalDurationTicks) : 0,
        elapsedTicks,
        isActive: true,
        magnitude: step.magnitude ?? 1,
        stepLabel: step.label,
        vector: step.vector
      };
    }

    traversedTicks = nextTraversedTicks;
  }

    return {
      activeStepIndex: scenario.steps.length - 1,
      completedLoops: loop ? Math.floor(elapsedTicks / totalDurationTicks) : 0,
      elapsedTicks,
      isActive: false,
      magnitude: 0,
      stepLabel: null,
      vector: {
        x: 0,
        y: 0
      }
    };
};
