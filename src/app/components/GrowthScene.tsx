import "./GrowthScene.css";

import {
  canPurchaseShopUnlock,
  canPurchaseTalentRank,
  resolveTalentNextCost,
  shopUnlockCatalog,
  talentCatalog
} from "../model/metaProgression";
import type { MetaProfile, MetaTalentId, ShopUnlockId } from "../model/metaProgression";

type GrowthSceneProps = {
  metaProfile: MetaProfile;
  onPurchaseShopUnlock: (unlockId: ShopUnlockId) => void;
  onPurchaseTalentRank: (talentId: MetaTalentId) => void;
};

export function GrowthScene({
  metaProfile,
  onPurchaseShopUnlock,
  onPurchaseTalentRank
}: GrowthSceneProps) {
  return (
    <div className="app-meta-scene__scene-body app-meta-scene__scene-body--scroll">
      <div className="app-meta-scene__growth-grid">
        <section className="app-meta-scene__growth-section" aria-labelledby="growth-shop">
          <div className="app-meta-scene__codex-section-header">
            <p className="app-meta-scene__eyebrow" id="growth-shop">
              Shop
            </p>
            <span className="app-meta-scene__codex-count">
              {metaProfile.purchasedShopUnlockIds.length}/{shopUnlockCatalog.length} owned
            </span>
          </div>
          <div className="app-meta-scene__growth-cards">
            {shopUnlockCatalog.map((unlockDefinition) => {
              const isOwned = metaProfile.purchasedShopUnlockIds.includes(unlockDefinition.id);
              const canPurchase = canPurchaseShopUnlock(metaProfile, unlockDefinition.id);

              return (
                <article
                  className="app-meta-scene__growth-card"
                  data-state={isOwned ? "owned" : "locked"}
                  key={unlockDefinition.id}
                >
                  <div className="app-meta-scene__growth-card-copy">
                    <div className="app-meta-scene__growth-card-header">
                      <h3>{unlockDefinition.label}</h3>
                      <span className="app-meta-scene__growth-cost">
                        {isOwned ? "Owned" : `${unlockDefinition.cost} gold`}
                      </span>
                    </div>
                    <p>{unlockDefinition.description}</p>
                  </div>
                  <button
                    className="shell-control shell-control--button"
                    disabled={!canPurchase || isOwned}
                    onClick={() => {
                      onPurchaseShopUnlock(unlockDefinition.id);
                    }}
                    type="button"
                  >
                    {isOwned ? "Owned" : "Unlock"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
        <section className="app-meta-scene__growth-section" aria-labelledby="growth-talents">
          <div className="app-meta-scene__codex-section-header">
            <p className="app-meta-scene__eyebrow" id="growth-talents">
              Talents
            </p>
            <span className="app-meta-scene__codex-count">Escalating costs</span>
          </div>
          <div className="app-meta-scene__growth-cards">
            {talentCatalog.map((talentDefinition) => {
              const currentRank = metaProfile.talentRanks[talentDefinition.id];
              const nextCost = resolveTalentNextCost(metaProfile, talentDefinition.id);
              const canPurchase = canPurchaseTalentRank(metaProfile, talentDefinition.id);

              return (
                <article
                  className="app-meta-scene__growth-card"
                  data-state={nextCost === null ? "capped" : "active"}
                  key={talentDefinition.id}
                >
                  <div className="app-meta-scene__growth-card-copy">
                    <div className="app-meta-scene__growth-card-header">
                      <h3>{talentDefinition.label}</h3>
                      <span className="app-meta-scene__growth-cost">
                        Rank {currentRank}/{talentDefinition.costCurve.length}
                      </span>
                    </div>
                    <p>{talentDefinition.description}</p>
                    <p className="app-meta-scene__growth-meta">
                      {nextCost === null ? "Maxed out." : `Next rank: ${nextCost} gold`}
                    </p>
                  </div>
                  <button
                    className="shell-control shell-control--button"
                    disabled={!canPurchase || nextCost === null}
                    onClick={() => {
                      onPurchaseTalentRank(talentDefinition.id);
                    }}
                    type="button"
                  >
                    {nextCost === null ? "Maxed" : "Buy rank"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
