import { worldContract } from "@engine/world/worldContract";

import systemTuningJson from "./systemTuning.json";
import { readFiniteNumber, readObject } from "./tuningValidation";

const resolveSystemTuning = (rawValue: unknown) => {
  const root = readObject(rawValue, "systemTuning");
  const input = readObject(root.input, "systemTuning.input");
  const virtualStick = readObject(root.input?.virtualStick, "systemTuning.input.virtualStick");
  const viewport = readObject(root.viewport, "systemTuning.viewport");
  const runtimePresentation = readObject(
    root.runtimePresentation,
    "systemTuning.runtimePresentation"
  );
  const hostilePathfinding = readObject(
    root.hostilePathfinding,
    "systemTuning.hostilePathfinding"
  );
  const movementSurfaceModifiers = readObject(
    root.movementSurfaceModifiers,
    "systemTuning.movementSurfaceModifiers"
  );

  return {
    hostilePathfinding: {
      maxExploredTilesPerSolve: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "systemTuning.hostilePathfinding.maxExploredTilesPerSolve",
        value: hostilePathfinding.maxExploredTilesPerSolve
      }),
      recomputeCadenceTicks: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "systemTuning.hostilePathfinding.recomputeCadenceTicks",
        value: hostilePathfinding.recomputeCadenceTicks
      }),
      searchRadiusInTiles: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "systemTuning.hostilePathfinding.searchRadiusInTiles",
        value: hostilePathfinding.searchRadiusInTiles
      }),
      waypointAdvanceDistanceTiles: readFiniteNumber({
        minExclusive: 0,
        path: "systemTuning.hostilePathfinding.waypointAdvanceDistanceTiles",
        value: hostilePathfinding.waypointAdvanceDistanceTiles
      }),
      waypointAdvanceDistanceWorldUnits:
        readFiniteNumber({
          minExclusive: 0,
          path: "systemTuning.hostilePathfinding.waypointAdvanceDistanceTiles",
          value: hostilePathfinding.waypointAdvanceDistanceTiles
        }) * worldContract.tileSizeInWorldUnits
    },
    input: {
      desktopMoveSpeedWorldUnitsPerSecond: readFiniteNumber({
        minExclusive: 0,
        path: "systemTuning.input.desktopMoveSpeedWorldUnitsPerSecond",
        value: input.desktopMoveSpeedWorldUnitsPerSecond
      }),
      virtualStick: {
        deadZonePixels: readFiniteNumber({
          minInclusive: 0,
          path: "systemTuning.input.virtualStick.deadZonePixels",
          value: virtualStick.deadZonePixels
        }),
        maxRadiusPixels: readFiniteNumber({
          minExclusive: 0,
          path: "systemTuning.input.virtualStick.maxRadiusPixels",
          value: virtualStick.maxRadiusPixels
        })
      }
    },
    movementSurfaceModifiers: {
      normal: {
        controlResponsiveness: readFiniteNumber({
          minInclusive: 0,
          path: "systemTuning.movementSurfaceModifiers.normal.controlResponsiveness",
          value: readObject(
            movementSurfaceModifiers.normal,
            "systemTuning.movementSurfaceModifiers.normal"
          ).controlResponsiveness
        }),
        speedMultiplier: readFiniteNumber({
          minInclusive: 0,
          path: "systemTuning.movementSurfaceModifiers.normal.speedMultiplier",
          value: readObject(
            movementSurfaceModifiers.normal,
            "systemTuning.movementSurfaceModifiers.normal"
          ).speedMultiplier
        }),
        velocityRetainFactor: readFiniteNumber({
          minInclusive: 0,
          path: "systemTuning.movementSurfaceModifiers.normal.velocityRetainFactor",
          value: readObject(
            movementSurfaceModifiers.normal,
            "systemTuning.movementSurfaceModifiers.normal"
          ).velocityRetainFactor
        })
      },
      slippery: {
        controlResponsiveness: readFiniteNumber({
          minInclusive: 0,
          path: "systemTuning.movementSurfaceModifiers.slippery.controlResponsiveness",
          value: readObject(
            movementSurfaceModifiers.slippery,
            "systemTuning.movementSurfaceModifiers.slippery"
          ).controlResponsiveness
        }),
        speedMultiplier: readFiniteNumber({
          minInclusive: 0,
          path: "systemTuning.movementSurfaceModifiers.slippery.speedMultiplier",
          value: readObject(
            movementSurfaceModifiers.slippery,
            "systemTuning.movementSurfaceModifiers.slippery"
          ).speedMultiplier
        }),
        velocityRetainFactor: readFiniteNumber({
          minInclusive: 0,
          path: "systemTuning.movementSurfaceModifiers.slippery.velocityRetainFactor",
          value: readObject(
            movementSurfaceModifiers.slippery,
            "systemTuning.movementSurfaceModifiers.slippery"
          ).velocityRetainFactor
        })
      },
      slow: {
        controlResponsiveness: readFiniteNumber({
          minInclusive: 0,
          path: "systemTuning.movementSurfaceModifiers.slow.controlResponsiveness",
          value: readObject(
            movementSurfaceModifiers.slow,
            "systemTuning.movementSurfaceModifiers.slow"
          ).controlResponsiveness
        }),
        speedMultiplier: readFiniteNumber({
          minInclusive: 0,
          path: "systemTuning.movementSurfaceModifiers.slow.speedMultiplier",
          value: readObject(
            movementSurfaceModifiers.slow,
            "systemTuning.movementSurfaceModifiers.slow"
          ).speedMultiplier
        }),
        velocityRetainFactor: readFiniteNumber({
          minInclusive: 0,
          path: "systemTuning.movementSurfaceModifiers.slow.velocityRetainFactor",
          value: readObject(
            movementSurfaceModifiers.slow,
            "systemTuning.movementSurfaceModifiers.slow"
          ).velocityRetainFactor
        })
      }
    },
    runtimePresentation: {
      floatingDamageNumberLifetimeTicks: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "systemTuning.runtimePresentation.floatingDamageNumberLifetimeTicks",
        value: runtimePresentation.floatingDamageNumberLifetimeTicks
      }),
      hitReactionVisibleTicks: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "systemTuning.runtimePresentation.hitReactionVisibleTicks",
        value: runtimePresentation.hitReactionVisibleTicks
      }),
      spawnHeadingMemoryTicks: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "systemTuning.runtimePresentation.spawnHeadingMemoryTicks",
        value: runtimePresentation.spawnHeadingMemoryTicks
      })
    },
    viewport: {
      breakpoint: readFiniteNumber({
        minInclusive: 0,
        path: "systemTuning.viewport.breakpoint",
        value: viewport.breakpoint
      }),
      mobileHeight: readFiniteNumber({
        minExclusive: 0,
        path: "systemTuning.viewport.mobileHeight",
        value: viewport.mobileHeight
      }),
      mobileWidth: readFiniteNumber({
        minExclusive: 0,
        path: "systemTuning.viewport.mobileWidth",
        value: viewport.mobileWidth
      })
    }
  };
};

export const systemTuning = resolveSystemTuning(systemTuningJson);
