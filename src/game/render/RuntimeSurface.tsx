import { Fragment } from "react";
import type { ReactNode } from "react";

import { RuntimeCanvas, type CameraState } from "@engine-pixi";
import {
  emberwakeRuntimeRenderLayerOrder,
  type EmberwakeRuntimeRenderLayerId
} from "@game/presentation/emberwakeRenderLayers";
import type { EmberwakeRenderSurfaceMode } from "@game";
import { CombatSkillFeedbackScene } from "./CombatSkillFeedbackScene";
import { EntityScene } from "../entities/render/EntityScene";
import type {
  CombatSkillFeedbackEvent,
  FloatingDamageNumber,
  SimulatedEntity
} from "../entities/model/entitySimulation";
import { WorldScene } from "../world/render/WorldScene";
import type { ChunkCoordinate } from "../world/types";

type RuntimeSurfaceProps = {
  camera: CameraState;
  currentTick: number;
  entityRingsVisible: boolean;
  onRendererError?: (message: string) => void;
  onRendererReady?: () => void;
  onSurfaceElementChange?: (element: HTMLDivElement | null) => void;
  renderSurfaceMode: EmberwakeRenderSurfaceMode;
  onVisualFrame?: (timestampMs: number) => void;
  combatSkillFeedbackEvents: CombatSkillFeedbackEvent[];
  floatingDamageNumbers: FloatingDamageNumber[];
  selectedEntityId: string | null;
  visibleEntities: SimulatedEntity[];
  visibleChunks: ChunkCoordinate[];
  viewport: {
    fitScale: number;
    screenSize: {
      height: number;
      width: number;
    };
  };
  worldSeed: string;
};

export function RuntimeSurface({
  camera,
  currentTick,
  entityRingsVisible,
  onRendererError,
  onRendererReady,
  onSurfaceElementChange,
  renderSurfaceMode,
  onVisualFrame,
  combatSkillFeedbackEvents,
  floatingDamageNumbers,
  selectedEntityId,
  visibleEntities,
  visibleChunks,
  viewport,
  worldSeed
}: RuntimeSurfaceProps) {
  const renderLayers: Record<EmberwakeRuntimeRenderLayerId, ReactNode> = {
    entities: (
      <EntityScene
        camera={camera}
        currentTick={currentTick}
        entityRingsVisible={entityRingsVisible}
        entities={visibleEntities}
        floatingDamageNumbers={floatingDamageNumbers}
        renderSurfaceMode={renderSurfaceMode}
        selectedEntityId={selectedEntityId}
        viewport={viewport}
      />
    ),
    feedback: (
      <CombatSkillFeedbackScene
        camera={camera}
        combatSkillFeedbackEvents={combatSkillFeedbackEvents}
        currentTick={currentTick}
        viewport={viewport}
      />
    ),
    world: (
      <WorldScene
        camera={camera}
        renderSurfaceMode={renderSurfaceMode}
        viewport={viewport}
        visibleChunks={visibleChunks}
        worldSeed={worldSeed}
      />
    )
  };

  return (
    <RuntimeCanvas
      onRendererError={onRendererError}
      onRendererReady={onRendererReady}
      onSurfaceElementChange={onSurfaceElementChange}
      onVisualFrame={onVisualFrame}
    >
      {emberwakeRuntimeRenderLayerOrder.map((layerId) => (
        <Fragment key={layerId}>{renderLayers[layerId]}</Fragment>
      ))}
    </RuntimeCanvas>
  );
}
