import { renderHook, waitFor } from "@testing-library/react";

import { createDeterministicRuntimeSupportEntities } from "@game/runtime/emberwakeRuntimeBootstrap";
import { worldPointToChunkCoordinate } from "../../world/model/worldContract";
import { createInitialSimulationState } from "../model/entitySimulation";
import { useEntityWorld } from "./useEntityWorld";

describe("useEntityWorld", () => {
  it("preserves the real simulation state for the selected primary entity", () => {
    const primaryEntity = {
      ...createInitialSimulationState().entity,
      state: "moving" as const
    };
    const visibleChunks = [worldPointToChunkCoordinate(primaryEntity.worldPosition)];
    const { result } = renderHook(() =>
      useEntityWorld({
        primaryEntityId: primaryEntity.id,
        selectedWorldPoint: null,
        simulatedEntities: [primaryEntity],
        visibleChunks
      })
    );

    expect(result.current.selectedEntity.id).toBe(primaryEntity.id);
    expect(result.current.selectedEntity.state).toBe("moving");
    expect(result.current.selectedEntity.isSelected).toBe(true);
  });

  it("keeps selection presentation separate from support-entity simulation state", async () => {
    const primaryEntity = createInitialSimulationState().entity;
    const supportEntity = createDeterministicRuntimeSupportEntities()[2];
    const visibleChunks = [
      worldPointToChunkCoordinate(primaryEntity.worldPosition),
      worldPointToChunkCoordinate(supportEntity.worldPosition)
    ];
    const { result, rerender } = renderHook(
      ({ selectedWorldPoint }) =>
        useEntityWorld({
          primaryEntityId: primaryEntity.id,
          selectedWorldPoint,
          simulatedEntities: [primaryEntity],
          visibleChunks
        }),
      {
        initialProps: {
          selectedWorldPoint: null as { x: number; y: number } | null
        }
      }
    );

    rerender({
      selectedWorldPoint: supportEntity.worldPosition
    });

    await waitFor(() => {
      expect(result.current.selectedEntity.id).toBe(supportEntity.id);
    });

    expect(result.current.selectedEntity.state).toBe("moving");
    expect(result.current.selectedEntity.isSelected).toBe(true);
    expect(result.current.visibleEntities.find((entity) => entity.id === supportEntity.id)).toMatchObject({
      id: supportEntity.id,
      isSelected: true,
      state: "moving"
    });
  });
});
