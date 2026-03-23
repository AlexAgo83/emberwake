import "./PlayerHudCard.css";

type PlayerHudCardProps = {
  buildActives?: Array<{
    id: string;
    isFusionReady: boolean;
    isFused: boolean;
    label: string;
    level: number;
    maxLevel: number;
  }>;
  buildPassives?: Array<{
    id: string;
    label: string;
    level: number;
    maxLevel: number;
  }>;
  currentLevel: number;
  currentXp: number;
  fps: number;
  goldCollected: number;
  isMobile: boolean;
  nextLevelXpRequired: number;
  playerHealth: number;
  playerName: string;
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
  playerHealth,
  playerName
}: PlayerHudCardProps) {
  const roundedLevel = Math.max(1, Math.round(currentLevel));
  const roundedHealth = Math.max(0, Math.round(playerHealth));
  const roundedXp = Math.max(0, Math.round(currentXp));
  const roundedNextLevelXp = Math.max(1, Math.round(nextLevelXpRequired));
  const xpProgressPercent = Math.min(100, Math.round((roundedXp / roundedNextLevelXp) * 100));

  return (
    <section className="player-hud" aria-label="Player HUD" data-testid="player-hud">
      <div className="player-hud__header">
        <div>
          <p className="player-hud__eyebrow">Field status</p>
          <p className="player-hud__name">{playerName}</p>
        </div>
        <p className="player-hud__level-chip">Lv {roundedLevel}</p>
      </div>

      <div className="player-hud__rail">
        <div className="player-hud__rail-header">
          <span>HP</span>
          <strong>{roundedHealth}</strong>
        </div>
        <div className="player-hud__bar" aria-hidden="true">
          <span className="player-hud__bar-fill player-hud__bar-fill--health" style={{ width: `${Math.min(100, roundedHealth)}%` }} />
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
          <span
            className="player-hud__bar-fill player-hud__bar-fill--xp"
            style={{ width: `${xpProgressPercent}%` }}
          />
        </div>
      </div>

      <div className="player-hud__metrics">
        <div className="player-hud__metric">
          <span>Gold</span>
          <strong>{Math.max(0, Math.round(goldCollected))}</strong>
        </div>
        <div className="player-hud__metric">
          <span>FPS</span>
          <strong>{Math.max(0, Math.round(fps))}</strong>
        </div>
      </div>

      {buildActives.length > 0 ? (
        <div className="player-hud__build">
          <p className="player-hud__build-title">Actives</p>
          <div className="player-hud__build-grid">
            {buildActives.map((activeWeapon) => (
              <span
                className="player-hud__build-chip"
                data-state={
                  activeWeapon.isFused ? "fused" : activeWeapon.isFusionReady ? "ready" : "base"
                }
                key={activeWeapon.id}
                title={`${activeWeapon.label} Lv ${activeWeapon.level}/${activeWeapon.maxLevel}`}
              >
                <strong>{activeWeapon.label}</strong>
                <small>
                  Lv {activeWeapon.level}/{activeWeapon.maxLevel}
                </small>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {buildPassives.length > 0 ? (
        <div className="player-hud__build">
          <p className="player-hud__build-title">Passives</p>
          <div className="player-hud__build-grid">
            {buildPassives.map((passiveItem) => (
              <span
                className="player-hud__build-chip player-hud__build-chip--passive"
                key={passiveItem.id}
                title={`${passiveItem.label} Lv ${passiveItem.level}/${passiveItem.maxLevel}`}
              >
                <strong>{passiveItem.label}</strong>
                <small>
                  Lv {passiveItem.level}/{passiveItem.maxLevel}
                </small>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {isMobile ? (
        <p className="player-hud__hint" data-testid="player-hud-hint">
          Glissez pour guider le deplacement.
        </p>
      ) : null}
    </section>
  );
}
