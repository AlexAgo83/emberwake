import { sampleDeterministicSignature } from "@engine/world/worldContract";

type ActiveWeaponAttackKind =
  | "auto-target"
  | "boomerang"
  | "chain"
  | "cone"
  | "fan"
  | "lob"
  | "nova"
  | "orbit"
  | "trail"
  | "vacuum"
  | "zone";

export type ActiveWeaponId =
  | "ash-lash"
  | "boomerang-arc"
  | "burning-trail"
  | "chain-lightning"
  | "guided-senbon"
  | "halo-burst"
  | "frost-nova"
  | "shade-kunai"
  | "cinder-arc"
  | "orbiting-blades"
  | "orbit-sutra"
  | "null-canister"
  | "vacuum-pulse";

export type PassiveItemId =
  | "boss-hunter"
  | "overclock-seal"
  | "emergency-aegis"
  | "execution-sigil"
  | "greed-engine"
  | "hardlight-sheath"
  | "thorn-mail"
  | "wideband-coil"
  | "echo-thread"
  | "duplex-relay"
  | "vacuum-tabi";

export type FusionId =
  | "afterimage-pyre"
  | "redline-ribbon"
  | "choir-of-pins"
  | "blackfile-volley"
  | "event-horizon"
  | "temple-circuit";

export type BuildChoiceSlotKind = "active" | "passive";
export type BuildChoiceSelectionKind = "fusion" | "new" | "upgrade";
export type BuildChoiceTrack = "combat" | "passive";

export type ActiveWeaponSlot = {
  fusionId: FusionId | null;
  lastAttackTick: number | null;
  level: number;
  weaponId: ActiveWeaponId;
};

export type PassiveItemSlot = {
  level: number;
  passiveId: PassiveItemId;
};

export type BuildChoice = {
  currentLevel: number;
  displayCategory: "active" | "fusion" | "passive";
  effectLine: string;
  fusionPathReady: boolean;
  id: string;
  iconId: ActiveWeaponId | FusionId | PassiveItemId;
  itemId: ActiveWeaponId | PassiveItemId;
  label: string;
  maxLevel: number;
  nextLevel: number;
  roleLine: string;
  selectionKind: BuildChoiceSelectionKind;
  slotKind: BuildChoiceSlotKind;
  track: BuildChoiceTrack;
};

export type BuildState = {
  activeSlots: ActiveWeaponSlot[];
  levelUpChoices: BuildChoice[];
  levelUpOfferSequence: number;
  levelUpPassesRemaining: number;
  levelUpRerollsRemaining: number;
  metaProgression: BuildMetaProgression;
  nextChestDefeatMilestone: number;
  passiveSlots: PassiveItemSlot[];
  pendingLevelUps: number;
  recentFusionId: FusionId | null;
};

export type BuildMetaProgression = {
  availableActiveWeaponIds: ActiveWeaponId[];
  availableFusionIds: FusionId[];
  availablePassiveItemIds: PassiveItemId[];
  levelUpPassCharges: number;
  levelUpRerollCharges: number;
  talentModifiers: {
    emergencyShieldCharges: number;
    goldGainMultiplier: number;
    maxHealthBonus: number;
    moveSpeedMultiplier: number;
    pickupRadiusMultiplier: number;
    xpGainMultiplier: number;
  };
  unlockedPickupKinds: Array<"gold" | "healing-kit" | "hourglass" | "magnet">;
};

export type ActiveWeaponDefinition = {
  attackKind: ActiveWeaponAttackKind;
  baseAreaRadiusWorldUnits?: number;
  baseArcRadians?: number;
  baseCooldownTicks: number;
  baseDamage: number;
  baseRangeWorldUnits: number;
  baseTargetCount: number;
  baseVisibleTicks?: number;
  cooldownStepTicks: number;
  damageStep: number;
  id: ActiveWeaponId;
  label: string;
  maxLevel: number;
  rangeStepWorldUnits: number;
  roleLine: string;
  targetCountStep: number;
  visibleTickStep?: number;
};

export type PassiveItemDefinition = {
  id: PassiveItemId;
  label: string;
  maxLevel: number;
  roleLine: string;
  statFamily:
    | "area"
    | "boss-damage"
    | "cooldown"
    | "damage"
    | "duration"
    | "economy"
    | "execute"
    | "guard"
    | "multiplicity"
    | "pickup-radius"
    | "retaliation";
};

export type FusionDefinition = {
  activeWeaponId: ActiveWeaponId;
  cooldownMultiplier: number;
  damageMultiplier: number;
  fusionId: FusionId;
  label: string;
  passiveItemId: PassiveItemId;
  roleLine: string;
  targetCountBonus: number;
};

export const buildSystemContract = {
  activeSlotLimit: 6,
  chestDefeatMilestoneStep: 7,
  initialChestDefeatMilestone: 7,
  passiveSlotLimit: 6,
  starterWeaponId: "ash-lash" as const
} as const;

const createDefaultBuildMetaProgression = (): BuildMetaProgression => ({
  availableActiveWeaponIds: [...activeWeaponIds],
  availableFusionIds: [...fusionIds],
  availablePassiveItemIds: [...passiveItemIds],
  levelUpPassCharges: 1,
  levelUpRerollCharges: 1,
  talentModifiers: {
    emergencyShieldCharges: 0,
    goldGainMultiplier: 1,
    maxHealthBonus: 0,
    moveSpeedMultiplier: 1,
    pickupRadiusMultiplier: 1,
    xpGainMultiplier: 1
  },
  unlockedPickupKinds: ["gold", "healing-kit", "magnet", "hourglass"]
});

const activeWeaponDefinitions: Record<ActiveWeaponId, ActiveWeaponDefinition> = {
  "ash-lash": {
    attackKind: "cone",
    baseArcRadians: (120 * Math.PI) / 180,
    baseCooldownTicks: 20,
    baseDamage: 22,
    baseRangeWorldUnits: 172,
    baseTargetCount: 6,
    baseVisibleTicks: 8,
    cooldownStepTicks: 1,
    damageStep: 4,
    id: "ash-lash",
    label: "Ash Lash",
    maxLevel: 8,
    rangeStepWorldUnits: 8,
    roleLine: "Short-range frontal sweep",
    targetCountStep: 1,
    visibleTickStep: 0
  },
  "guided-senbon": {
    attackKind: "auto-target",
    baseCooldownTicks: 36,
    baseDamage: 11,
    baseRangeWorldUnits: 330,
    baseTargetCount: 2,
    cooldownStepTicks: 1,
    damageStep: 3,
    id: "guided-senbon",
    label: "Guided Senbon",
    maxLevel: 8,
    rangeStepWorldUnits: 12,
    roleLine: "Auto-targeted precision burst",
    targetCountStep: 0
  },
  "chain-lightning": {
    attackKind: "chain",
    baseAreaRadiusWorldUnits: 138,
    baseCooldownTicks: 30,
    baseDamage: 18,
    baseRangeWorldUnits: 348,
    baseTargetCount: 3,
    baseVisibleTicks: 14,
    cooldownStepTicks: 1,
    damageStep: 3,
    id: "chain-lightning",
    label: "Chain Lightning",
    maxLevel: 8,
    rangeStepWorldUnits: 14,
    roleLine: "Arcing chain clear across clustered hostiles",
    targetCountStep: 1,
    visibleTickStep: 1
  },
  "shade-kunai": {
    attackKind: "fan",
    baseArcRadians: (50 * Math.PI) / 180,
    baseCooldownTicks: 24,
    baseDamage: 14,
    baseRangeWorldUnits: 260,
    baseTargetCount: 3,
    cooldownStepTicks: 1,
    damageStep: 3,
    id: "shade-kunai",
    label: "Shade Kunai",
    maxLevel: 8,
    rangeStepWorldUnits: 10,
    roleLine: "Forward burst with directional commitment",
    targetCountStep: 1
  },
  "cinder-arc": {
    attackKind: "lob",
    baseAreaRadiusWorldUnits: 92,
    baseCooldownTicks: 38,
    baseDamage: 28,
    baseRangeWorldUnits: 280,
    baseTargetCount: 4,
    cooldownStepTicks: 2,
    damageStep: 5,
    id: "cinder-arc",
    label: "Cinder Arc",
    maxLevel: 8,
    rangeStepWorldUnits: 10,
    roleLine: "Heavy lobbed strike with delayed impact",
    targetCountStep: 1
  },
  "burning-trail": {
    attackKind: "trail",
    baseAreaRadiusWorldUnits: 52,
    baseCooldownTicks: 22,
    baseDamage: 11,
    baseRangeWorldUnits: 184,
    baseTargetCount: 8,
    baseVisibleTicks: 22,
    cooldownStepTicks: 1,
    damageStep: 2,
    id: "burning-trail",
    label: "Burning Trail",
    maxLevel: 8,
    rangeStepWorldUnits: 9,
    roleLine: "Route-zoning burn line that rewards motion",
    targetCountStep: 1,
    visibleTickStep: 2
  },
  "boomerang-arc": {
    attackKind: "boomerang",
    baseArcRadians: (54 * Math.PI) / 180,
    baseAreaRadiusWorldUnits: 96,
    baseCooldownTicks: 28,
    baseDamage: 16,
    baseRangeWorldUnits: 292,
    baseTargetCount: 4,
    baseVisibleTicks: 16,
    cooldownStepTicks: 1,
    damageStep: 3,
    id: "boomerang-arc",
    label: "Boomerang Arc",
    maxLevel: 8,
    rangeStepWorldUnits: 11,
    roleLine: "Forward-and-return lane pressure blade",
    targetCountStep: 1,
    visibleTickStep: 1
  },
  "orbiting-blades": {
    attackKind: "orbit",
    baseAreaRadiusWorldUnits: 112,
    baseCooldownTicks: 24,
    baseDamage: 14,
    baseRangeWorldUnits: 112,
    baseTargetCount: 4,
    baseVisibleTicks: 24,
    cooldownStepTicks: 1,
    damageStep: 2,
    id: "orbiting-blades",
    label: "Orbiting Blades",
    maxLevel: 8,
    rangeStepWorldUnits: 6,
    roleLine: "Close orbit control ring",
    targetCountStep: 1,
    visibleTickStep: 1
  },
  "orbit-sutra": {
    attackKind: "orbit",
    baseAreaRadiusWorldUnits: 126,
    baseCooldownTicks: 26,
    baseDamage: 13,
    baseRangeWorldUnits: 126,
    baseTargetCount: 4,
    cooldownStepTicks: 1,
    damageStep: 2,
    id: "orbit-sutra",
    label: "Orbit Sutra",
    maxLevel: 8,
    rangeStepWorldUnits: 6,
    roleLine: "Orbiting scripture ring",
    targetCountStep: 1
  },
  "null-canister": {
    attackKind: "zone",
    baseAreaRadiusWorldUnits: 108,
    baseCooldownTicks: 32,
    baseDamage: 20,
    baseRangeWorldUnits: 248,
    baseTargetCount: 3,
    cooldownStepTicks: 1,
    damageStep: 4,
    id: "null-canister",
    label: "Null Canister",
    maxLevel: 8,
    rangeStepWorldUnits: 8,
    roleLine: "Thrown hush field",
    targetCountStep: 1
  },
  "halo-burst": {
    attackKind: "nova",
    baseAreaRadiusWorldUnits: 164,
    baseCooldownTicks: 42,
    baseDamage: 30,
    baseRangeWorldUnits: 164,
    baseTargetCount: 12,
    baseVisibleTicks: 18,
    cooldownStepTicks: 1,
    damageStep: 4,
    id: "halo-burst",
    label: "Halo Burst",
    maxLevel: 8,
    rangeStepWorldUnits: 8,
    roleLine: "Defensive burst around the shell",
    targetCountStep: 2,
    visibleTickStep: 1
  },
  "frost-nova": {
    attackKind: "nova",
    baseAreaRadiusWorldUnits: 188,
    baseCooldownTicks: 46,
    baseDamage: 17,
    baseRangeWorldUnits: 188,
    baseTargetCount: 10,
    baseVisibleTicks: 24,
    cooldownStepTicks: 1,
    damageStep: 3,
    id: "frost-nova",
    label: "Frost Nova",
    maxLevel: 8,
    rangeStepWorldUnits: 10,
    roleLine: "Crowd-control frost pulse with a defensive window",
    targetCountStep: 2,
    visibleTickStep: 1
  },
  "vacuum-pulse": {
    attackKind: "vacuum",
    baseAreaRadiusWorldUnits: 156,
    baseCooldownTicks: 34,
    baseDamage: 13,
    baseRangeWorldUnits: 156,
    baseTargetCount: 12,
    baseVisibleTicks: 20,
    cooldownStepTicks: 1,
    damageStep: 2,
    id: "vacuum-pulse",
    label: "Vacuum Pulse",
    maxLevel: 8,
    rangeStepWorldUnits: 8,
    roleLine: "Pickup-flow pulse that clears breathing room",
    targetCountStep: 2,
    visibleTickStep: 1
  }
};

const passiveItemDefinitions: Record<PassiveItemId, PassiveItemDefinition> = {
  "boss-hunter": {
    id: "boss-hunter",
    label: "Boss Hunter",
    maxLevel: 5,
    roleLine: "Focused finishing pressure against elite threats",
    statFamily: "boss-damage"
  },
  "duplex-relay": {
    id: "duplex-relay",
    label: "Duplex Relay",
    maxLevel: 5,
    roleLine: "Extra projectiles and duplicate casts",
    statFamily: "multiplicity"
  },
  "emergency-aegis": {
    id: "emergency-aegis",
    label: "Emergency Aegis",
    maxLevel: 5,
    roleLine: "Last-chance guard before the run collapses",
    statFamily: "guard"
  },
  "echo-thread": {
    id: "echo-thread",
    label: "Echo Thread",
    maxLevel: 5,
    roleLine: "Longer persistence and sustained pressure",
    statFamily: "duration"
  },
  "execution-sigil": {
    id: "execution-sigil",
    label: "Execution Sigil",
    maxLevel: 5,
    roleLine: "Execute weakened hostiles before they can stabilize",
    statFamily: "execute"
  },
  "greed-engine": {
    id: "greed-engine",
    label: "Greed Engine",
    maxLevel: 5,
    roleLine: "Turn the field economy into stronger long runs",
    statFamily: "economy"
  },
  "hardlight-sheath": {
    id: "hardlight-sheath",
    label: "Hardlight Sheath",
    maxLevel: 5,
    roleLine: "Sharper impact and heavier hits",
    statFamily: "damage"
  },
  "overclock-seal": {
    id: "overclock-seal",
    label: "Overclock Seal",
    maxLevel: 5,
    roleLine: "Faster cadence and cooler hands",
    statFamily: "cooldown"
  },
  "thorn-mail": {
    id: "thorn-mail",
    label: "Thorn Mail",
    maxLevel: 5,
    roleLine: "Reflect pressure back into contact-heavy swarms",
    statFamily: "retaliation"
  },
  "vacuum-tabi": {
    id: "vacuum-tabi",
    label: "Vacuum Tabi",
    maxLevel: 5,
    roleLine: "Wider pickup flow and run economy support",
    statFamily: "pickup-radius"
  },
  "wideband-coil": {
    id: "wideband-coil",
    label: "Wideband Coil",
    maxLevel: 5,
    roleLine: "Broader footprints and screen-space control",
    statFamily: "area"
  }
};

export const activeWeaponIds = Object.keys(activeWeaponDefinitions) as ActiveWeaponId[];
export const passiveItemIds = Object.keys(passiveItemDefinitions) as PassiveItemId[];

const fusionDefinitions: Record<FusionId, FusionDefinition> = {
  "afterimage-pyre": {
    activeWeaponId: "cinder-arc",
    cooldownMultiplier: 0.9,
    damageMultiplier: 1.28,
    fusionId: "afterimage-pyre",
    label: "Afterimage Pyre",
    passiveItemId: "echo-thread",
    roleLine: "Lingering cinder collapse with echo heat",
    targetCountBonus: 2
  },
  "blackfile-volley": {
    activeWeaponId: "shade-kunai",
    cooldownMultiplier: 0.82,
    damageMultiplier: 1.5,
    fusionId: "blackfile-volley",
    label: "Blackfile Volley",
    passiveItemId: "hardlight-sheath",
    roleLine: "Piercing blackfile burst",
    targetCountBonus: 3
  },
  "choir-of-pins": {
    activeWeaponId: "guided-senbon",
    cooldownMultiplier: 0.86,
    damageMultiplier: 1.32,
    fusionId: "choir-of-pins",
    label: "Choir of Pins",
    passiveItemId: "duplex-relay",
    roleLine: "Chained reacquiring pin chorus",
    targetCountBonus: 2
  },
  "event-horizon": {
    activeWeaponId: "null-canister",
    cooldownMultiplier: 0.88,
    damageMultiplier: 1.22,
    fusionId: "event-horizon",
    label: "Event Horizon",
    passiveItemId: "vacuum-tabi",
    roleLine: "Collapsed hush field that pulls the field inward",
    targetCountBonus: 2
  },
  "redline-ribbon": {
    activeWeaponId: "ash-lash",
    cooldownMultiplier: 0.72,
    damageMultiplier: 1.25,
    fusionId: "redline-ribbon",
    label: "Redline Ribbon",
    passiveItemId: "overclock-seal",
    roleLine: "Faster chained lash ribbons",
    targetCountBonus: 2
  },
  "temple-circuit": {
    activeWeaponId: "orbit-sutra",
    cooldownMultiplier: 0.85,
    damageMultiplier: 1.35,
    fusionId: "temple-circuit",
    label: "Temple Circuit",
    passiveItemId: "wideband-coil",
    roleLine: "Expanded orbit control field",
    targetCountBonus: 3
  }
};

export const fusionIds = Object.keys(fusionDefinitions) as FusionId[];

type PassiveModifierState = {
  areaMultiplier: number;
  bossDamageMultiplier: number;
  cooldownMultiplier: number;
  damageMultiplier: number;
  durationMultiplier: number;
  emergencyAegisChargeCount: number;
  executeThresholdRatio: number;
  goldGainMultiplier: number;
  pickupRadiusMultiplier: number;
  retaliationDamage: number;
  targetCountBonus: number;
};

export type ResolvedActiveWeaponRuntimeStats = {
  areaRadiusWorldUnits: number;
  arcRadians: number | null;
  attackKind: ActiveWeaponAttackKind;
  cooldownTicks: number;
  damage: number;
  fusionId: FusionId | null;
  label: string;
  rangeWorldUnits: number;
  roleLine: string;
  targetCount: number;
  visibleTicks: number;
  weaponId: ActiveWeaponId;
};

const deterministicHash = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const sortDeterministically = <T extends { id: string }>(items: readonly T[], salt: string) =>
  [...items].sort(
    (left, right) =>
      deterministicHash(`${salt}:${left.id}`) - deterministicHash(`${salt}:${right.id}`)
  );

const createPassiveModifierState = (buildState: BuildState): PassiveModifierState => {
  const modifiers: PassiveModifierState = {
    areaMultiplier: 1,
    bossDamageMultiplier: 1,
    cooldownMultiplier: 1,
    damageMultiplier: 1,
    durationMultiplier: 1,
    emergencyAegisChargeCount: 0,
    executeThresholdRatio: 0,
    goldGainMultiplier: 1,
    pickupRadiusMultiplier: 1,
    retaliationDamage: 0,
    targetCountBonus: 0
  };

  for (const passiveSlot of buildState.passiveSlots) {
    const bonusLevel = Math.max(0, passiveSlot.level - 1);

    switch (passiveSlot.passiveId) {
      case "overclock-seal":
        modifiers.cooldownMultiplier *= Math.max(0.55, 1 - 0.06 * passiveSlot.level);
        break;
      case "hardlight-sheath":
        modifiers.damageMultiplier *= 1 + 0.14 * passiveSlot.level;
        break;
      case "boss-hunter":
        modifiers.bossDamageMultiplier *= 1 + 0.18 * passiveSlot.level;
        break;
      case "wideband-coil":
        modifiers.areaMultiplier *= 1 + 0.12 * passiveSlot.level;
        break;
      case "echo-thread":
        modifiers.durationMultiplier *= 1 + 0.16 * passiveSlot.level;
        modifiers.areaMultiplier *= 1 + 0.04 * passiveSlot.level;
        break;
      case "execution-sigil":
        modifiers.executeThresholdRatio = Math.max(
          modifiers.executeThresholdRatio,
          0.1 + 0.04 * passiveSlot.level
        );
        break;
      case "greed-engine":
        modifiers.goldGainMultiplier *= 1 + 0.18 * passiveSlot.level;
        break;
      case "duplex-relay":
        modifiers.targetCountBonus += Math.max(1, passiveSlot.level - (passiveSlot.level > 3 ? 1 : 0));
        break;
      case "emergency-aegis":
        modifiers.emergencyAegisChargeCount = Math.max(
          modifiers.emergencyAegisChargeCount,
          passiveSlot.level >= 5 ? 2 : 1
        );
        break;
      case "thorn-mail":
        modifiers.retaliationDamage += 6 + passiveSlot.level * 6;
        break;
      case "vacuum-tabi":
        modifiers.pickupRadiusMultiplier *= 1 + 0.32 * passiveSlot.level;
        modifiers.targetCountBonus += Math.max(0, Math.floor(bonusLevel / 2));
        break;
    }
  }

  return modifiers;
};

const getFusionDefinitionForActiveWeapon = (weaponId: ActiveWeaponId) =>
  Object.values(fusionDefinitions).find((fusionDefinition) => fusionDefinition.activeWeaponId === weaponId) ??
  null;

const hasOwnedPassiveItem = (buildState: BuildState, passiveItemId: PassiveItemId) =>
  buildState.passiveSlots.some((passiveSlot) => passiveSlot.passiveId === passiveItemId);

export const getActiveWeaponDefinition = (weaponId: ActiveWeaponId) =>
  activeWeaponDefinitions[weaponId];

export const getPassiveItemDefinition = (passiveItemId: PassiveItemId) =>
  passiveItemDefinitions[passiveItemId];

export const getFusionDefinition = (fusionId: FusionId) => fusionDefinitions[fusionId];

export const listActiveWeaponDefinitions = () =>
  activeWeaponIds.map((weaponId) => activeWeaponDefinitions[weaponId]);

export const listPassiveItemDefinitions = () =>
  passiveItemIds.map((passiveItemId) => passiveItemDefinitions[passiveItemId]);

export const listFusionDefinitions = () =>
  fusionIds.map((fusionId) => fusionDefinitions[fusionId]);

export const createInitialBuildState = (): BuildState => ({
  activeSlots: [
    {
      fusionId: null,
      lastAttackTick: null,
      level: 1,
      weaponId: buildSystemContract.starterWeaponId
    }
  ],
  levelUpChoices: [],
  levelUpOfferSequence: 0,
  levelUpPassesRemaining: createDefaultBuildMetaProgression().levelUpPassCharges,
  levelUpRerollsRemaining: createDefaultBuildMetaProgression().levelUpRerollCharges,
  metaProgression: createDefaultBuildMetaProgression(),
  nextChestDefeatMilestone: buildSystemContract.initialChestDefeatMilestone,
  passiveSlots: [],
  pendingLevelUps: 0,
  recentFusionId: null
});

export const normalizeBuildState = (buildState: Partial<BuildState> | undefined): BuildState => {
  const initialBuildState = createInitialBuildState();
  const normalizedMetaProgression: BuildMetaProgression = {
    ...initialBuildState.metaProgression,
    ...buildState?.metaProgression,
    availableActiveWeaponIds:
      buildState?.metaProgression?.availableActiveWeaponIds ??
      initialBuildState.metaProgression.availableActiveWeaponIds,
    availableFusionIds:
      buildState?.metaProgression?.availableFusionIds ??
      initialBuildState.metaProgression.availableFusionIds,
    availablePassiveItemIds:
      buildState?.metaProgression?.availablePassiveItemIds ??
      initialBuildState.metaProgression.availablePassiveItemIds,
    levelUpPassCharges:
      buildState?.metaProgression?.levelUpPassCharges ??
      initialBuildState.metaProgression.levelUpPassCharges,
    levelUpRerollCharges:
      buildState?.metaProgression?.levelUpRerollCharges ??
      initialBuildState.metaProgression.levelUpRerollCharges,
    talentModifiers: {
      ...initialBuildState.metaProgression.talentModifiers,
      ...buildState?.metaProgression?.talentModifiers
    },
    unlockedPickupKinds:
      buildState?.metaProgression?.unlockedPickupKinds ??
      initialBuildState.metaProgression.unlockedPickupKinds
  };

  return {
    activeSlots:
      buildState?.activeSlots?.map((activeSlot) => ({
        fusionId: activeSlot.fusionId ?? null,
        lastAttackTick: activeSlot.lastAttackTick ?? null,
        level: Math.max(1, Math.min(activeSlot.level ?? 1, getActiveWeaponDefinition(activeSlot.weaponId).maxLevel)),
        weaponId: activeSlot.weaponId
    })) ?? initialBuildState.activeSlots,
    levelUpChoices: buildState?.levelUpChoices ?? [],
    levelUpOfferSequence: Math.max(
      0,
      buildState?.levelUpOfferSequence ?? initialBuildState.levelUpOfferSequence
    ),
    levelUpPassesRemaining: Math.max(
      0,
      buildState?.levelUpPassesRemaining ??
        buildState?.metaProgression?.levelUpPassCharges ??
        initialBuildState.levelUpPassesRemaining
    ),
    levelUpRerollsRemaining: Math.max(
      0,
      buildState?.levelUpRerollsRemaining ??
        buildState?.metaProgression?.levelUpRerollCharges ??
        initialBuildState.levelUpRerollsRemaining
    ),
    metaProgression: normalizedMetaProgression,
    nextChestDefeatMilestone:
      buildState?.nextChestDefeatMilestone ?? initialBuildState.nextChestDefeatMilestone,
    passiveSlots:
      buildState?.passiveSlots?.map((passiveSlot) => ({
        level: Math.max(
          1,
          Math.min(passiveSlot.level ?? 1, getPassiveItemDefinition(passiveSlot.passiveId).maxLevel)
        ),
        passiveId: passiveSlot.passiveId
      })) ?? initialBuildState.passiveSlots,
    pendingLevelUps: Math.max(0, buildState?.pendingLevelUps ?? initialBuildState.pendingLevelUps),
    recentFusionId: buildState?.recentFusionId ?? null
  };
};

export const resolveFusionReadyState = (
  buildState: BuildState,
  activeSlot: ActiveWeaponSlot
) => {
  if (activeSlot.fusionId !== null) {
    return null;
  }

  const fusionDefinition = getFusionDefinitionForActiveWeapon(activeSlot.weaponId);

  if (!fusionDefinition) {
    return null;
  }

  if (!buildState.metaProgression.availableFusionIds.includes(fusionDefinition.fusionId)) {
    return null;
  }

  const weaponDefinition = getActiveWeaponDefinition(activeSlot.weaponId);

  if (activeSlot.level < weaponDefinition.maxLevel) {
    return null;
  }

  return hasOwnedPassiveItem(buildState, fusionDefinition.passiveItemId) ? fusionDefinition : null;
};

export const resolveBuildDisplayLabel = (
  buildState: BuildState,
  activeSlot: ActiveWeaponSlot
) => {
  if (activeSlot.fusionId) {
    return getFusionDefinition(activeSlot.fusionId).label;
  }

  return getActiveWeaponDefinition(activeSlot.weaponId).label;
};

export const resolveActiveWeaponRuntimeStats = (
  buildState: BuildState,
  activeSlot: ActiveWeaponSlot
): ResolvedActiveWeaponRuntimeStats => {
  const weaponDefinition = getActiveWeaponDefinition(activeSlot.weaponId);
  const passiveModifiers = createPassiveModifierState(buildState);
  const fusionDefinition = activeSlot.fusionId ? getFusionDefinition(activeSlot.fusionId) : null;
  const levelBonus = Math.max(0, activeSlot.level - 1);
  const baseRange =
    weaponDefinition.baseRangeWorldUnits + weaponDefinition.rangeStepWorldUnits * levelBonus;
  const baseAreaRadius =
    weaponDefinition.baseAreaRadiusWorldUnits ?? weaponDefinition.baseRangeWorldUnits * 0.55;
  const baseVisibleTicks =
    (weaponDefinition.baseVisibleTicks ?? Math.max(6, Math.round(weaponDefinition.baseCooldownTicks * 0.45))) +
    (weaponDefinition.visibleTickStep ?? 0) * levelBonus;
  const baseTargetCount =
    weaponDefinition.baseTargetCount + weaponDefinition.targetCountStep * levelBonus;
  const cooldownBeforeFusion = Math.max(
    6,
    Math.round(
      (weaponDefinition.baseCooldownTicks - weaponDefinition.cooldownStepTicks * levelBonus) *
        passiveModifiers.cooldownMultiplier
    )
  );
  const damageBeforeFusion = Math.max(
    1,
    Math.round(
      (weaponDefinition.baseDamage + weaponDefinition.damageStep * levelBonus) *
        passiveModifiers.damageMultiplier
    )
  );
  const fusionAreaMultiplier =
    fusionDefinition?.fusionId === "afterimage-pyre"
      ? 1.26
      : fusionDefinition?.fusionId === "event-horizon"
        ? 1.22
        : 1;
  const fusionDurationMultiplier =
    fusionDefinition?.fusionId === "afterimage-pyre"
      ? 1.7
      : fusionDefinition?.fusionId === "event-horizon"
        ? 1.34
        : 1;
  const resolvedAttackKind =
    fusionDefinition?.fusionId === "event-horizon"
      ? "vacuum"
      : weaponDefinition.attackKind;

  return {
    areaRadiusWorldUnits: Math.round(
      baseAreaRadius * passiveModifiers.areaMultiplier * fusionAreaMultiplier
    ),
    arcRadians:
      weaponDefinition.baseArcRadians !== undefined
        ? weaponDefinition.baseArcRadians
        : null,
    attackKind: resolvedAttackKind,
    cooldownTicks: Math.max(
      5,
      Math.round(cooldownBeforeFusion * (fusionDefinition?.cooldownMultiplier ?? 1))
    ),
    damage: Math.max(
      1,
      Math.round(damageBeforeFusion * (fusionDefinition?.damageMultiplier ?? 1))
    ),
    fusionId: activeSlot.fusionId,
    label: fusionDefinition?.label ?? weaponDefinition.label,
    rangeWorldUnits: Math.round(baseRange * passiveModifiers.areaMultiplier),
    roleLine: fusionDefinition?.roleLine ?? weaponDefinition.roleLine,
    targetCount: Math.max(
      1,
      baseTargetCount + passiveModifiers.targetCountBonus + (fusionDefinition?.targetCountBonus ?? 0)
    ),
    visibleTicks: Math.max(
      6,
      Math.round(baseVisibleTicks * passiveModifiers.durationMultiplier * (fusionDefinition ? fusionDurationMultiplier : 1))
    ),
    weaponId: activeSlot.weaponId
  };
};

export const resolvePickupRadiusMultiplier = (buildState: BuildState) =>
  createPassiveModifierState(buildState).pickupRadiusMultiplier *
  buildState.metaProgression.talentModifiers.pickupRadiusMultiplier;

export const resolveBossDamageMultiplier = (buildState: BuildState) =>
  createPassiveModifierState(buildState).bossDamageMultiplier;

export const resolveEmergencyAegisChargeCount = (buildState: BuildState) =>
  createPassiveModifierState(buildState).emergencyAegisChargeCount +
  buildState.metaProgression.talentModifiers.emergencyShieldCharges;

export const resolveExecuteThresholdRatio = (buildState: BuildState) =>
  createPassiveModifierState(buildState).executeThresholdRatio;

export const resolveGoldGainMultiplier = (buildState: BuildState) =>
  createPassiveModifierState(buildState).goldGainMultiplier *
  buildState.metaProgression.talentModifiers.goldGainMultiplier;

export const resolveMaxHealthBonus = (buildState: BuildState) =>
  buildState.metaProgression.talentModifiers.maxHealthBonus;

export const resolveMoveSpeedMultiplier = (buildState: BuildState) =>
  buildState.metaProgression.talentModifiers.moveSpeedMultiplier;

export const resolveRetaliationDamage = (buildState: BuildState) =>
  createPassiveModifierState(buildState).retaliationDamage;

export const resolveXpGainMultiplier = (buildState: BuildState) =>
  buildState.metaProgression.talentModifiers.xpGainMultiplier;

const createActiveUnlockChoice = (
  buildState: BuildState,
  weaponId: ActiveWeaponId
): BuildChoice => {
  const weaponDefinition = getActiveWeaponDefinition(weaponId);
  const readyFusion = resolveFusionReadyState(buildState, {
    fusionId: null,
    lastAttackTick: null,
    level: 1,
    weaponId
  });

  return {
    currentLevel: 0,
    displayCategory: "active",
    effectLine: `Unlock ${weaponDefinition.roleLine.toLowerCase()}.`,
    fusionPathReady: readyFusion !== null,
    id: `choice:active:new:${weaponId}`,
    iconId: weaponId,
    itemId: weaponId,
    label: weaponDefinition.label,
    maxLevel: weaponDefinition.maxLevel,
    nextLevel: 1,
    roleLine: weaponDefinition.roleLine,
    selectionKind: "new",
    slotKind: "active",
    track: "combat"
  };
};

const createPassiveUnlockChoice = (
  buildState: BuildState,
  passiveItemId: PassiveItemId
): BuildChoice => {
  const passiveDefinition = getPassiveItemDefinition(passiveItemId);
  const opensFusionPath = buildState.activeSlots.some((activeSlot) => {
    const fusionDefinition = getFusionDefinitionForActiveWeapon(activeSlot.weaponId);
    return fusionDefinition?.passiveItemId === passiveItemId;
  });

  return {
    currentLevel: 0,
    displayCategory: "passive",
    effectLine: `Unlock ${passiveDefinition.roleLine.toLowerCase()}.`,
    fusionPathReady: opensFusionPath,
    id: `choice:passive:new:${passiveItemId}`,
    iconId: passiveItemId,
    itemId: passiveItemId,
    label: passiveDefinition.label,
    maxLevel: passiveDefinition.maxLevel,
    nextLevel: 1,
    roleLine: passiveDefinition.roleLine,
    selectionKind: "new",
    slotKind: "passive",
    track: "passive"
  };
};

const createActiveUpgradeChoice = (
  buildState: BuildState,
  activeSlot: ActiveWeaponSlot
): BuildChoice => {
  const weaponDefinition = getActiveWeaponDefinition(activeSlot.weaponId);
  const nextLevel = Math.min(weaponDefinition.maxLevel, activeSlot.level + 1);
  const fusionReady =
    nextLevel >= weaponDefinition.maxLevel &&
    resolveFusionReadyState(buildState, { ...activeSlot, level: nextLevel }) !== null;

  return {
    currentLevel: activeSlot.level,
    displayCategory: activeSlot.fusionId ? "fusion" : "active",
    effectLine: `Lv ${activeSlot.level} -> ${nextLevel}: faster cadence and stronger pressure.`,
    fusionPathReady: fusionReady,
    id: `choice:active:upgrade:${activeSlot.weaponId}`,
    iconId: activeSlot.fusionId ?? activeSlot.weaponId,
    itemId: activeSlot.weaponId,
    label: resolveBuildDisplayLabel(buildState, activeSlot),
    maxLevel: weaponDefinition.maxLevel,
    nextLevel,
    roleLine: weaponDefinition.roleLine,
    selectionKind: "upgrade",
    slotKind: "active",
    track: "combat"
  };
};

const createPassiveUpgradeChoice = (passiveSlot: PassiveItemSlot): BuildChoice => {
  const passiveDefinition = getPassiveItemDefinition(passiveSlot.passiveId);
  const nextLevel = Math.min(passiveDefinition.maxLevel, passiveSlot.level + 1);

  return {
    currentLevel: passiveSlot.level,
    displayCategory: "passive",
    effectLine: `Lv ${passiveSlot.level} -> ${nextLevel}: deepen ${passiveDefinition.statFamily.replace("-", " ")} support.`,
    fusionPathReady: false,
    id: `choice:passive:upgrade:${passiveSlot.passiveId}`,
    iconId: passiveSlot.passiveId,
    itemId: passiveSlot.passiveId,
    label: passiveDefinition.label,
    maxLevel: passiveDefinition.maxLevel,
    nextLevel,
    roleLine: passiveDefinition.roleLine,
    selectionKind: "upgrade",
    slotKind: "passive",
    track: "passive"
  };
};

const createFusionChoice = (
  activeSlot: ActiveWeaponSlot,
  fusionDefinition: FusionDefinition
): BuildChoice => ({
  currentLevel: activeSlot.level,
  displayCategory: "fusion",
  effectLine: `Fuse ${getActiveWeaponDefinition(activeSlot.weaponId).label} with ${getPassiveItemDefinition(fusionDefinition.passiveItemId).label}.`,
  fusionPathReady: true,
  iconId: fusionDefinition.fusionId,
  id: `choice:active:fusion:${fusionDefinition.fusionId}`,
  itemId: activeSlot.weaponId,
  label: fusionDefinition.label,
  maxLevel: getActiveWeaponDefinition(activeSlot.weaponId).maxLevel,
  nextLevel: activeSlot.level,
  roleLine: fusionDefinition.roleLine,
  selectionKind: "fusion",
  slotKind: "active",
  track: "combat"
});

const takeDeterministicSlice = <T extends { id: string }>(
  items: readonly T[],
  count: number,
  salt: string
) => sortDeterministically(items, salt).slice(0, count);

const resolveCombatTrackChoices = (
  buildState: BuildState,
  tick: number
): BuildChoice[] => {
  const ownedActiveIds = new Set(buildState.activeSlots.map((activeSlot) => activeSlot.weaponId));
  const unownedActives = buildState.metaProgression.availableActiveWeaponIds
    .filter((weaponId) => !ownedActiveIds.has(weaponId))
    .map((weaponId) => createActiveUnlockChoice(buildState, weaponId));
  const fusionChoices = buildState.activeSlots
    .map((activeSlot) => {
      const fusionDefinition = resolveFusionReadyState(buildState, activeSlot);
      return fusionDefinition ? createFusionChoice(activeSlot, fusionDefinition) : null;
    })
    .filter((choice): choice is BuildChoice => choice !== null);
  const activeUpgrades = buildState.activeSlots
    .filter(
      (activeSlot) => activeSlot.level < getActiveWeaponDefinition(activeSlot.weaponId).maxLevel
    )
    .map((activeSlot) => createActiveUpgradeChoice(buildState, activeSlot));
  const totalOwned = buildState.activeSlots.length + buildState.passiveSlots.length;
  const preferredNewChoices =
    totalOwned < 4
      ? 2
      : totalOwned < 7
        ? 1
        : 0;
  const choices: BuildChoice[] = [];
  const pushUniqueChoice = (choice: BuildChoice) => {
    if (choices.some((existingChoice) => existingChoice.id === choice.id)) {
      return;
    }

    choices.push(choice);
  };

  for (const choice of takeDeterministicSlice(fusionChoices, 3, `fusion:${tick}`)) {
    pushUniqueChoice(choice);
  }

  if (buildState.activeSlots.length < buildSystemContract.activeSlotLimit) {
    for (const choice of takeDeterministicSlice(
      unownedActives,
      Math.max(0, preferredNewChoices - choices.length),
      `active:${tick}`
    )) {
      pushUniqueChoice(choice);
    }
  }

  for (const choice of takeDeterministicSlice(activeUpgrades, 3, `combat-upgrade:${tick}:${totalOwned}`)) {
    if (choices.length >= 3) {
      break;
    }

    pushUniqueChoice(choice);
  }

  if (choices.length < 3 && buildState.activeSlots.length < buildSystemContract.activeSlotLimit) {
    for (const choice of takeDeterministicSlice(unownedActives, 3, `combat-fallback-active:${tick}`)) {
      if (choices.length >= 3) {
        break;
      }
      pushUniqueChoice(choice);
    }
  }

  if (choices.length < 3) {
    for (const choice of takeDeterministicSlice(fusionChoices, 3, `combat-fallback-fusion:${tick}`)) {
      if (choices.length >= 3) {
        break;
      }
      pushUniqueChoice(choice);
    }
  }

  return choices.slice(0, 3);
};

const resolvePassiveTrackChoices = (
  buildState: BuildState,
  tick: number
): BuildChoice[] => {
  const ownedPassiveIds = new Set(buildState.passiveSlots.map((passiveSlot) => passiveSlot.passiveId));
  const unownedPassives = buildState.metaProgression.availablePassiveItemIds
    .filter((passiveItemId) => !ownedPassiveIds.has(passiveItemId))
    .map((passiveItemId) => createPassiveUnlockChoice(buildState, passiveItemId));
  const passiveUpgrades = buildState.passiveSlots
    .filter(
      (passiveSlot) => passiveSlot.level < getPassiveItemDefinition(passiveSlot.passiveId).maxLevel
    )
    .map((passiveSlot) => createPassiveUpgradeChoice(passiveSlot));
  const totalOwned = buildState.activeSlots.length + buildState.passiveSlots.length;
  const preferredNewChoices =
    totalOwned < 4
      ? 2
      : totalOwned < 7
        ? 1
        : 0;
  const choices: BuildChoice[] = [];
  const pushUniqueChoice = (choice: BuildChoice) => {
    if (choices.some((existingChoice) => existingChoice.id === choice.id)) {
      return;
    }

    choices.push(choice);
  };

  if (buildState.passiveSlots.length < buildSystemContract.passiveSlotLimit) {
    for (const choice of takeDeterministicSlice(unownedPassives, preferredNewChoices, `passive:${tick}`)) {
      pushUniqueChoice(choice);
    }
  }

  for (const choice of takeDeterministicSlice(passiveUpgrades, 3, `passive-upgrade:${tick}:${totalOwned}`)) {
    if (choices.length >= 3) {
      break;
    }

    pushUniqueChoice(choice);
  }

  if (choices.length < 3 && buildState.passiveSlots.length < buildSystemContract.passiveSlotLimit) {
    for (const choice of takeDeterministicSlice(unownedPassives, 3, `passive-fallback:${tick}`)) {
      if (choices.length >= 3) {
        break;
      }
      pushUniqueChoice(choice);
    }
  }

  return choices.slice(0, 3);
};

export const resolveLevelUpChoices = (
  buildState: BuildState,
  tick: number
): BuildChoice[] => [...resolveCombatTrackChoices(buildState, tick), ...resolvePassiveTrackChoices(buildState, tick)];

const getChoiceSignature = (choices: readonly BuildChoice[]) => choices.map((choice) => choice.id).join("|");

const refreshLevelUpChoices = (
  buildState: BuildState,
  tick: number,
  previousChoices: readonly BuildChoice[] = []
): Pick<BuildState, "levelUpChoices" | "levelUpOfferSequence"> => {
  const previousSignature = getChoiceSignature(previousChoices);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const levelUpOfferSequence = buildState.levelUpOfferSequence + attempt + 1;
    const levelUpChoices = resolveLevelUpChoices(buildState, tick + levelUpOfferSequence * 17);

    if (previousSignature.length === 0 || getChoiceSignature(levelUpChoices) !== previousSignature) {
      return {
        levelUpChoices,
        levelUpOfferSequence
      };
    }
  }

  return {
    levelUpChoices: resolveLevelUpChoices(buildState, tick + (buildState.levelUpOfferSequence + 1) * 17),
    levelUpOfferSequence: buildState.levelUpOfferSequence + 1
  };
};

const syncChoicesIfNeeded = (buildState: BuildState, tick: number): BuildState => {
  if (buildState.pendingLevelUps <= 0 || buildState.levelUpChoices.length > 0) {
    return buildState;
  }

  const refreshed = refreshLevelUpChoices(buildState, tick);

  return {
    ...buildState,
    ...refreshed
  };
};

export const addPendingLevelUps = (
  buildState: BuildState,
  levelCount: number,
  tick: number
): BuildState =>
  syncChoicesIfNeeded(
    {
      ...buildState,
      pendingLevelUps: buildState.pendingLevelUps + Math.max(0, levelCount),
      recentFusionId: null
    },
    tick
  );

export const applyLevelUpChoice = (
  buildState: BuildState,
  choiceIndex: number,
  tick: number
): BuildState => {
  const choice = buildState.levelUpChoices[choiceIndex];

  if (!choice) {
    return buildState;
  }

  const nextBuildState: BuildState = {
    ...buildState,
    activeSlots: buildState.activeSlots.map((activeSlot) => ({ ...activeSlot })),
    levelUpChoices: [],
    passiveSlots: buildState.passiveSlots.map((passiveSlot) => ({ ...passiveSlot })),
    pendingLevelUps: Math.max(0, buildState.pendingLevelUps - 1),
    recentFusionId: null
  };

  if (choice.slotKind === "active") {
    const weaponId = choice.itemId as ActiveWeaponId;

    if (choice.selectionKind === "fusion") {
      nextBuildState.activeSlots = nextBuildState.activeSlots.map((activeSlot) =>
        activeSlot.weaponId === weaponId
          ? {
              ...activeSlot,
              fusionId: choice.iconId as FusionId,
              lastAttackTick: null
            }
          : activeSlot
      );
      nextBuildState.recentFusionId = choice.iconId as FusionId;
    } else if (choice.selectionKind === "new") {
      nextBuildState.activeSlots.push({
        fusionId: null,
        lastAttackTick: null,
        level: 1,
        weaponId
      });
    } else {
      nextBuildState.activeSlots = nextBuildState.activeSlots.map((activeSlot) =>
        activeSlot.weaponId === weaponId
          ? {
              ...activeSlot,
              level: Math.min(
                activeSlot.level + 1,
                getActiveWeaponDefinition(activeSlot.weaponId).maxLevel
              )
            }
          : activeSlot
      );
    }
  } else {
    const passiveItemId = choice.itemId as PassiveItemId;

    if (choice.selectionKind === "new") {
      nextBuildState.passiveSlots.push({
        level: 1,
        passiveId: passiveItemId
      });
    } else {
      nextBuildState.passiveSlots = nextBuildState.passiveSlots.map((passiveSlot) =>
        passiveSlot.passiveId === passiveItemId
          ? {
              ...passiveSlot,
              level: Math.min(
                passiveSlot.level + 1,
                getPassiveItemDefinition(passiveSlot.passiveId).maxLevel
              )
            }
          : passiveSlot
      );
    }
  }

  return syncChoicesIfNeeded(nextBuildState, tick);
};

export const rerollLevelUpChoices = (buildState: BuildState, tick: number): BuildState => {
  if (buildState.levelUpChoices.length === 0 || buildState.levelUpRerollsRemaining <= 0) {
    return buildState;
  }

  const refreshed = refreshLevelUpChoices(
    {
      ...buildState,
      levelUpRerollsRemaining: buildState.levelUpRerollsRemaining - 1
    },
    tick,
    buildState.levelUpChoices
  );

  return {
    ...buildState,
    ...refreshed,
    levelUpRerollsRemaining: buildState.levelUpRerollsRemaining - 1
  };
};

export const passLevelUpChoices = (buildState: BuildState, tick: number): BuildState => {
  if (buildState.levelUpChoices.length === 0 || buildState.levelUpPassesRemaining <= 0) {
    return buildState;
  }

  return syncChoicesIfNeeded(
    {
      ...buildState,
      levelUpChoices: [],
      levelUpPassesRemaining: buildState.levelUpPassesRemaining - 1,
      pendingLevelUps: Math.max(0, buildState.pendingLevelUps - 1),
      recentFusionId: null
    },
    tick
  );
};

const upgradeChestCandidate = (
  buildState: BuildState,
  tick: number
): BuildState => {
  const activeCandidates = buildState.activeSlots.filter(
    (activeSlot) => activeSlot.level < getActiveWeaponDefinition(activeSlot.weaponId).maxLevel
  );
  const passiveCandidates = buildState.passiveSlots.filter(
    (passiveSlot) => passiveSlot.level < getPassiveItemDefinition(passiveSlot.passiveId).maxLevel
  );
  const upgradeCandidates = sortDeterministically(
    [
      ...activeCandidates.map((activeSlot) => ({
        id: `active:${activeSlot.weaponId}`,
        slotKind: "active" as const
      })),
      ...passiveCandidates.map((passiveSlot) => ({
        id: `passive:${passiveSlot.passiveId}`,
        slotKind: "passive" as const
      }))
    ],
    `chest:${tick}`
  );
  const chosenCandidate = upgradeCandidates[0];

  if (!chosenCandidate) {
    return buildState;
  }

  if (chosenCandidate.slotKind === "active") {
    const weaponId = chosenCandidate.id.replace("active:", "") as ActiveWeaponId;

    return {
      ...buildState,
      activeSlots: buildState.activeSlots.map((activeSlot) =>
        activeSlot.weaponId === weaponId
          ? {
              ...activeSlot,
              level: Math.min(
                activeSlot.level + 1,
                getActiveWeaponDefinition(activeSlot.weaponId).maxLevel
              )
            }
          : activeSlot
      )
    };
  }

  const passiveItemId = chosenCandidate.id.replace("passive:", "") as PassiveItemId;

  return {
    ...buildState,
    passiveSlots: buildState.passiveSlots.map((passiveSlot) =>
      passiveSlot.passiveId === passiveItemId
        ? {
            ...passiveSlot,
            level: Math.min(
              passiveSlot.level + 1,
              getPassiveItemDefinition(passiveSlot.passiveId).maxLevel
            )
          }
        : passiveSlot
    )
  };
};

export const resolveChestReward = (buildState: BuildState, tick: number): BuildState => {
  const readyFusionSlot = buildState.activeSlots.find(
    (activeSlot) => resolveFusionReadyState(buildState, activeSlot) !== null
  );

  if (readyFusionSlot) {
    const readyFusion = resolveFusionReadyState(buildState, readyFusionSlot)!;

    return {
      ...buildState,
      activeSlots: buildState.activeSlots.map((activeSlot) =>
        activeSlot.weaponId === readyFusion.activeWeaponId
          ? {
              ...activeSlot,
              fusionId: readyFusion.fusionId,
              lastAttackTick: null
            }
          : activeSlot
      ),
      recentFusionId: readyFusion.fusionId
    };
  }

  return {
    ...upgradeChestCandidate(buildState, tick),
    recentFusionId: null
  };
};

type MiniBossChestRewardResult = {
  buildState: BuildState;
  upgradedSkillLabels: string[];
};

const listUpgradeableChestCandidates = (buildState: BuildState) => [
  ...buildState.activeSlots
    .filter((activeSlot) => activeSlot.level < getActiveWeaponDefinition(activeSlot.weaponId).maxLevel)
    .map((activeSlot) => ({
      id: `active:${activeSlot.weaponId}`,
      label: resolveBuildDisplayLabel(buildState, activeSlot),
      slotKind: "active" as const
    })),
  ...buildState.passiveSlots
    .filter((passiveSlot) => passiveSlot.level < getPassiveItemDefinition(passiveSlot.passiveId).maxLevel)
    .map((passiveSlot) => ({
      id: `passive:${passiveSlot.passiveId}`,
      label: getPassiveItemDefinition(passiveSlot.passiveId).label,
      slotKind: "passive" as const
    }))
];

export const resolveMiniBossChestReward = (
  buildState: BuildState,
  tick: number
): MiniBossChestRewardResult => {
  const upgradeCountTarget =
    1 + (sampleDeterministicSignature(`miniboss-chest:${tick}`) % 3);
  let nextBuildState = {
    ...buildState,
    activeSlots: buildState.activeSlots.map((activeSlot) => ({ ...activeSlot })),
    passiveSlots: buildState.passiveSlots.map((passiveSlot) => ({ ...passiveSlot })),
    recentFusionId: null
  };
  const upgradedSkillLabels: string[] = [];
  const seenCandidateIds = new Set<string>();

  for (let rewardIndex = 0; rewardIndex < upgradeCountTarget; rewardIndex += 1) {
    const candidate = sortDeterministically(
      listUpgradeableChestCandidates(nextBuildState).filter(
        (upgradeCandidate) => !seenCandidateIds.has(upgradeCandidate.id)
      ),
      `miniboss-chest:${tick}:${rewardIndex}`
    )[0];

    if (!candidate) {
      break;
    }

    seenCandidateIds.add(candidate.id);
    upgradedSkillLabels.push(candidate.label);

    if (candidate.slotKind === "active") {
      const weaponId = candidate.id.replace("active:", "") as ActiveWeaponId;

      nextBuildState = {
        ...nextBuildState,
        activeSlots: nextBuildState.activeSlots.map((activeSlot) =>
          activeSlot.weaponId === weaponId
            ? {
                ...activeSlot,
                level: Math.min(
                  activeSlot.level + 1,
                  getActiveWeaponDefinition(activeSlot.weaponId).maxLevel
                )
              }
            : activeSlot
        )
      };
      continue;
    }

    const passiveItemId = candidate.id.replace("passive:", "") as PassiveItemId;
    nextBuildState = {
      ...nextBuildState,
      passiveSlots: nextBuildState.passiveSlots.map((passiveSlot) =>
        passiveSlot.passiveId === passiveItemId
          ? {
              ...passiveSlot,
              level: Math.min(
                passiveSlot.level + 1,
                getPassiveItemDefinition(passiveSlot.passiveId).maxLevel
              )
            }
          : passiveSlot
      )
    };
  }

  return {
    buildState: nextBuildState,
    upgradedSkillLabels
  };
};

export const resolveChestDropCount = (
  buildState: BuildState,
  hostileDefeatCountAfterUpdate: number
) =>
  hostileDefeatCountAfterUpdate >= buildState.nextChestDefeatMilestone ? 1 : 0;

export const advanceChestMilestone = (buildState: BuildState): BuildState => ({
  ...buildState,
  nextChestDefeatMilestone:
    buildState.nextChestDefeatMilestone + buildSystemContract.chestDefeatMilestoneStep
});

export const resolveBuildSummary = (buildState: BuildState) => ({
  activeCount: buildState.activeSlots.length,
  fusedActiveCount: buildState.activeSlots.filter((activeSlot) => activeSlot.fusionId !== null).length,
  fusionReadyCount: buildState.activeSlots.filter(
    (activeSlot) => resolveFusionReadyState(buildState, activeSlot) !== null
  ).length,
  passiveCount: buildState.passiveSlots.length,
  pendingChoiceCount: buildState.levelUpChoices.length
});

export const recordActiveWeaponAttack = (
  buildState: BuildState,
  weaponId: ActiveWeaponId,
  tick: number
): BuildState => ({
  ...buildState,
  activeSlots: buildState.activeSlots.map((activeSlot) =>
    activeSlot.weaponId === weaponId
      ? {
          ...activeSlot,
          lastAttackTick: tick
        }
      : activeSlot
  )
});
