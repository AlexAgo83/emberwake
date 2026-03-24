import {
  creatureCodexEntries,
  listActiveWeaponDefinitions,
  listFusionDefinitions,
  listPassiveItemDefinitions
} from "@game";

import type { CodexProgressionSnapshot } from "./AppMetaScenePanel";
import { SkillIcon } from "./SkillIcon";

type CodexArchiveSceneProps = {
  progressionSnapshot: CodexProgressionSnapshot | null;
  scene: "bestiary" | "grimoire";
};

export function CodexArchiveScene({ progressionSnapshot, scene }: CodexArchiveSceneProps) {
  const discoveredActiveWeaponIds = new Set(progressionSnapshot?.discoveredActiveWeaponIds ?? ["ash-lash"]);
  const discoveredPassiveItemIds = new Set(progressionSnapshot?.discoveredPassiveItemIds ?? []);
  const discoveredFusionIds = new Set(progressionSnapshot?.discoveredFusionIds ?? []);
  const discoveredCreatureIds = new Set(progressionSnapshot?.discoveredCreatureIds ?? []);
  const codexUnknownCount = Math.max(
    0,
    listActiveWeaponDefinitions().length +
      listPassiveItemDefinitions().length +
      listFusionDefinitions().length -
      discoveredActiveWeaponIds.size -
      discoveredPassiveItemIds.size -
      discoveredFusionIds.size
  );

  if (scene === "grimoire") {
    return (
      <div className="app-meta-scene__codex-grid">
        <section className="app-meta-scene__codex-section" aria-labelledby="grimoire-actives">
          <div className="app-meta-scene__codex-section-header">
            <p className="app-meta-scene__eyebrow" id="grimoire-actives">
              Active skills
            </p>
            <span className="app-meta-scene__codex-count">
              {discoveredActiveWeaponIds.size}/{listActiveWeaponDefinitions().length}
            </span>
          </div>
          <div className="app-meta-scene__codex-cards">
            {listActiveWeaponDefinitions().map((weaponDefinition) => {
              const isKnown = discoveredActiveWeaponIds.has(weaponDefinition.id);

              return (
                <article
                  className="app-meta-scene__codex-card"
                  data-state={isKnown ? "known" : "unknown"}
                  key={weaponDefinition.id}
                >
                  <div className="app-meta-scene__codex-icon" aria-hidden="true">
                    {isKnown ? (
                      <SkillIcon
                        category="active"
                        id={weaponDefinition.id}
                        label={weaponDefinition.label}
                        size="md"
                      />
                    ) : (
                      "??"
                    )}
                  </div>
                  <div className="app-meta-scene__codex-copy">
                    <h3>{isKnown ? weaponDefinition.label : "Undiscovered technique"}</h3>
                    <p>{isKnown ? weaponDefinition.roleLine : "A field pattern remains sealed."}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="app-meta-scene__codex-section" aria-labelledby="grimoire-passives">
          <div className="app-meta-scene__codex-section-header">
            <p className="app-meta-scene__eyebrow" id="grimoire-passives">
              Passive seals
            </p>
            <span className="app-meta-scene__codex-count">
              {discoveredPassiveItemIds.size}/{listPassiveItemDefinitions().length}
            </span>
          </div>
          <div className="app-meta-scene__codex-cards">
            {listPassiveItemDefinitions().map((passiveDefinition) => {
              const isKnown = discoveredPassiveItemIds.has(passiveDefinition.id);

              return (
                <article
                  className="app-meta-scene__codex-card"
                  data-state={isKnown ? "known" : "unknown"}
                  key={passiveDefinition.id}
                >
                  <div className="app-meta-scene__codex-icon" aria-hidden="true">
                    {isKnown ? (
                      <SkillIcon
                        category="passive"
                        id={passiveDefinition.id}
                        label={passiveDefinition.label}
                        size="md"
                      />
                    ) : (
                      "??"
                    )}
                  </div>
                  <div className="app-meta-scene__codex-copy">
                    <h3>{isKnown ? passiveDefinition.label : "Undiscovered seal"}</h3>
                    <p>
                      {isKnown
                        ? passiveDefinition.roleLine
                        : "An unknown modifier family waits in the field."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className="app-meta-scene__codex-section" aria-labelledby="grimoire-fusions">
          <div className="app-meta-scene__codex-section-header">
            <p className="app-meta-scene__eyebrow" id="grimoire-fusions">
              Fusion paths
            </p>
            <span className="app-meta-scene__codex-count">
              {discoveredFusionIds.size}/{listFusionDefinitions().length}
            </span>
          </div>
          <div className="app-meta-scene__codex-cards">
            {listFusionDefinitions().map((fusionDefinition) => {
              const isKnown = discoveredFusionIds.has(fusionDefinition.fusionId);

              return (
                <article
                  className="app-meta-scene__codex-card"
                  data-state={isKnown ? "known" : "unknown"}
                  key={fusionDefinition.fusionId}
                >
                  <div className="app-meta-scene__codex-icon" aria-hidden="true">
                    {isKnown ? (
                      <SkillIcon
                        category="fusion"
                        id={fusionDefinition.fusionId}
                        label={fusionDefinition.label}
                        size="md"
                      />
                    ) : (
                      "??"
                    )}
                  </div>
                  <div className="app-meta-scene__codex-copy">
                    <h3>{isKnown ? fusionDefinition.label : "Undiscovered fusion"}</h3>
                    <p>
                      {isKnown
                        ? fusionDefinition.roleLine
                        : "A higher-order path remains redacted until the field reveals it."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        {codexUnknownCount > 0 ? (
          <div className="app-meta-scene__subsurface app-meta-scene__subsurface--archive">
            <p className="app-meta-scene__lead">
              {codexUnknownCount} archive entr{codexUnknownCount > 1 ? "ies remain" : "y remains"} sealed.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="app-meta-scene__codex-cards app-meta-scene__codex-cards--bestiary">
        {creatureCodexEntries.map((creatureEntry) => {
          const isKnown = discoveredCreatureIds.has(creatureEntry.codexId);
          const defeatCount = progressionSnapshot?.creatureDefeatCounts?.[creatureEntry.codexId] ?? 0;

          return (
            <article
              className="app-meta-scene__codex-card"
              data-state={isKnown ? "known" : "unknown"}
              key={creatureEntry.codexId}
            >
              <div className="app-meta-scene__codex-icon" aria-hidden="true">
                {isKnown ? creatureEntry.label.slice(0, 2).toUpperCase() : "??"}
              </div>
              <div className="app-meta-scene__codex-copy">
                <h3>{isKnown ? creatureEntry.label : "Unknown creature"}</h3>
                <p>
                  {isKnown
                    ? creatureEntry.roleLine
                    : "A faint archive trace suggests another form remains hidden."}
                </p>
                {isKnown ? (
                  <dl className="app-meta-scene__codex-stats">
                    <div>
                      <dt>Defeats</dt>
                      <dd>{defeatCount}</dd>
                    </div>
                    <div>
                      <dt>Archive note</dt>
                      <dd>{creatureEntry.shellLine}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="app-meta-scene__codex-unknown-line">
                    Encounter the creature to fully register it here.
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
