import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import "./ActiveRuntimeShellContent.css";
import { EntityInspectionPanel } from "./EntityInspectionPanel";
import { PlayerHudCard } from "./PlayerHudCard";
import { RuntimeBuildChoicePanel } from "./RuntimeBuildChoicePanel";
import { RuntimeSceneBoundary } from "./RuntimeSceneBoundary";
import { ShellMenu } from "./ShellMenu";
import { runtimePublicationContract } from "../model/runtimePublicationContract";
import type { AppSceneId, RuntimeShellOutcome } from "../model/appScene";
import { worldPointToChunkCoordinate } from "@engine";
import { useCameraController } from "../../game/camera/hooks/useCameraController";
import { ShellDiagnosticsPanel } from "../../game/debug/ShellDiagnosticsPanel";
import { useDebugPanelHotkey } from "../../game/debug/hooks/useDebugPanelHotkey";
import { useEntitySimulation } from "../../game/entities/hooks/useEntitySimulation";
import { useEntityWorld } from "../../game/entities/hooks/useEntityWorld";
import { entityContract } from "../../game/entities/model/entityContract";
import { MobileVirtualStickOverlay } from "../../game/input/components/MobileVirtualStickOverlay";
import { useMobileVirtualStick } from "../../game/input/hooks/useMobileVirtualStick";
import { useSingleEntityControl } from "../../game/input/hooks/useSingleEntityControl";
import { createIdleMovementIntent } from "../../game/input/model/singleEntityControlContract";
import { useRuntimeAutomation } from "../hooks/useRuntimeAutomation";
import { useWorldInteractionDiagnostics } from "../../game/world/hooks/useWorldInteractionDiagnostics";
import { useVisibleChunkSet } from "../../game/world/hooks/useVisibleChunkSet";
import { appConfig } from "../../shared/config/appConfig";
import type { CameraMode } from "../../game/camera/model/cameraMode";
import type { CameraState } from "../../game/camera/model/cameraMath";
import type { RendererState } from "../hooks/useRendererHealth";
import { useRuntimeTelemetryBridge } from "../hooks/useRuntimeTelemetryBridge";
import { useRuntimeInteractionGuards } from "../hooks/useRuntimeInteractionGuards";
import type { RuntimeSessionState } from "../../shared/lib/runtimeSessionStorage";
import type { ShellPreferences } from "../../shared/lib/shellPreferencesStorage";
import type { ReturnTypeUseLogicalViewportModel } from "../../game/debug/types";
import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";
import { createInitialEmberwakeGameState } from "@game";
import type { BuildMetaProgression, EmberwakeGameState } from "@game";
import type { RuntimeProfilingConfig } from "@game";
import {
  getActiveWeaponDefinition,
  getPassiveItemDefinition,
  resolveBuildDisplayLabel,
  resolveFusionReadyState
} from "@game";

type ActiveRuntimeShellContentProps = {
  activeScene: AppSceneId;
  canInstall: boolean;
  cycleWorldSeed: () => void;
  desktopControlBindings: DesktopControlBindings;
  diagnosticsVisible: boolean;
  inspecteurVisible: boolean;
  isFullscreen: boolean;
  isFullscreenSupported: boolean;
  isMenuOpen: boolean;
  lastFullscreenError: string | null;
  metaOverlay: ReactNode;
  metaProgression: BuildMetaProgression;
  onEnterFullscreen: () => void;
  onInstall: () => void;
  onMenuOpenChange: (isOpen: boolean) => void;
  onBossSpawnToast: () => void;
  onRendererError: (message: string) => void;
  onRendererReady: () => void;
  onRetryRuntime: () => void;
  onResumeRuntime: () => void;
  onRuntimeOutcomeChange: (runtimeOutcome: RuntimeShellOutcome | null) => void;
  onRuntimeStateChange: (gameState: EmberwakeGameState) => void;
  onSetCameraMode: (cameraMode: CameraMode) => void;
  onSetCameraState: (cameraState: CameraState) => void;
  onSetDebugPanelVisible: (visible: boolean) => void;
  onSetInspectionPanelVisible: (visible: boolean) => void;
  onSetLastMetaScene: (scene: ShellPreferences["lastMetaScene"]) => void;
  onSetMovementOnboardingDismissed: (dismissed: boolean) => void;
  onSetRuntimeFeedbackVisible: (visible: boolean) => void;
  onShowMainMenuScene: () => void;
  onShowPauseScene: () => void;
  onShowSettingsScene: () => void;
  preferences: ShellPreferences;
  profilingConfig: RuntimeProfilingConfig;
  rendererState: RendererState;
  runtimeSession: RuntimeSessionState;
  sessionInitState?: EmberwakeGameState;
  shellRequestedScene: AppSceneId;
  viewport: ReturnTypeUseLogicalViewportModel;
};

export function ActiveRuntimeShellContent({
  activeScene,
  canInstall,
  cycleWorldSeed,
  desktopControlBindings,
  diagnosticsVisible,
  inspecteurVisible,
  isFullscreen,
  isFullscreenSupported,
  isMenuOpen,
  lastFullscreenError,
  metaOverlay,
  metaProgression,
  onEnterFullscreen,
  onInstall,
  onMenuOpenChange,
  onBossSpawnToast,
  onRendererError,
  onRendererReady,
  onRetryRuntime,
  onResumeRuntime,
  onRuntimeOutcomeChange,
  onRuntimeStateChange,
  onSetCameraMode,
  onSetCameraState,
  onSetDebugPanelVisible,
  onSetInspectionPanelVisible,
  onSetLastMetaScene,
  onSetMovementOnboardingDismissed,
  onSetRuntimeFeedbackVisible,
  onShowMainMenuScene,
  onShowPauseScene,
  onShowSettingsScene,
  preferences,
  profilingConfig,
  rendererState,
  runtimeSession,
  sessionInitState,
  shellRequestedScene,
  viewport
}: ActiveRuntimeShellContentProps) {
  const runtimeSurfaceRef = useRef<HTMLDivElement | null>(null);
  const autoSelectedLevelUpSignatureRef = useRef<string | null>(null);
  const announcedBossIdsRef = useRef<Set<string>>(new Set());
  const bossTrackingInitializedRef = useRef(false);
  const pendingButtonStepRef = useRef<number | null>(null);
  const [runtimeSurfaceElement, setRuntimeSurfaceElement] = useState<HTMLDivElement | null>(null);
  const [runtimeButtonPresses, setRuntimeButtonPresses] = useState<Record<string, boolean>>({});
  const handleRuntimeSurfaceElementChange = useCallback((element: HTMLDivElement | null) => {
    if (runtimeSurfaceRef.current === element) {
      return;
    }

    runtimeSurfaceRef.current = element;
    setRuntimeSurfaceElement(element);
  }, []);

  const mobileVirtualStick = useMobileVirtualStick({
    surfaceElement: runtimeSurfaceElement
  });
  useRuntimeInteractionGuards(runtimeSurfaceElement);
  const runtimeControlState = useSingleEntityControl({
    controlledEntityId: entityContract.primaryEntityId,
    keyboardBindings: desktopControlBindings,
    viewRotationRadians: runtimeSession.cameraState.rotation,
    touchMovementIntent: mobileVirtualStick.movementIntent
  });
  const runtimeAutomation = useRuntimeAutomation();
  const effectiveRuntimeControlState = useMemo(
    () =>
      runtimeAutomation.movementIntent.isActive
        ? {
            ...runtimeControlState,
            inputOwner: "player-entity" as const,
            movementIntent: runtimeAutomation.movementIntent
          }
        : runtimeControlState,
    [runtimeAutomation.movementIntent, runtimeControlState]
  );
  const controlState = useMemo(
    () =>
      shellRequestedScene === "runtime"
        ? effectiveRuntimeControlState
        : {
            ...effectiveRuntimeControlState,
            debugCameraModifierActive: false,
            inputOwner: "none" as const,
            movementIntent: createIdleMovementIntent("none")
          },
    [effectiveRuntimeControlState, shellRequestedScene]
  );
  const effectiveSessionInitState = useMemo(
    () =>
      sessionInitState ??
      createInitialEmberwakeGameState(runtimeSession.worldSeed, profilingConfig, metaProgression),
    [metaProgression, profilingConfig, runtimeSession.worldSeed, sessionInitState]
  );
  const simulationState = useEntitySimulation({
    buttonPresses: runtimeButtonPresses,
    controlState,
    initialGameState: effectiveSessionInitState,
    profilingConfig,
    sessionRevision: runtimeSession.sessionRevision
  });
  const runtimeOutcome = useMemo(() => {
    const rawRuntimeOutcome = simulationState.presentation.overlays?.runtimeOutcome;

    if (!rawRuntimeOutcome || rawRuntimeOutcome.kind === "none") {
      return null;
    }

    return rawRuntimeOutcome as RuntimeShellOutcome;
  }, [simulationState.presentation.overlays]);
  const followedWorldPosition =
    simulationState.presentation.cameraTarget?.worldPosition ?? simulationState.entity.worldPosition;
  const { cameraState, resetCamera } = useCameraController({
    cameraMode: runtimeSession.cameraMode,
    desktopControlBindings,
    debugCameraEnabled: controlState.debugCameraModifierActive,
    followedWorldPosition,
    initialCameraState: runtimeSession.cameraState,
    onCameraStateChange: onSetCameraState,
    surfaceElement: runtimeSurfaceElement,
    viewport
  });
  const chunkVisibility = useVisibleChunkSet(cameraState, viewport);
  const worldDiagnostics = useWorldInteractionDiagnostics({
    camera: cameraState,
    surfaceElement: runtimeSurfaceElement,
    viewport
  });
  const entityWorld = useEntityWorld({
    includeSpatialDiagnostics: diagnosticsVisible,
    includeSupportEntities: diagnosticsVisible,
    primaryEntityId: simulationState.entity.id,
    selectedWorldPoint: worldDiagnostics.selectedWorldPoint,
    simulatedEntities: simulationState.entities,
    visibleChunks: chunkVisibility.visibleChunks
  });
  const showShellTools =
    activeScene !== "main-menu" && activeScene !== "new-game" && activeScene !== "changelogs";
  const isMobileLayout = viewport.layoutMode === "mobile";
  const buildState = simulationState.gameState.simulation.buildState;
  const levelUpChoices = buildState.levelUpChoices;
  const levelUpVisible = activeScene === "runtime" && levelUpChoices.length > 0;
  const runtimeEntityBreakdown = useMemo(() => {
    const entityRoleCounts = {
      hostile: 0,
      pickup: 0,
      player: 0,
      support: 0
    };
    const hostileProfileCounts = {
      ashDrifter: 0,
      needleWisp: 0,
      shockRam: 0,
      sentinelHusk: 0,
      watchglass: 0,
      watchglassPrime: 0
    };
    const pickupKindCounts = {
      cache: 0,
      crystal: 0,
      gold: 0,
      healingKit: 0,
      magnet: 0
    };
    const pickupStackTotals = {
      crystal: 0,
      gold: 0,
      total: 0
    };

    for (const entity of simulationState.entities) {
      entityRoleCounts[entity.role] += 1;

      if (entity.role === "hostile") {
        if (entity.hostileProfileId === "ash-drifter") {
          hostileProfileCounts.ashDrifter += 1;
        } else if (entity.hostileProfileId === "needle-wisp") {
          hostileProfileCounts.needleWisp += 1;
        } else if (entity.hostileProfileId === "shock-ram") {
          hostileProfileCounts.shockRam += 1;
        } else if (entity.hostileProfileId === "sentinel-husk") {
          hostileProfileCounts.sentinelHusk += 1;
        } else if (entity.hostileProfileId === "watchglass") {
          hostileProfileCounts.watchglass += 1;
        } else if (entity.hostileProfileId === "watchglass-prime") {
          hostileProfileCounts.watchglassPrime += 1;
        }
      }

      if (entity.role === "pickup" && entity.pickupProfile) {
        const pickupStackCount = Math.max(1, entity.pickupProfile.stackCount ?? 1);

        if (entity.pickupProfile.kind === "cache") {
          pickupKindCounts.cache += 1;
        } else if (entity.pickupProfile.kind === "crystal") {
          pickupKindCounts.crystal += 1;
          pickupStackTotals.crystal += pickupStackCount;
          pickupStackTotals.total += pickupStackCount;
        } else if (entity.pickupProfile.kind === "gold") {
          pickupKindCounts.gold += 1;
          pickupStackTotals.gold += pickupStackCount;
          pickupStackTotals.total += pickupStackCount;
        } else if (entity.pickupProfile.kind === "healing-kit") {
          pickupKindCounts.healingKit += 1;
        } else if (entity.pickupProfile.kind === "magnet") {
          pickupKindCounts.magnet += 1;
        }
      }
    }

    return {
      entityRoleCounts,
      hostileProfileCounts,
      pickupKindCounts,
      pickupStackTotals
    };
  }, [simulationState.entities]);
  const levelUpChoiceSignature = useMemo(
    () => levelUpChoices.map((choice) => choice.id).join("|"),
    [levelUpChoices]
  );

  const handleToggleDiagnostics = useCallback(() => {
    onSetDebugPanelVisible(!preferences.debugPanelVisible);
  }, [onSetDebugPanelVisible, preferences.debugPanelVisible]);
  const handleToggleInspecteur = useCallback(() => {
    onSetInspectionPanelVisible(!preferences.inspectionPanelVisible);
  }, [onSetInspectionPanelVisible, preferences.inspectionPanelVisible]);
  const handleCloseInspectionPanel = useCallback(() => {
    onSetInspectionPanelVisible(false);
  }, [onSetInspectionPanelVisible]);
  const handleCloseDiagnostics = useCallback(() => {
    onSetDebugPanelVisible(false);
  }, [onSetDebugPanelVisible]);
  const handleSelectBuildChoice = useCallback(
    (choiceIndex: number) => {
      pendingButtonStepRef.current = simulationState.runtime.simulationStepsTotal;
      setRuntimeButtonPresses({
        [`build.choice.${choiceIndex}`]: true
      });
      simulationState.controls.stepOnce();
    },
    [simulationState.controls, simulationState.runtime.simulationStepsTotal]
  );

  useEffect(() => {
    if (
      pendingButtonStepRef.current === null ||
      simulationState.runtime.simulationStepsTotal <= pendingButtonStepRef.current
    ) {
      return;
    }

    pendingButtonStepRef.current = null;
    setRuntimeButtonPresses({});
  }, [simulationState.runtime.simulationStepsTotal]);

  useEffect(() => {
    if (!runtimeAutomation.autoSelectBuildChoices || !levelUpVisible) {
      autoSelectedLevelUpSignatureRef.current = null;
      return;
    }

    if (pendingButtonStepRef.current !== null || levelUpChoiceSignature.length === 0) {
      return;
    }

    if (autoSelectedLevelUpSignatureRef.current === levelUpChoiceSignature) {
      return;
    }

    autoSelectedLevelUpSignatureRef.current = levelUpChoiceSignature;
    handleSelectBuildChoice(0);
  }, [
    handleSelectBuildChoice,
    levelUpChoiceSignature,
    levelUpVisible,
    runtimeAutomation.autoSelectBuildChoices
  ]);

  const diagnosticsPanelProps = useMemo(
    () => ({
      camera: cameraState,
      control: runtimeControlState,
      entity: entityWorld.selectedEntity ?? simulationState.entity,
      fullscreen: {
        isFullscreen,
        isSupported: isFullscreenSupported,
        lastError: lastFullscreenError
      },
      onClose: handleCloseDiagnostics,
      preferences,
      publication: runtimePublicationContract.hotPathSurfaceModes,
      renderer: rendererState,
      simulation: {
        ...simulationState.runtime,
        tick: simulationState.tick
      },
      simulationControls: {
        ...simulationState.controls,
        cycleWorldSeed
      },
      viewport,
      worldDiagnostics,
      worldRender: {
        cachedChunkIds: chunkVisibility.cachedChunkIds,
        overlappingPairs: entityWorld.overlappingPairs.length,
        preloadMargin: chunkVisibility.preloadMargin,
        trackedEntities: entityWorld.trackedEntities.length,
        visibleEntities: entityWorld.visibleEntities.length,
        visibleChunks: chunkVisibility.visibleChunks,
        worldSeed: runtimeSession.worldSeed
      }
    }),
    [
      cameraState,
      chunkVisibility.cachedChunkIds,
      chunkVisibility.preloadMargin,
      chunkVisibility.visibleChunks,
      cycleWorldSeed,
      entityWorld.overlappingPairs.length,
      entityWorld.selectedEntity,
      entityWorld.trackedEntities.length,
      entityWorld.visibleEntities.length,
      handleCloseDiagnostics,
      isFullscreen,
      isFullscreenSupported,
      lastFullscreenError,
      preferences,
      rendererState,
      runtimeControlState,
      runtimeSession.worldSeed,
      simulationState.controls,
      simulationState.entity,
      simulationState.runtime,
      simulationState.tick,
      viewport,
      worldDiagnostics
    ]
  );

  useEffect(() => {
    simulationState.controls.setSpeedMultiplier(runtimeAutomation.speedMultiplier);
  }, [runtimeAutomation.speedMultiplier, simulationState.controls]);

  useEffect(() => {
    onRuntimeStateChange(simulationState.gameState);
  }, [onRuntimeStateChange, simulationState.gameState]);

  useEffect(() => {
    onRuntimeOutcomeChange(runtimeOutcome);
  }, [onRuntimeOutcomeChange, runtimeOutcome]);

  useEffect(() => {
    announcedBossIdsRef.current = new Set();
    bossTrackingInitializedRef.current = false;
  }, [runtimeSession.sessionRevision]);

  useEffect(() => {
    const currentBossIds = new Set(
      simulationState.entities
        .filter(
          (entity) => entity.role === "hostile" && entity.hostileProfileId === "watchglass-prime"
        )
        .map((entity) => entity.id)
    );

    if (!bossTrackingInitializedRef.current) {
      announcedBossIdsRef.current = currentBossIds;
      bossTrackingInitializedRef.current = true;
      return;
    }

    currentBossIds.forEach((bossId) => {
      if (announcedBossIdsRef.current.has(bossId)) {
        return;
      }

      onBossSpawnToast();
    });

    announcedBossIdsRef.current = currentBossIds;
  }, [onBossSpawnToast, simulationState.entities]);

  useRuntimeTelemetryBridge({
    activeScene,
    diagnosticsVisible,
    publication: runtimePublicationContract.hotPathSurfaceModes,
    rendererState,
    runtime: simulationState.runtime,
    runtimeState: {
      combatSkillFeedbackEventCount: simulationState.combatSkillFeedbackEvents.length,
      entityCount: simulationState.entities.length,
      entityRoleCounts: runtimeEntityBreakdown.entityRoleCounts,
      floatingDamageNumberCount: simulationState.floatingDamageNumbers.length,
      hostileCount: simulationState.entities.filter((entity) => entity.role === "hostile").length,
      hostileProfileCounts: runtimeEntityBreakdown.hostileProfileCounts,
      pickupCount: simulationState.entities.filter((entity) => entity.role === "pickup").length,
      pickupKindCounts: runtimeEntityBreakdown.pickupKindCounts,
      pickupStackTotals: runtimeEntityBreakdown.pickupStackTotals,
      playerHealth: simulationState.entity.combat.currentHealth,
      tick: simulationState.tick
    }
  });

  useDebugPanelHotkey({
    enabled: appConfig.diagnosticsEnabled && showShellTools,
    onToggle: handleToggleDiagnostics
  });

  useEffect(() => {
    if (!preferences.movementOnboardingDismissed && controlState.movementIntent.isActive) {
      onSetMovementOnboardingDismissed(true);
    }
  }, [
    controlState.movementIntent.isActive,
    onSetMovementOnboardingDismissed,
    preferences.movementOnboardingDismissed
  ]);

  useEffect(() => {
    if (activeScene === "pause" || activeScene === "settings" || levelUpVisible) {
      simulationState.controls.pause();
      onSetLastMetaScene(activeScene === "runtime" ? "none" : activeScene);
      return;
    }

    if (activeScene === "runtime" && !isMenuOpen) {
      simulationState.controls.resume();
      onSetLastMetaScene("none");
      return;
    }

    simulationState.controls.pause();
    onSetLastMetaScene("none");
  }, [activeScene, isMenuOpen, levelUpVisible, onSetLastMetaScene, simulationState.controls]);

  const buildActives = useMemo(
    () =>
      buildState.activeSlots.map((activeSlot) => ({
        id: activeSlot.fusionId ?? activeSlot.weaponId,
        isFusionReady: resolveFusionReadyState(buildState, activeSlot) !== null,
        isFused: activeSlot.fusionId !== null,
        label: resolveBuildDisplayLabel(buildState, activeSlot),
        level: activeSlot.level,
        maxLevel: getActiveWeaponDefinition(activeSlot.weaponId).maxLevel
      })),
    [buildState]
  );
  const buildPassives = useMemo(
    () =>
      buildState.passiveSlots.map((passiveSlot) => ({
        id: passiveSlot.passiveId,
        label: getPassiveItemDefinition(passiveSlot.passiveId).label,
        level: passiveSlot.level,
        maxLevel: getPassiveItemDefinition(passiveSlot.passiveId).maxLevel
      })),
    [buildState]
  );

  const selectedEntityChunk = worldPointToChunkCoordinate(entityWorld.selectedEntity.worldPosition);
  const playerHudVisible =
    activeScene === "runtime" &&
    preferences.runtimeFeedbackVisible &&
    !diagnosticsVisible &&
    !inspecteurVisible &&
    (!isMobileLayout || !isMenuOpen);

  return (
    <>
      <section className="app-shell__runtime" aria-label="Interactive runtime shell">
        <RuntimeSceneBoundary
          camera={cameraState}
          combatSkillFeedbackEvents={simulationState.combatSkillFeedbackEvents}
          currentTick={simulationState.tick}
          floatingDamageNumbers={simulationState.floatingDamageNumbers}
          onOpenSettings={onShowSettingsScene}
          onRendererError={onRendererError}
          onRendererReady={onRendererReady}
          onRetryRuntime={onRetryRuntime}
          onSurfaceElementChange={handleRuntimeSurfaceElementChange}
          onVisualFrame={simulationState.controls.advanceVisualFrame}
          renderSurfaceMode={diagnosticsVisible ? "diagnostics" : "player"}
          rendererMessage={rendererState.message}
          scene={activeScene}
          visibleEntities={entityWorld.visibleEntities}
          visibleChunks={chunkVisibility.visibleChunks}
          viewport={viewport}
          worldSeed={runtimeSession.worldSeed}
        />
      </section>

      <section className="app-shell__overlay" aria-label="Shell status overlay">
        {showShellTools ? (
          <ShellMenu
            activeScene={activeScene}
            cameraMode={runtimeSession.cameraMode}
            canInstall={canInstall}
            diagnosticsEnabled={appConfig.diagnosticsEnabled}
            diagnosticsVisible={diagnosticsVisible}
            inspecteurVisible={inspecteurVisible}
            isOpen={isMenuOpen}
            isFullscreen={isFullscreen}
            isFullscreenSupported={isFullscreenSupported}
            layoutMode={viewport.layoutMode}
            onEnterFullscreen={onEnterFullscreen}
            onInstall={onInstall}
            onOpenChange={onMenuOpenChange}
            onResetCamera={resetCamera}
            onRetryRuntime={onRetryRuntime}
            onResumeRuntime={onResumeRuntime}
            onSetCameraMode={onSetCameraMode}
            onShowMainMenuScene={onShowMainMenuScene}
            onShowPauseScene={onShowPauseScene}
            onToggleRuntimeFeedback={() => {
              onSetRuntimeFeedbackVisible(!preferences.runtimeFeedbackVisible);
            }}
            onToggleDiagnostics={handleToggleDiagnostics}
            onToggleInspecteur={handleToggleInspecteur}
            runtimeFeedbackVisible={preferences.runtimeFeedbackVisible}
          />
        ) : null}

        {showShellTools && inspecteurVisible ? (
          <EntityInspectionPanel
            entityChunk={`${selectedEntityChunk.x}, ${selectedEntityChunk.y}`}
            entityId={entityWorld.selectedEntity.id}
            entityLabel={entityWorld.selectedEntity.id.split(":").at(-1) ?? entityWorld.selectedEntity.id}
            entityPosition={`${Math.round(entityWorld.selectedEntity.worldPosition.x)}, ${Math.round(entityWorld.selectedEntity.worldPosition.y)}`}
            entitySelectionState={entityWorld.selectedEntity.isSelected ? "selected" : "not selected"}
            entityState={entityWorld.selectedEntity.state}
            isMobile={isMobileLayout}
            onClose={handleCloseInspectionPanel}
          />
        ) : null}

        {playerHudVisible ? (
          <PlayerHudCard
            buildActives={buildActives}
            buildPassives={buildPassives}
            currentLevel={simulationState.gameState.systems.progression.currentLevel}
            currentXp={simulationState.gameState.systems.progression.currentXp}
            fps={simulationState.runtime.fps}
            goldCollected={simulationState.gameState.systems.progression.goldCollected}
            isMobile={isMobileLayout}
            nextLevelXpRequired={simulationState.gameState.systems.progression.nextLevelXpRequired}
            phaseLabel={simulationState.gameState.systems.progression.phaseLabel}
            playerHealth={simulationState.entity.combat.currentHealth}
            playerHealthMax={simulationState.entity.combat.maxHealth}
            playerName={runtimeSession.playerName || "Wanderer"}
            playerPosition={simulationState.entity.worldPosition}
          />
        ) : null}

        {levelUpVisible ? (
          <RuntimeBuildChoicePanel
            choices={levelUpChoices}
            isMobile={isMobileLayout}
            onSelectChoice={handleSelectBuildChoice}
          />
        ) : null}

        {metaOverlay}

        {showShellTools && diagnosticsVisible ? (
          <ShellDiagnosticsPanel
            {...diagnosticsPanelProps}
            visible={diagnosticsVisible}
          />
        ) : null}
      </section>

      <MobileVirtualStickOverlay stickState={mobileVirtualStick} />
    </>
  );
}
