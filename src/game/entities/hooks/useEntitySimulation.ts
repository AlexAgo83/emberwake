import { useEffect, useRef, useState } from "react";

import {
  advanceSimulationState,
  createInitialSimulationState,
  entitySimulationContract
} from "../model/entitySimulation";
import type { EntitySimulationState } from "../model/entitySimulation";

export function useEntitySimulation() {
  const [simulationState, setSimulationState] = useState<EntitySimulationState>(
    createInitialSimulationState
  );
  const simulationStateRef = useRef(simulationState);

  useEffect(() => {
    simulationStateRef.current = simulationState;
  }, [simulationState]);

  useEffect(() => {
    let frameId = 0;
    let previousTimestamp = 0;
    let accumulator = 0;

    const tick = (timestamp: number) => {
      if (previousTimestamp === 0) {
        previousTimestamp = timestamp;
      }

      accumulator += timestamp - previousTimestamp;
      previousTimestamp = timestamp;

      if (accumulator >= entitySimulationContract.fixedStepMs) {
        let nextSimulationState = simulationStateRef.current;

        while (accumulator >= entitySimulationContract.fixedStepMs) {
          nextSimulationState = advanceSimulationState(nextSimulationState);
          accumulator -= entitySimulationContract.fixedStepMs;
        }

        simulationStateRef.current = nextSimulationState;
        setSimulationState(nextSimulationState);
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return simulationState;
}
