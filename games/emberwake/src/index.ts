export {
  advanceEmberwakeSimulationState,
  createInitialEmberwakeGameState,
  createInitialEmberwakeSimulationState,
  emberwakeGameModule
} from "./runtime/emberwakeGameModule";
export {
  createEmberwakeRuntimeRunner,
  createEngineInputFrameFromControlState
} from "./runtime/emberwakeRuntimeRunner";
export {
  createDeterministicRuntimeSupportEntities,
  emberwakeRuntimeBootstrap
} from "./runtime/emberwakeRuntimeBootstrap";
export {
  advanceSimulationState,
  createInitialSimulationState,
  entitySimulationContract,
  getScriptedEntityPhase
} from "./runtime/entitySimulation";
export { pickupContract } from "./runtime/pickupContract";
export {
  addPendingLevelUps,
  activeWeaponIds,
  fusionIds,
  applyLevelUpChoice,
  buildSystemContract,
  createInitialBuildState,
  getActiveWeaponDefinition,
  getFusionDefinition,
  getPassiveItemDefinition,
  listActiveWeaponDefinitions,
  listFusionDefinitions,
  listPassiveItemDefinitions,
  normalizeBuildState,
  passiveItemIds,
  recordActiveWeaponAttack,
  resolveActiveWeaponRuntimeStats,
  resolveBossDamageMultiplier,
  resolveBuildDisplayLabel,
  resolveBuildSummary,
  resolveChestDropCount,
  resolveChestReward,
  resolveEmergencyAegisChargeCount,
  resolveExecuteThresholdRatio,
  resolveFusionReadyState,
  resolveGoldGainMultiplier,
  resolveLevelUpChoices,
  resolveMaxHealthBonus,
  resolveMoveSpeedMultiplier,
  resolvePickupRadiusMultiplier,
  resolveRetaliationDamage,
  resolveXpGainMultiplier,
  advanceChestMilestone
} from "./runtime/buildSystem";
export {
  createIdleMovementIntent,
  createKeyboardMovementIntent,
  createMovementIntent,
  singleEntityControlContract
} from "./input/singleEntityControlContract";
export { gameplayTuning } from "./config/gameplayTuning";
export { systemTuning } from "./config/systemTuning";
export type {
  CombatSkillFeedbackEvent,
  EntitySimulationState,
  SimulatedEntity,
  SimulationSpeedOption
} from "./runtime/entitySimulation";
export type {
  ActiveWeaponId,
  ActiveWeaponDefinition,
  ActiveWeaponSlot,
  BuildChoice,
  BuildMetaProgression,
  BuildChoiceSelectionKind,
  BuildChoiceSlotKind,
  BuildState,
  FusionId,
  FusionDefinition,
  PassiveItemId,
  PassiveItemDefinition,
  PassiveItemSlot,
  ResolvedActiveWeaponRuntimeStats
} from "./runtime/buildSystem";
export type {
  InputOwner,
  MovementIntent,
  MovementIntentSource,
  SingleEntityControlState
} from "./input/singleEntityControlContract";
export { createDeterministicDebugEntities } from "./runtime/debugEntities";
export {
  emberwakeContentAuthoringContract,
  validateEmberwakeContentAuthoring
} from "./content/contentAuthoring";
export {
  createGenericMoverEntity,
  entityContract
} from "./content/entities/entityContract";
export type {
  EntityState,
  PresentedEntity,
  WorldEntity
} from "./content/entities/entityContract";
export {
  entityArchetypeDefinitions,
  entityVisualDefinitions
} from "./content/entities/entityData";
export {
  creatureCodexEntries,
  creatureCodexIds,
  getCreatureCodexEntry,
  resolveCreatureCodexIdFromVisualKind
} from "./content/entities/creatureCodex";
export type {
  EntityArchetypeId,
  EntityVisualKind
} from "./content/entities/entityData";
export type { CreatureCodexEntry, CreatureCodexId } from "./content/entities/creatureCodex";
export {
  debugScenarioAuthoringContract,
  officialDebugScenario,
  validateOfficialDebugScenario
} from "./content/scenarios/officialDebugScenario";
export {
  chunkGenerationContract,
  createGeneratedChunk,
  sampleChunkWorldArea
} from "./content/world/worldGeneration";
export type {
  GeneratedChunk,
  GeneratedTerrainTile
} from "./content/world/worldGeneration";
export { createChunkDebugData } from "./content/world/chunkDebugData";
export type { ChunkDebugData } from "./content/world/chunkDebugData";
export { terrainDefinitions, terrainKinds } from "./content/world/worldData";
export type { TerrainKind } from "./content/world/worldData";
export {
  createDefaultEmberwakeRuntimeSessionState,
  emberwakeRuntimeSessionSeedOptions
} from "./runtime/emberwakeSession";
export {
  defaultRuntimeProfilingConfig,
  resolveRuntimeProfilingConfig
} from "./runtime/runtimeProfiling";
export {
  getHostileSpawnProfile
} from "./runtime/hostilePressure";
export {
  getMissionStage,
  missionExitWorldPosition
} from "./runtime/missionLoop";
export {
  initialRunProgressionPhaseId,
  resolveNextRunProgressionPhase,
  resolveRunProgressionPhase,
  runProgressionPhases
} from "./runtime/runProgressionPhases";
export type {
  ProfilingSpawnMode,
  RuntimeProfilingConfig
} from "./runtime/runtimeProfiling";
export type { RunProgressionPhase, RunProgressionPhaseId } from "./runtime/runProgressionPhases";
export {
  advanceGameplaySystemsState,
  createGameplaySystemDiagnostics,
  createInitialGameplaySystemsState,
  gameplaySystemsContract,
  normalizeGameplaySystemsState
} from "./systems/gameplaySystems";
export {
  createIdleGameplayOutcome,
  gameplayOutcomeContract
} from "./systems/gameplayOutcome";
export {
  emberwakeRenderBoundaryContract,
  emberwakeRuntimeRenderLayerOrder,
  emberwakeRuntimeRenderLayers
} from "./presentation/emberwakeRenderLayers";
export { emberwakeRenderPerformanceContract } from "./presentation/emberwakeRenderPerformance";
export type { EmberwakeRenderSurfaceMode } from "./presentation/emberwakeRenderPerformance";
export type { EmberwakeRuntimeRenderLayerId } from "./presentation/emberwakeRenderLayers";
export type { EmberwakeGameAction, EmberwakeGameState } from "./runtime/emberwakeGameModule";
export type {
  AutonomySystemState,
  CombatSystemState,
  EmberwakeGameplaySystemsState,
  ProgressionSystemState,
  StatusEffectSystemState
} from "./systems/gameplaySystems";
export type {
  GameplayOutcomeKind,
  GameplayShellOutcome,
  GameplayShellSceneHint,
  SkillPerformanceSummary
} from "./systems/gameplayOutcome";
