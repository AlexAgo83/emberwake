type ActiveWeaponAttackKind = "auto-target" | "cone" | "fan" | "lob" | "orbit" | "zone";

export type ActiveWeaponId =
  | "ash-lash"
  | "guided-senbon"
  | "shade-kunai"
  | "cinder-arc"
  | "orbit-sutra"
  | "null-canister";

export type PassiveItemId =
  | "overclock-seal"
  | "hardlight-sheath"
  | "wideband-coil"
  | "echo-thread"
  | "duplex-relay"
  | "vacuum-tabi";

export type FusionId =
  | "redline-ribbon"
  | "choir-of-pins"
  | "blackfile-volley"
  | "temple-circuit";

export type BuildChoiceSlotKind = "active" | "passive";
export type BuildChoiceSelectionKind = "new" | "upgrade";

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
  effectLine: string;
  fusionPathReady: boolean;
  id: string;
  itemId: ActiveWeaponId | PassiveItemId;
  label: string;
  maxLevel: number;
  nextLevel: number;
  roleLine: string;
  selectionKind: BuildChoiceSelectionKind;
  slotKind: BuildChoiceSlotKind;
};

export type BuildState = {
  activeSlots: ActiveWeaponSlot[];
  levelUpChoices: BuildChoice[];
  nextChestDefeatMilestone: number;
  passiveSlots: PassiveItemSlot[];
  pendingLevelUps: number;
  recentFusionId: FusionId | null;
};

type ActiveWeaponDefinition = {
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

type PassiveItemDefinition = {
  id: PassiveItemId;
  label: string;
  maxLevel: number;
  roleLine: string;
  statFamily:
    | "area"
    | "cooldown"
    | "damage"
    | "duration"
    | "multiplicity"
    | "pickup-radius";
};

type FusionDefinition = {
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
  chestDefeatMilestoneStep: 8,
  initialChestDefeatMilestone: 8,
  passiveSlotLimit: 6,
  starterWeaponId: "ash-lash" as const
} as const;

const activeWeaponDefinitions: Record<ActiveWeaponId, ActiveWeaponDefinition> = {
  "ash-lash": {
    attackKind: "cone",
    baseArcRadians: (120 * Math.PI) / 180,
    baseCooldownTicks: 18,
    baseDamage: 20,
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
    baseCooldownTicks: 28,
    baseDamage: 16,
    baseRangeWorldUnits: 320,
    baseTargetCount: 1,
    cooldownStepTicks: 1,
    damageStep: 3,
    id: "guided-senbon",
    label: "Guided Senbon",
    maxLevel: 8,
    rangeStepWorldUnits: 12,
    roleLine: "Auto-targeted precision burst",
    targetCountStep: 0
  },
  "shade-kunai": {
    attackKind: "fan",
    baseArcRadians: (50 * Math.PI) / 180,
    baseCooldownTicks: 26,
    baseDamage: 14,
    baseRangeWorldUnits: 260,
    baseTargetCount: 2,
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
    baseAreaRadiusWorldUnits: 84,
    baseCooldownTicks: 42,
    baseDamage: 24,
    baseRangeWorldUnits: 280,
    baseTargetCount: 3,
    cooldownStepTicks: 2,
    damageStep: 5,
    id: "cinder-arc",
    label: "Cinder Arc",
    maxLevel: 8,
    rangeStepWorldUnits: 10,
    roleLine: "Heavy lobbed strike with delayed impact",
    targetCountStep: 1
  },
  "orbit-sutra": {
    attackKind: "orbit",
    baseAreaRadiusWorldUnits: 118,
    baseCooldownTicks: 30,
    baseDamage: 12,
    baseRangeWorldUnits: 118,
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
    baseAreaRadiusWorldUnits: 96,
    baseCooldownTicks: 36,
    baseDamage: 18,
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
  }
};

const passiveItemDefinitions: Record<PassiveItemId, PassiveItemDefinition> = {
  "duplex-relay": {
    id: "duplex-relay",
    label: "Duplex Relay",
    maxLevel: 5,
    roleLine: "Extra projectiles and duplicate casts",
    statFamily: "multiplicity"
  },
  "echo-thread": {
    id: "echo-thread",
    label: "Echo Thread",
    maxLevel: 5,
    roleLine: "Longer persistence and sustained pressure",
    statFamily: "duration"
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

const fusionDefinitions: Record<FusionId, FusionDefinition> = {
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

type PassiveModifierState = {
  areaMultiplier: number;
  cooldownMultiplier: number;
  damageMultiplier: number;
  durationMultiplier: number;
  pickupRadiusMultiplier: number;
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
      deterministicHash(`${left.id}:${salt}`) - deterministicHash(`${right.id}:${salt}`)
  );

const createPassiveModifierState = (buildState: BuildState): PassiveModifierState => {
  const modifiers: PassiveModifierState = {
    areaMultiplier: 1,
    cooldownMultiplier: 1,
    damageMultiplier: 1,
    durationMultiplier: 1,
    pickupRadiusMultiplier: 1,
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
      case "wideband-coil":
        modifiers.areaMultiplier *= 1 + 0.12 * passiveSlot.level;
        break;
      case "echo-thread":
        modifiers.durationMultiplier *= 1 + 0.16 * passiveSlot.level;
        modifiers.areaMultiplier *= 1 + 0.04 * passiveSlot.level;
        break;
      case "duplex-relay":
        modifiers.targetCountBonus += Math.max(1, passiveSlot.level - (passiveSlot.level > 3 ? 1 : 0));
        break;
      case "vacuum-tabi":
        modifiers.pickupRadiusMultiplier *= 1 + 0.2 * passiveSlot.level;
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
  nextChestDefeatMilestone: buildSystemContract.initialChestDefeatMilestone,
  passiveSlots: [],
  pendingLevelUps: 0,
  recentFusionId: null
});

export const normalizeBuildState = (buildState: Partial<BuildState> | undefined): BuildState => {
  const initialBuildState = createInitialBuildState();

  return {
    activeSlots:
      buildState?.activeSlots?.map((activeSlot) => ({
        fusionId: activeSlot.fusionId ?? null,
        lastAttackTick: activeSlot.lastAttackTick ?? null,
        level: Math.max(1, Math.min(activeSlot.level ?? 1, getActiveWeaponDefinition(activeSlot.weaponId).maxLevel)),
        weaponId: activeSlot.weaponId
      })) ?? initialBuildState.activeSlots,
    levelUpChoices: buildState?.levelUpChoices ?? [],
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

  return {
    areaRadiusWorldUnits: Math.round(baseAreaRadius * passiveModifiers.areaMultiplier),
    arcRadians:
      weaponDefinition.baseArcRadians !== undefined
        ? weaponDefinition.baseArcRadians
        : null,
    attackKind: weaponDefinition.attackKind,
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
    visibleTicks: Math.max(6, Math.round(baseVisibleTicks * passiveModifiers.durationMultiplier)),
    weaponId: activeSlot.weaponId
  };
};

export const resolvePickupRadiusMultiplier = (buildState: BuildState) =>
  createPassiveModifierState(buildState).pickupRadiusMultiplier;

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
    effectLine: `Unlock ${weaponDefinition.roleLine.toLowerCase()}.`,
    fusionPathReady: readyFusion !== null,
    id: `choice:active:new:${weaponId}`,
    itemId: weaponId,
    label: weaponDefinition.label,
    maxLevel: weaponDefinition.maxLevel,
    nextLevel: 1,
    roleLine: weaponDefinition.roleLine,
    selectionKind: "new",
    slotKind: "active"
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
    effectLine: `Unlock ${passiveDefinition.roleLine.toLowerCase()}.`,
    fusionPathReady: opensFusionPath,
    id: `choice:passive:new:${passiveItemId}`,
    itemId: passiveItemId,
    label: passiveDefinition.label,
    maxLevel: passiveDefinition.maxLevel,
    nextLevel: 1,
    roleLine: passiveDefinition.roleLine,
    selectionKind: "new",
    slotKind: "passive"
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
    effectLine: `Lv ${activeSlot.level} -> ${nextLevel}: faster cadence and stronger pressure.`,
    fusionPathReady: fusionReady,
    id: `choice:active:upgrade:${activeSlot.weaponId}`,
    itemId: activeSlot.weaponId,
    label: resolveBuildDisplayLabel(buildState, activeSlot),
    maxLevel: weaponDefinition.maxLevel,
    nextLevel,
    roleLine: weaponDefinition.roleLine,
    selectionKind: "upgrade",
    slotKind: "active"
  };
};

const createPassiveUpgradeChoice = (passiveSlot: PassiveItemSlot): BuildChoice => {
  const passiveDefinition = getPassiveItemDefinition(passiveSlot.passiveId);
  const nextLevel = Math.min(passiveDefinition.maxLevel, passiveSlot.level + 1);

  return {
    currentLevel: passiveSlot.level,
    effectLine: `Lv ${passiveSlot.level} -> ${nextLevel}: deepen ${passiveDefinition.statFamily.replace("-", " ")} support.`,
    fusionPathReady: false,
    id: `choice:passive:upgrade:${passiveSlot.passiveId}`,
    itemId: passiveSlot.passiveId,
    label: passiveDefinition.label,
    maxLevel: passiveDefinition.maxLevel,
    nextLevel,
    roleLine: passiveDefinition.roleLine,
    selectionKind: "upgrade",
    slotKind: "passive"
  };
};

const takeDeterministicSlice = <T extends { id: string }>(
  items: readonly T[],
  count: number,
  salt: string
) => sortDeterministically(items, salt).slice(0, count);

export const resolveLevelUpChoices = (
  buildState: BuildState,
  tick: number
): BuildChoice[] => {
  const ownedActiveIds = new Set(buildState.activeSlots.map((activeSlot) => activeSlot.weaponId));
  const ownedPassiveIds = new Set(buildState.passiveSlots.map((passiveSlot) => passiveSlot.passiveId));
  const unownedActives = (Object.keys(activeWeaponDefinitions) as ActiveWeaponId[])
    .filter((weaponId) => !ownedActiveIds.has(weaponId))
    .map((weaponId) => createActiveUnlockChoice(buildState, weaponId));
  const unownedPassives = (Object.keys(passiveItemDefinitions) as PassiveItemId[])
    .filter((passiveItemId) => !ownedPassiveIds.has(passiveItemId))
    .map((passiveItemId) => createPassiveUnlockChoice(buildState, passiveItemId));
  const activeUpgrades = buildState.activeSlots
    .filter(
      (activeSlot) => activeSlot.level < getActiveWeaponDefinition(activeSlot.weaponId).maxLevel
    )
    .map((activeSlot) => createActiveUpgradeChoice(buildState, activeSlot));
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

  if (buildState.activeSlots.length < buildSystemContract.activeSlotLimit) {
    for (const choice of takeDeterministicSlice(unownedActives, preferredNewChoices, `active:${tick}`)) {
      pushUniqueChoice(choice);
    }
  }

  if (
    choices.length < preferredNewChoices &&
    buildState.passiveSlots.length < buildSystemContract.passiveSlotLimit
  ) {
    for (const choice of takeDeterministicSlice(unownedPassives, preferredNewChoices, `passive:${tick}`)) {
      pushUniqueChoice(choice);
    }
  }

  const upgradeCandidates = takeDeterministicSlice(
    [...activeUpgrades, ...passiveUpgrades],
    3,
    `upgrade:${tick}:${totalOwned}`
  );

  for (const choice of upgradeCandidates) {
    if (choices.length >= 3) {
      break;
    }

    pushUniqueChoice(choice);
  }

  if (choices.length < 3 && buildState.activeSlots.length < buildSystemContract.activeSlotLimit) {
    for (const choice of takeDeterministicSlice(unownedActives, 3, `fallback-active:${tick}`)) {
      if (choices.length >= 3) {
        break;
      }
      pushUniqueChoice(choice);
    }
  }

  if (choices.length < 3 && buildState.passiveSlots.length < buildSystemContract.passiveSlotLimit) {
    for (const choice of takeDeterministicSlice(unownedPassives, 3, `fallback-passive:${tick}`)) {
      if (choices.length >= 3) {
        break;
      }
      pushUniqueChoice(choice);
    }
  }

  return choices.slice(0, 3);
};

const syncChoicesIfNeeded = (buildState: BuildState, tick: number): BuildState => {
  if (buildState.pendingLevelUps <= 0 || buildState.levelUpChoices.length > 0) {
    return buildState;
  }

  return {
    ...buildState,
    levelUpChoices: resolveLevelUpChoices(buildState, tick)
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

    if (choice.selectionKind === "new") {
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
