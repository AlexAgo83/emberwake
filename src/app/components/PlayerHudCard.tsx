import "./PlayerHudCard.css";

import type { ActiveWeaponId, FusionId, PassiveItemId } from "@game";
import { buildSystemContract } from "@game";

import { SkillIcon } from "./SkillIcon";

type PlayerHudSlot = {
  id: ActiveWeaponId | FusionId | PassiveItemId;
  isFused?: boolean;
  isFusionReady?: boolean;
  label: string;
  level: number;
  maxLevel: number;
};

type PlayerHudCardProps = {
  buildActives?: PlayerHudSlot[];
  buildPassives?: PlayerHudSlot[];
  currentLevel: number;
  currentXp: number;
  fps: number;
  goldCollected: number;
  isMobile: boolean;
  nextLevelXpRequired: number;
  phaseLabel: string;
  playerHealth: number;
  playerHealthMax: number;
  playerName: string;
  playerPosition: {
    x: number;
    y: number;
  };
};

export function PlayerHudCard({
  buildActives = [],
  buildPassives = [],
  currentLevel,
  currentXp,
  fps,
  goldCollected,
  isMobile,
  nextLevelXpRequired,
  phaseLabel,
  playerHealth,
  playerHealthMax,
  playerName,
  playerPosition
}: PlayerHudCardProps) {
  const roundedLevel = Math.max(1, Math.round(currentLevel));
  const roundedHealth = Math.max(0, Math.round(playerHealth));
  const roundedHealthMax = Math.max(1, Math.round(playerHealthMax));
  const roundedXp = Math.max(0, Math.round(currentXp));
  const roundedNextLevelXp = Math.max(1, Math.round(nextLevelXpRequired));
  const roundedPositionX = Math.round(playerPosition.x);
  const roundedPositionY = Math.round(playerPosition.y);
  const hpProgressPercent = Math.min(100, Math.round((roundedHealth / roundedHealthMax) * 100));
  const xpProgressPercent = Math.min(100, Math.round((roundedXp / roundedNextLevelXp) * 100));
  const activeSlots: Array<PlayerHudSlot | null> = Array.from(
    { length: buildSystemContract.activeSlotLimit },
    (_, index) => buildActives[index] ?? null
  );
  const passiveSlots: Array<PlayerHudSlot | null> = Array.from(
    { length: buildSystemContract.passiveSlotLimit },
    (_, index) => buildPassives[index] ?? null
  );

  return (
    <section className="player-hud" aria-label="Player HUD" data-testid="player-hud">
      <div className="player-hud__progression">
        <div className="player-hud__identity">
          <div>
            <p className="player-hud__eyebrow">Level {roundedLevel}</p>
            <p className="player-hud__name">{playerName}</p>
          </div>
        </div>

        <div className="player-hud__rail">
          <div className="player-hud__rail-header">
            <span>HP</span>
            <strong>
              {roundedHealth} / {roundedHealthMax}
            </strong>
          </div>
          <div className="player-hud__bar" aria-hidden="true">
            <strong className="player-hud__bar-value">
              {roundedHealth} / {roundedHealthMax}
            </strong>
            <span
              className="player-hud__bar-fill player-hud__bar-fill--health"
              style={{ width: `${hpProgressPercent}%` }}
            />
          </div>
        </div>

        <div className="player-hud__rail">
          <div className="player-hud__rail-header">
            <span>XP</span>
            <strong>
              {roundedXp} / {roundedNextLevelXp}
            </strong>
          </div>
          <div className="player-hud__bar" aria-hidden="true">
            <strong className="player-hud__bar-value">
              {roundedXp} / {roundedNextLevelXp}
            </strong>
            <span
              className="player-hud__bar-fill player-hud__bar-fill--xp"
              style={{ width: `${xpProgressPercent}%` }}
            />
          </div>
        </div>

        <div className="player-hud__gold-row">
          <span>Gold</span>
          <strong>
            <span className="player-hud__gold-value">
              <span aria-hidden="true" className="player-hud__coin-icon" />
              {Math.max(0, Math.round(goldCollected))}
            </span>
          </strong>
        </div>

        <div className="player-hud__position-row">
          <span>Position</span>
          <strong>
            {roundedPositionX}, {roundedPositionY}
          </strong>
        </div>
      </div>

      <p className="player-hud__fps" aria-label="Runtime FPS">
        FPS {Math.max(0, Math.round(fps))}
      </p>

      <div className="player-hud__build" aria-label="Build slots">
        <div className="player-hud__build-row">
          <p className="player-hud__build-title">Actives</p>
          <div className="player-hud__slot-strip">
            {activeSlots.map((activeSlot, index) => (
              <div
                className="player-hud__slot"
                data-state={
                  activeSlot
                    ? activeSlot.isFused
                      ? "fused"
                      : activeSlot.isFusionReady
                        ? "ready"
                        : "filled"
                    : "empty"
                }
                key={`active-${index}`}
                title={
                  activeSlot
                    ? `${activeSlot.label} Lv ${activeSlot.level}/${activeSlot.maxLevel}`
                    : "Empty active slot"
                }
              >
                {activeSlot ? (
                  <SkillIcon
                    category={activeSlot.isFused ? "fusion" : "active"}
                    id={activeSlot.id}
                    label={activeSlot.label}
                    size="sm"
                  />
                ) : (
                  <span className="player-hud__slot-glyph" aria-hidden="true">
                    ·
                  </span>
                )}
                {activeSlot ? (
                  <span className="player-hud__slot-badge">
                    {activeSlot.level}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="player-hud__build-row">
          <p className="player-hud__build-title">Passives</p>
          <div className="player-hud__slot-strip">
            {passiveSlots.map((passiveSlot, index) => (
              <div
                className="player-hud__slot player-hud__slot--passive"
                data-state={passiveSlot ? "filled" : "empty"}
                key={`passive-${index}`}
                title={
                  passiveSlot
                    ? `${passiveSlot.label} Lv ${passiveSlot.level}/${passiveSlot.maxLevel}`
                    : "Empty passive slot"
                }
              >
                {passiveSlot ? (
                  <SkillIcon
                    category="passive"
                    id={passiveSlot.id}
                    label={passiveSlot.label}
                    size="sm"
                  />
                ) : (
                  <span className="player-hud__slot-glyph" aria-hidden="true">
                    ·
                  </span>
                )}
                {passiveSlot ? (
                  <span className="player-hud__slot-badge">
                    {passiveSlot.level}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
