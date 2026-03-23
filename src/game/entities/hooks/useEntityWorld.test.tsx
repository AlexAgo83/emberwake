import { renderHook } from "@testing-library/react";

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

  it("keeps support entities out of player-facing selection and rendering by default", () => {
    const primaryEntity = createInitialSimulationState().entity;
    const supportEntity = createDeterministicRuntimeSupportEntities()[2];
    const visibleChunks = [
      worldPointToChunkCoordinate(primaryEntity.worldPosition),
      worldPointToChunkCoordinate(supportEntity.worldPosition)
    ];
    const { result } = renderHook(() =>
        useEntityWorld({
          primaryEntityId: primaryEntity.id,
          selectedWorldPoint: supportEntity.worldPosition,
          simulatedEntities: [primaryEntity],
          visibleChunks
        })
    );

    expect(result.current.selectedEntity.id).toBe(primaryEntity.id);
    expect(result.current.selectedEntity.state).toBe(primaryEntity.state);
    expect(result.current.selectedEntity.isSelected).toBe(true);
    expect(
      result.current.visibleEntities.find((entity) => entity.id === supportEntity.id)
    ).toBeUndefined();
  });

  it("can still expose support entities explicitly for diagnostics", () => {
    const primaryEntity = createInitialSimulationState().entity;
    const supportEntity = createDeterministicRuntimeSupportEntities()[2];
    const visibleChunks = [
      worldPointToChunkCoordinate(primaryEntity.worldPosition),
      worldPointToChunkCoordinate(supportEntity.worldPosition)
    ];
    const { result } = renderHook(() =>
      useEntityWorld({
        includeSupportEntities: true,
        primaryEntityId: primaryEntity.id,
        selectedWorldPoint: supportEntity.worldPosition,
        simulatedEntities: [primaryEntity],
        visibleChunks
      })
    );

    expect(result.current.selectedEntity.id).toBe(supportEntity.id);
    expect(result.current.visibleEntities.find((entity) => entity.id === supportEntity.id)).toMatchObject({
      id: supportEntity.id,
      isSelected: true,
      state: "moving"
    });
  });

  it("keeps overlap diagnostics off the default player path", () => {
    const simulationState = createInitialSimulationState();
    const overlappingHostile = {
      ...simulationState.entity,
      id: "entity:hostile:test",
      role: "hostile" as const
    };
    const visibleChunks = [worldPointToChunkCoordinate(simulationState.entity.worldPosition)];
    const { result } = renderHook(() =>
      useEntityWorld({
        primaryEntityId: simulationState.entity.id,
        selectedWorldPoint: null,
        simulatedEntities: [simulationState.entity, overlappingHostile],
        visibleChunks
      })
    );

    expect(result.current.overlappingPairs).toEqual([]);
    expect(result.current.entitiesByChunk.size).toBe(0);
  });

  it("can still compute overlap diagnostics when explicitly requested", () => {
    const simulationState = createInitialSimulationState();
    const overlappingHostile = {
      ...simulationState.entity,
      id: "entity:hostile:test",
      role: "hostile" as const
    };
    const visibleChunks = [worldPointToChunkCoordinate(simulationState.entity.worldPosition)];
    const { result } = renderHook(() =>
      useEntityWorld({
        includeSpatialDiagnostics: true,
        primaryEntityId: simulationState.entity.id,
        selectedWorldPoint: null,
        simulatedEntities: [simulationState.entity, overlappingHostile],
        visibleChunks
      })
    );

    expect(result.current.overlappingPairs).toHaveLength(1);
    expect(result.current.entitiesByChunk.size).toBe(1);
  });
});
