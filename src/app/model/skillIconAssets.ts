import type { ActiveWeaponId, FusionId, PassiveItemId } from "@game";

export type SkillIconId = ActiveWeaponId | PassiveItemId | FusionId;

export const resolveSkillIconAssetId = (id: SkillIconId) => `shell.skill.${id}.runtime`;
