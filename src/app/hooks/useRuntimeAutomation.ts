import { useEffect, useMemo, useRef, useState } from "react";

import {
  createIdleMovementIntent,
  createMovementIntent
} from "../../game/input/model/singleEntityControlContract";
import type { MovementIntent } from "../../game/input/model/singleEntityControlContract";
import { entitySimulationContract } from "@game";
import {
  clearRuntimeProfilingBridge,
  patchRuntimeProfilingBridge,
  type RuntimeAutomationStatus
} from "../model/runtimeProfilingBridge";
import {
  listRuntimeProfilingScenarios,
  resolveRuntimeProfilingScenario,
  resolveRuntimeProfilingScenarioMovement
} from "../model/runtimeProfilingScenarios";

type ActiveScenarioState = {
  loop: boolean;
  scenarioId: string;
  speedMultiplier?: 0.5 | 1 | 2 | 4;
  startMs: number;
} | null;

export function useRuntimeAutomation() {
  const [currentTimeMs, setCurrentTimeMs] = useState(() => performance.now());
  const currentTimeRef = useRef(currentTimeMs);
  const [activeScenario, setActiveScenario] = useState<ActiveScenarioState>(null);

  currentTimeRef.current = currentTimeMs;

  useEffect(() => {
    if (!activeScenario) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(performance.now());
    }, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeScenario]);

  const resolvedScenario = activeScenario
    ? resolveRuntimeProfilingScenario(activeScenario.scenarioId)
    : null;
  const automationState = useMemo(() => {
    if (!activeScenario || !resolvedScenario) {
      return {
        autoSelectBuildChoices: false,
        movementIntent: createIdleMovementIntent("none"),
        speedMultiplier: 1 as const,
        status: {
          activeScenarioId: null,
          activeStepIndex: -1,
          completedLoops: 0,
          currentTick: 0,
          elapsedTicks: 0,
          isRunning: false,
          stepLabel: null
        } satisfies RuntimeAutomationStatus
      };
    }

    const elapsedTicks = Math.max(
      0,
      Math.floor((currentTimeMs - activeScenario.startMs) / entitySimulationContract.fixedStepMs)
    );

    const movementState = resolveRuntimeProfilingScenarioMovement({
      currentTick: elapsedTicks,
      loop: activeScenario.loop,
      scenario: resolvedScenario,
      startTick: 0
    });

    return {
      autoSelectBuildChoices: resolvedScenario.autoSelectBuildChoices ?? false,
      movementIntent: movementState.isActive
        ? createMovementIntent(
            movementState.vector.x * movementState.magnitude,
            movementState.vector.y * movementState.magnitude,
            "keyboard"
          )
        : createIdleMovementIntent("none"),
      speedMultiplier: activeScenario.speedMultiplier ?? resolvedScenario.speedMultiplier ?? 1,
      status: {
        activeScenarioId: resolvedScenario.id,
        activeStepIndex: movementState.activeStepIndex,
        completedLoops: movementState.completedLoops,
        currentTick: elapsedTicks,
        elapsedTicks: movementState.elapsedTicks,
        isRunning: movementState.isActive,
        stepLabel: movementState.stepLabel
      } satisfies RuntimeAutomationStatus
    };
  }, [activeScenario, currentTimeMs, resolvedScenario]);
  const automationStatusRef = useRef(automationState.status);

  automationStatusRef.current = automationState.status;

  useEffect(() => {
    patchRuntimeProfilingBridge({
      getRuntimeStatus: () => automationStatusRef.current,
      listScenarios: () => listRuntimeProfilingScenarios(),
      startScenario: ({ loop, scenarioId, speedMultiplier }) => {
        const scenario = resolveRuntimeProfilingScenario(scenarioId);

        if (!scenario) {
          return null;
        }

        setActiveScenario({
          loop: loop ?? scenario.defaultLoop,
          scenarioId: scenario.id,
          speedMultiplier,
          startMs: currentTimeRef.current
        });

        return {
          activeScenarioId: scenario.id,
          activeStepIndex: 0,
          completedLoops: 0,
          currentTick: 0,
          elapsedTicks: 0,
          isRunning: true,
          stepLabel: scenario.steps[0]?.label ?? null
        };
      },
      stopScenario: () => {
        setActiveScenario(null);
        return {
          activeScenarioId: null,
          activeStepIndex: -1,
          completedLoops: 0,
          currentTick: 0,
          elapsedTicks: 0,
          isRunning: false,
          stepLabel: null
        };
      }
    });

    return () => {
      clearRuntimeProfilingBridge([
        "getRuntimeStatus",
        "listScenarios",
        "startScenario",
        "stopScenario"
      ]);
    };
  }, []);

  return {
    autoSelectBuildChoices: automationState.autoSelectBuildChoices,
    movementIntent: automationState.movementIntent satisfies MovementIntent,
    speedMultiplier: automationState.speedMultiplier,
    status: automationState.status
  };
}
