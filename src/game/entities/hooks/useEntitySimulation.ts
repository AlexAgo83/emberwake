import { useEffect, useRef, useState } from "react";

import {
  advanceSimulationState,
  createInitialSimulationState,
  entitySimulationContract
} from "../model/entitySimulation";
import type { EntitySimulationState } from "../model/entitySimulation";
import type { SingleEntityControlState } from "../../input/model/singleEntityControlContract";

type UseEntitySimulationOptions = {
  controlState?: SingleEntityControlState;
};

export function useEntitySimulation({ controlState }: UseEntitySimulationOptions = {}) {
  const [simulationState, setSimulationState] = useState<EntitySimulationState>(
    createInitialSimulationState
  );
  const simulationStateRef = useRef(simulationState);
  const controlStateRef = useRef(controlState);

  useEffect(() => {
    simulationStateRef.current = simulationState;
  }, [simulationState]);

  useEffect(() => {
    controlStateRef.current = controlState;
  }, [controlState]);

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
          nextSimulationState = advanceSimulationState(nextSimulationState, {
            controlState: controlStateRef.current
          });
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
