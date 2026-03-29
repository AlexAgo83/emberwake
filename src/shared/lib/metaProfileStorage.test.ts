import { beforeEach, describe, expect, it } from "vitest";

import { createDefaultMetaProfile } from "../../app/model/metaProgression";
import type { MetaProfile } from "../../app/model/metaProgression";
import {
  metaProfileContract,
  readMetaProfile,
  writeMetaProfile
} from "./metaProfileStorage";

describe("metaProfileStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips the persistent meta profile through local storage", () => {
    const metaProfile: MetaProfile = {
      archive: {
        creatureDefeatCounts: {
          "watchglass-prime": 2
        },
        discoveredActiveWeaponIds: ["ash-lash", "chain-lightning"],
        discoveredCreatureIds: ["watchglass-prime"],
        discoveredFusionIds: ["redline-ribbon"],
        discoveredPassiveItemIds: ["overclock-seal"]
      },
      goldBalance: 88,
      purchasedShopUnlockIds: ["second-wave-skills"],
      talentRanks: {
        "gold-gain": 1,
        "max-health": 2,
        "move-speed": 0,
        "pickup-radius": 1,
        shield: 0,
        "xp-gain": 3
      },
      worldProgress: createDefaultMetaProfile().worldProgress
    };

    writeMetaProfile(metaProfile);

    expect(readMetaProfile(createDefaultMetaProfile())).toEqual(metaProfile);
  });

  it("invalidates persisted meta profile data when the schema version changes", () => {
    const fallbackProfile = createDefaultMetaProfile();

    window.localStorage.setItem(
      metaProfileContract.storageKey,
      JSON.stringify({
        metaProfile: {
          goldBalance: 900
        },
        version: metaProfileContract.storageVersion + 1
      })
    );

    expect(readMetaProfile(fallbackProfile)).toEqual(fallbackProfile);
  });
});
